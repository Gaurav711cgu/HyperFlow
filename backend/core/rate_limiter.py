import time
import threading
import logging
from typing import Dict, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class BucketState:
    tokens: float
    last_refill: float
    total_allowed: int = 0
    total_rejected: int = 0


class TokenBucketRateLimiter:
    """
    Staff-Level API Gateway Pattern: Per-Entity Token Bucket Rate Limiter.

    CUSTOMER POV: 'The app keeps crashing every time there is a festival sale.'

    How Token Bucket works:
    - Each dark_store_id gets its own virtual 'bucket' with capacity=100 tokens
    - Every API request consumes 1 token
    - Tokens refill continuously at `refill_rate` tokens per second
    - If the bucket is empty, the request is immediately rejected (HTTP 429)

    WHY Token Bucket is better than Fixed Window:
    - Fixed Window: 100 req/min allows 100 requests at :59s + 100 at :01s = 200 in 2 seconds.
      This 'burst attack' can crash your backend.
    - Token Bucket: mathematically bounds the sustained rate while still allowing
      natural short bursts (e.g., a store getting 5 orders at once).

    This is the EXACT algorithm used by:
    - Amazon API Gateway (per-stage, per-key throttling)
    - Stripe API (per-API-key rate limits with burst)
    - Nginx (limit_req_zone directive)
    - Cloudflare Rate Limiting rules
    """

    def __init__(self, capacity: float = 100.0, refill_rate: float = 50.0):
        """
        Args:
            capacity: Maximum tokens (controls burst size)
            refill_rate: Tokens added per second (controls sustained throughput)
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self._buckets: Dict[str, BucketState] = {}
        self._lock = threading.Lock()

        # Background eviction to prevent unbounded memory growth
        self._shutdown = threading.Event()
        self._eviction_thread = threading.Thread(
            target=self._evict_idle_buckets, daemon=True, name="rate-limiter-eviction"
        )
        self._eviction_thread.start()

    def is_allowed(self, entity_id: str) -> bool:
        """
        Thread-safe token bucket check for a given entity (dark_store_id, user_id, etc.).

        Returns:
            True if the request is allowed (token consumed)
            False if the bucket is empty (backpressure: return HTTP 429)

        Time complexity: O(1) amortized
        """
        with self._lock:
            now = time.monotonic()

            # Lazy bucket initialization
            if entity_id not in self._buckets:
                self._buckets[entity_id] = BucketState(
                    tokens=self.capacity,
                    last_refill=now
                )

            bucket = self._buckets[entity_id]

            # Compute tokens to add based on elapsed time (continuous refill model)
            elapsed = now - bucket.last_refill
            tokens_to_add = elapsed * self.refill_rate
            bucket.tokens = min(self.capacity, bucket.tokens + tokens_to_add)
            bucket.last_refill = now

            if bucket.tokens >= 1.0:
                bucket.tokens -= 1.0
                bucket.total_allowed += 1
                return True
            else:
                bucket.total_rejected += 1
                return False

    def get_stats(self, entity_id: str) -> dict:
        """Returns rate limiting statistics for monitoring/observability."""
        with self._lock:
            bucket = self._buckets.get(entity_id)
            if not bucket:
                return {'entity_id': entity_id, 'status': 'no_traffic'}

            total = bucket.total_allowed + bucket.total_rejected
            return {
                'entity_id': entity_id,
                'current_tokens': round(bucket.tokens, 2),
                'total_allowed': bucket.total_allowed,
                'total_rejected': bucket.total_rejected,
                'rejection_rate': round(bucket.total_rejected / total, 4) if total else 0.0,
                'capacity': self.capacity,
                'refill_rate_per_sec': self.refill_rate,
            }

    def _evict_idle_buckets(self):
        """Removes buckets not accessed in >5 minutes to prevent memory leaks."""
        while not self._shutdown.is_set():
            self._shutdown.wait(timeout=300)  # Check every 5 minutes
            if self._shutdown.is_set():
                break
            cutoff = time.monotonic() - 300
            with self._lock:
                to_evict = [
                    k for k, v in self._buckets.items()
                    if v.last_refill < cutoff
                ]
                for k in to_evict:
                    del self._buckets[k]
                if to_evict:
                    logger.info(f"Rate limiter evicted {len(to_evict)} idle buckets.")

    def shutdown(self):
        self._shutdown.set()
