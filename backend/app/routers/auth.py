"""Auth router — register, login, me."""

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.logger import get_logger
from app.models.schemas import UserLoginRequest, UserRegisterRequest
from app.services.auth_service import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

logger = get_logger(__name__)
router = APIRouter()


@router.post("/register", summary="Create account")
async def register(payload: UserRegisterRequest, request: Request):
    db = request.app.state.db
    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "EMAIL_TAKEN", "message": "An account with this email already exists."},
        )
    phone = payload.phone
    if phone:
        phone = phone.strip().replace(" ", "").replace("-", "")
        if phone.startswith("07") or phone.startswith("01"):
            phone = "254" + phone[1:]

    doc = {
        "username": payload.username,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "phone": phone,
        "tier": "free",
        "daily_gen_count": 0,
        "daily_reset_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)
    token, expires_in = create_access_token({"sub": user_id, "email": payload.email, "tier": "free"})
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "user": {"id": user_id, "username": payload.username, "email": payload.email, "tier": "free"},
    }


@router.post("/login", summary="Authenticate and get JWT")
async def login(payload: UserLoginRequest, request: Request):
    db = request.app.state.db
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."},
        )
    user_id = str(user["_id"])
    tier = user.get("tier", "free")
    token, expires_in = create_access_token({"sub": user_id, "email": user["email"], "tier": tier})
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "user": {
            "id": user_id,
            "username": user["username"],
            "email": user["email"],
            "tier": tier,
            "phone": user.get("phone"),
        },
    }


@router.get("/me", summary="Current user profile")
async def get_me(request: Request, current_user: dict = Depends(get_current_user)):
    db = request.app.state.db
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "success": True,
        "data": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "tier": user.get("tier", "free"),
            "daily_gen_count": user.get("daily_gen_count", 0),
            "phone": user.get("phone"),
            "created_at": user["created_at"],
        },
    }
