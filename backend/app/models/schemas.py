"""All Pydantic v2 schemas for request validation and API response shaping."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field, field_validator


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        schema.update(type="string")
        return schema


class ScriptIntent(str, Enum):
    COLD_EMAIL = "cold_email"
    SOCIAL_RIZZ = "social_rizz"
    CONFLICT_RESOLUTION = "conflict_resolution"
    NETWORKING_DM = "networking_dm"
    APOLOGY = "apology"
    SALARY_NEGOTIATION = "salary_negotiation"
    FOLLOW_UP = "follow_up"
    INTRODUCTION = "introduction"


class ToneLevel(str, Enum):
    FORMAL = "formal"
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    PLAYFUL = "playful"
    ASSERTIVE = "assertive"
    EMPATHETIC = "empathetic"


class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"


class UsageMetadata(BaseModel):
    copy_count: int = 0
    send_count: int = 0
    last_used_at: Optional[datetime] = None


class ScriptGenerateRequest(BaseModel):
    intent: ScriptIntent
    tone: ToneLevel
    context: str = Field(..., min_length=10, max_length=800)
    recipient_phone: Optional[str] = None

    @field_validator("context")
    @classmethod
    def context_not_placeholder(cls, v: str) -> str:
        if v.lower().strip() in {"string", "test", "...", "placeholder"}:
            raise ValueError("Please provide a real context.")
        return v


class ScriptSaveRequest(BaseModel):
    intent: ScriptIntent
    tone: ToneLevel
    context: str
    body: str
    tags: List[str] = Field(default_factory=list)
    success_rating: Optional[float] = Field(default=None, ge=0, le=5)


class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: str = Field(..., pattern=r"^[\w\.\+\-]+@[\w\-]+\.[a-z]{2,}$")
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: str
    password: str


class STKPushRequest(BaseModel):
    phone_number: str
    amount: int = Field(default=1, ge=1, le=10000)

    @field_validator("phone_number")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "").replace("-", "")
        if v.startswith("07") or v.startswith("01"):
            v = "254" + v[1:]
        if not v.startswith("254") or len(v) != 12:
            raise ValueError("Invalid Kenyan phone number format.")
        return v


class STKPushResponse(BaseModel):
    success: bool
    checkout_request_id: Optional[str] = None
    message: str


class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[dict] = None
