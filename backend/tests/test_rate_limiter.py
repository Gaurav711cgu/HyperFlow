import time
import threading
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.core.rate_limiter import TokenBucketRateLimiter


class TestTokenBucketRateLimiter:

    def test_allows_within_limit(self):
        """All requests within bucket capacity should be allowed."""
        limiter = TokenBucketRateLimiter(capacity=10, refill_rate=1)
        results = [limiter.is_allowed('store_A') for _ in range(10)]
        assert all(results), "All 10 requests should be allowed within capacity"

    def test_rejects_over_limit(self):
        """Requests exceeding bucket capacity should be rejected immediately."""
        limiter = TokenBucketRateLimiter(capacity=10, refill_rate=0.001)  # Extremely slow refill
        for _ in range(10):
            limiter.is_allowed('store_B')  # Drain the bucket
        eleventh = limiter.is_allowed('store_B')
        assert not eleventh, "11th request must be rejected when bucket is empty"

    def test_refill_after_wait(self):
        """Tokens should be replenished after waiting."""
        limiter = TokenBucketRateLimiter(capacity=5, refill_rate=100)  # 100 tokens/sec
        for _ in range(5):
            limiter.is_allowed('store_C')  # Drain completely
        assert not limiter.is_allowed('store_C'), "Bucket should be empty"

        time.sleep(0.05)  # Wait 50ms: should add ~5 tokens at 100/sec
        assert limiter.is_allowed('store_C'), "Tokens should be refilled after wait"

    def test_per_entity_isolation(self):
        """Different entity IDs must have completely independent token buckets."""
        limiter = TokenBucketRateLimiter(capacity=3, refill_rate=0.001)
        # Drain store_D
        for _ in range(3):
            limiter.is_allowed('store_D')
        # store_E should still have full capacity
        assert limiter.is_allowed('store_E'), "store_E should be unaffected by store_D exhaustion"
        assert not limiter.is_allowed('store_D'), "store_D should still be exhausted"

    def test_burst_then_sustained(self):
        """System should allow a burst then smoothly throttle."""
        limiter = TokenBucketRateLimiter(capacity=20, refill_rate=10)  # 10 tokens/sec
        # Burst: drain all 20 tokens
        burst_results = [limiter.is_allowed('store_F') for _ in range(20)]
        assert all(burst_results), "Full burst of 20 should be allowed"

        # Immediate next request should be rejected
        assert not limiter.is_allowed('store_F'), "Immediate post-burst request should be rejected"

        # After 0.1s: ~1 token added at 10/sec
        time.sleep(0.12)
        assert limiter.is_allowed('store_F'), "Sustained request after refill should succeed"

    def test_rejection_stats(self):
        """Stats should accurately track allowed and rejected counts."""
        limiter = TokenBucketRateLimiter(capacity=2, refill_rate=0.001)
        limiter.is_allowed('store_G')  # allowed
        limiter.is_allowed('store_G')  # allowed
        limiter.is_allowed('store_G')  # rejected
        limiter.is_allowed('store_G')  # rejected

        stats = limiter.get_stats('store_G')
        assert stats['total_allowed'] == 2
        assert stats['total_rejected'] == 2
        assert stats['rejection_rate'] == 0.5
