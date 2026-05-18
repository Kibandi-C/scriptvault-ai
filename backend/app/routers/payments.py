"""M-Pesa Daraja STK Push router."""

import base64
import json
from datetime import datetime

import httpx
from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings
from app.core.logger import get_logger
from app.models.schemas import STKPushRequest, STKPushResponse
from app.utils.telecom import is_safaricom

logger = get_logger(__name__)
router = APIRouter()

_SANDBOX_BASE = "https://sandbox.safaricom.co.ke"
_PROD_BASE = "https://api.safaricom.co.ke"


def _base_url() -> str:
    return _SANDBOX_BASE if settings.MPESA_ENV == "sandbox" else _PROD_BASE


_token_cache: dict = {"token": None, "expires_at": 0}


async def _get_access_token() -> str:
    import time

    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - 60:
        return _token_cache["token"]
    creds = base64.b64encode(
        f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}".encode()
    ).decode()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{_base_url()}/oauth/v1/generate?grant_type=client_credentials",
            headers={"Authorization": f"Basic {creds}"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + int(data.get("expires_in", 3600))
    return _token_cache["token"]


def _generate_password(timestamp: str) -> str:
    raw = settings.MPESA_SHORTCODE + settings.MPESA_PASSKEY + timestamp
    return base64.b64encode(raw.encode()).decode()


@router.post("/stk-push", response_model=STKPushResponse, summary="Initiate M-Pesa STK Push")
async def stk_push(payload: STKPushRequest, request: Request):
    if not is_safaricom(payload.phone_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "NON_SAFARICOM_NUMBER",
                "message": "M-Pesa STK Push is only supported for Safaricom numbers.",
            },
        )

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    stk_payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": _generate_password(timestamp),
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": str(payload.amount),
        "PartyA": payload.phone_number,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": payload.phone_number,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": "ScriptVaultPro",
        "TransactionDesc": "ScriptVault Pro Subscription",
    }

    try:
        token = await _get_access_token()
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{_base_url()}/mpesa/stkpush/v1/processrequest",
                json=stk_payload,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                timeout=15,
            )
            data = resp.json()
    except Exception as exc:
        logger.error(f"STK Push failed: {exc}")
        if settings.ENV != "production":
            sim_id = "sim_ws_CO_" + datetime.utcnow().strftime("%H%M%S%f")
            db = request.app.state.db
            await db.transactions.insert_one({
                "checkout_request_id": sim_id,
                "phone": payload.phone_number,
                "amount": payload.amount,
                "status": "pending",
                "created_at": datetime.utcnow(),
            })
            return STKPushResponse(
                success=True,
                checkout_request_id=sim_id,
                message="[SIMULATED] Check your phone and enter M-Pesa PIN.",
            )
        raise HTTPException(status_code=502, detail="M-Pesa service unavailable.")

    if data.get("ResponseCode") != "0":
        return STKPushResponse(
            success=False,
            message=data.get("errorMessage", "STK Push failed. Please retry."),
        )

    db = request.app.state.db
    await db.transactions.insert_one({
        "checkout_request_id": data["CheckoutRequestID"],
        "phone": payload.phone_number,
        "amount": payload.amount,
        "status": "pending",
        "created_at": datetime.utcnow(),
    })

    return STKPushResponse(
        success=True,
        checkout_request_id=data["CheckoutRequestID"],
        message="STK Push sent. Enter your M-Pesa PIN to complete payment.",
    )


@router.post("/mpesa/callback", include_in_schema=False)
async def mpesa_callback(request: Request):
    body = await request.json()
    db = request.app.state.db
    try:
        stk = body["Body"]["stkCallback"]
        checkout_id = stk["CheckoutRequestID"]
        if stk["ResultCode"] == 0:
            meta = {
                item["Name"]: item["Value"]
                for item in stk.get("CallbackMetadata", {}).get("Item", [])
            }
            phone = str(meta.get("PhoneNumber", ""))
            await db.transactions.update_one(
                {"checkout_request_id": checkout_id},
                {"$set": {"status": "completed", "mpesa_receipt": meta.get("MpesaReceiptNumber")}},
            )
            await db.users.update_one(
                {"phone": phone},
                {"$set": {"tier": "pro", "upgraded_at": datetime.utcnow()}},
            )
        else:
            await db.transactions.update_one(
                {"checkout_request_id": checkout_id},
                {"$set": {"status": "failed", "result_code": stk["ResultCode"]}},
            )
    except Exception as exc:
        logger.error(f"Callback error: {exc}", exc_info=True)
    return {"ResultCode": 0, "ResultDesc": "Accepted"}


@router.get("/status/{checkout_request_id}", summary="Poll M-Pesa transaction status")
async def payment_status(checkout_request_id: str, request: Request):
    db = request.app.state.db
    txn = await db.transactions.find_one({"checkout_request_id": checkout_request_id})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    txn["_id"] = str(txn["_id"])
    return {"success": True, "data": txn}
