import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter: 120 requests / 60 s per IP."""

    def __init__(self, app, max_requests: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self._store: dict[str, deque] = defaultdict(deque)
        self._max = max_requests
        self._window = window_seconds

    async def dispatch(self, request: Request, call_next):
        if request.url.path in {"/health", "/docs", "/redoc", "/openapi.json"}:
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        window = self._store[ip]

        while window and window[0] < now - self._window:
            window.popleft()

        if len(window) >= self._max:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMITED",
                        "message": "Too many requests. Please slow down.",
                    },
                },
            )

        window.append(now)
        return await call_next(request)
