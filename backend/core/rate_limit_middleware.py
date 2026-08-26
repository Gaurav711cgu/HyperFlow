import time
import logging
from typing import Callable

logger = logging.getLogger(__name__)

try:
    from starlette.middleware.base import BaseHTTPMiddleware
    from starlette.requests import Request
    from starlette.responses import JSONResponse
    HAS_STARLETTE = True
except ImportError:
    HAS_STARLETTE = False

from .rate_limiter import TokenBucketRateLimiter


if HAS_STARLETTE:
    class RateLimitMiddleware(BaseHTTPMiddleware):
        """
        FastAPI/Starlette middleware that applies per-entity Token Bucket rate limiting.

        Extracts the `dark_store_id` from query params or X-Dark-Store-ID header.
        Applies the Token Bucket check and returns HTTP 429 with Retry-After if exhausted.
        Adds X-RateLimit-Remaining header to successful responses for client transparency.
        """

        def __init__(self, app, limiter: TokenBucketRateLimiter = None, exclude_paths: list = None):
            super().__init__(app)
            self.limiter = limiter or TokenBucketRateLimiter(capacity=100, refill_rate=50)
            self.exclude_paths = exclude_paths or ['/health', '/metrics', '/docs', '/openapi.json']

        async def dispatch(self, request: Request, call_next: Callable):
            # Skip rate limiting for health checks and internal paths
            if request.url.path in self.exclude_paths:
                return await call_next(request)

            # Extract entity ID from header or query param
            entity_id = (
                request.headers.get('X-Dark-Store-ID') or
                request.query_params.get('dark_store_id') or
                request.headers.get('X-Forwarded-For', 'global')  # Fallback to IP
            )

            if not self.limiter.is_allowed(entity_id):
                stats = self.limiter.get_stats(entity_id)
                logger.warning(f"Rate limit exceeded for entity: {entity_id} | Stats: {stats}")

                return JSONResponse(
                    status_code=429,
                    content={
                        'error': 'rate_limit_exceeded',
                        'message': f'Too many requests for store {entity_id}. Capacity: {self.limiter.capacity} req/burst.',
                        'retry_after_seconds': round(1.0 / self.limiter.refill_rate, 3),
                        'rejection_rate': stats.get('rejection_rate', 0),
                    },
                    headers={'Retry-After': str(round(1.0 / self.limiter.refill_rate, 3))}
                )

            # Request allowed: process it
            start_time = time.monotonic()
            response = await call_next(request)
            process_time = (time.monotonic() - start_time) * 1000

            # Add observability headers
            stats = self.limiter.get_stats(entity_id)
            response.headers['X-RateLimit-Remaining'] = str(int(stats.get('current_tokens', 0)))
            response.headers['X-RateLimit-Limit'] = str(int(self.limiter.capacity))
            response.headers['X-Process-Time-Ms'] = f"{process_time:.2f}"

            return response
else:
    class RateLimitMiddleware:
        def __init__(self, *args, **kwargs):
            raise ImportError("starlette is required for RateLimitMiddleware")
