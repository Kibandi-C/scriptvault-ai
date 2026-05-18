"""Scripts router — generate, save, list, track usage, delete."""

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.config import settings
from app.core.logger import get_logger
from app.models.schemas import ScriptGenerateRequest, ScriptSaveRequest
from app.services.auth_service import get_current_user
from app.services.openai_service import generate_script_variations

logger = get_logger(__name__)
router = APIRouter()


def _needs_daily_reset(user: dict) -> bool:
    reset_at = user.get("daily_reset_at", datetime.utcnow())
    return (datetime.utcnow() - reset_at).total_seconds() > 86400


@router.post("/generate", summary="Generate 3 AI script variations")
async def generate_scripts(
    payload: ScriptGenerateRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    db = request.app.state.db
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if _needs_daily_reset(user):
        await db.users.update_one(
            {"_id": ObjectId(current_user["user_id"])},
            {"$set": {"daily_gen_count": 0, "daily_reset_at": datetime.utcnow()}},
        )
        user["daily_gen_count"] = 0

    tier = user.get("tier", "free")
    count = user.get("daily_gen_count", 0)

    if tier == "free" and count >= settings.FREE_DAILY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FREE_LIMIT_REACHED",
                "message": f"Free tier limit of {settings.FREE_DAILY_LIMIT} daily generations reached. Upgrade to Pro.",
            },
        )

    variations = await generate_script_variations(
        intent=payload.intent.value,
        tone=payload.tone.value,
        context=payload.context,
    )

    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$inc": {"daily_gen_count": 1}},
    )

    daily_remaining = (
        max(0, settings.FREE_DAILY_LIMIT - count - 1) if tier == "free" else None
    )

    return {
        "success": True,
        "data": {
            "variations": variations,
            "intent": payload.intent.value,
            "tone": payload.tone.value,
            "daily_remaining": daily_remaining,
        },
    }


@router.post("/save", summary="Save a script to the Vault")
async def save_script(
    payload: ScriptSaveRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    db = request.app.state.db
    doc = {
        "user_id": current_user["user_id"],
        "intent": payload.intent.value,
        "tone": payload.tone.value,
        "context": payload.context,
        "body": payload.body,
        "tags": payload.tags,
        "success_rating": payload.success_rating,
        "usage": {"copy_count": 0, "send_count": 0, "last_used_at": None},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.scripts.insert_one(doc)
    return {"success": True, "data": {"id": str(result.inserted_id)}}


@router.get("/", summary="List saved scripts")
async def list_scripts(
    request: Request,
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    skip: int = 0,
):
    db = request.app.state.db
    cursor = (
        db.scripts.find({"user_id": current_user["user_id"]}, sort=[("created_at", -1)])
        .skip(skip)
        .limit(limit)
    )
    scripts = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        scripts.append(doc)
    return {"success": True, "data": scripts}


@router.patch("/{script_id}/usage", summary="Track copy/send events or update rating")
async def track_usage(
    script_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(script_id):
        raise HTTPException(status_code=400, detail="Invalid script ID.")

    db = request.app.state.db
    body = await request.json()
    event = body.get("event")
    rating = body.get("rating")

    update: dict = {"$set": {"updated_at": datetime.utcnow()}}
    if event == "copy":
        update.setdefault("$inc", {})["usage.copy_count"] = 1
        update["$set"]["usage.last_used_at"] = datetime.utcnow()
    elif event == "send":
        update.setdefault("$inc", {})["usage.send_count"] = 1
        update["$set"]["usage.last_used_at"] = datetime.utcnow()
    if rating is not None:
        update["$set"]["success_rating"] = float(rating)

    result = await db.scripts.update_one(
        {"_id": ObjectId(script_id), "user_id": current_user["user_id"]}, update
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Script not found.")
    return {"success": True}


@router.delete("/{script_id}", summary="Delete a script")
async def delete_script(
    script_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(script_id):
        raise HTTPException(status_code=400, detail="Invalid script ID.")

    db = request.app.state.db
    result = await db.scripts.delete_one(
        {"_id": ObjectId(script_id), "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Script not found.")
    return {"success": True}
