"""ScriptVault AI — FastAPI entry point."""

from contextlib import asynccontextmanager
from typing import AsyncIterator

import motor.motor_asyncio
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logger import get_logger
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.routers import auth, payments, scripts

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logger.info("⚡  ScriptVault API starting up...")
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGO_URI, serverSelectionTimeoutMS=5000
    )
    try:
        await client.admin.command("ping")
        logger.info("✅  MongoDB connected.")
    except Exception as exc:
        logger.error(f"❌  MongoDB connection failed: {exc}")
        raise
    app.state.mongo_client = client
    app.state.db = client[settings.MONGO_DB_NAME]
    yield
    logger.info("🛑  Shutting down. Closing MongoDB connection.")
    client.close()


def create_app() -> FastAPI:
    application = FastAPI(
        title="ScriptVault AI",
        description="AI-generated scripts for every social situation.",
        version="0.1.0",
        docs_url="/docs" if settings.ENV != "production" else None,
        redoc_url="/redoc" if settings.ENV != "production" else None,
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.add_middleware(RateLimiterMiddleware)
    application.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
    application.include_router(scripts.router, prefix="/api/v1/scripts", tags=["Scripts"])
    application.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
    return application


app = create_app()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred."},
        },
    )


@app.get("/health", tags=["System"])
async def health_check(request: Request):
    db_ok = False
    try:
        await request.app.state.db.command("ping")
        db_ok = True
    except Exception:
        pass
    return {
        "success": True,
        "data": {
            "status": "healthy" if db_ok else "degraded",
            "version": app.version,
            "database": "connected" if db_ok else "unreachable",
        },
    }
