import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("hyperflow.store_context")

class StoreContextCache:
    """
    Cross-request store context memory layer.
    Persists dark store context (profitability score, PSI status, last forecast) in Redis.
    """
    KEY_PREFIX = "hf:store:"
    TTL_SECONDS = 300

    def __init__(self, redis_client=None):
        self.redis = redis_client
        self._local_cache: Dict[str, dict] = {}

    async def set_context(self, store_id: str, context: dict) -> None:
        key = f"{self.KEY_PREFIX}{store_id}"
        self._local_cache[key] = context
        if self.redis:
            try:
                if hasattr(self.redis, "setex") and callable(self.redis.setex):
                    await self.redis.setex(key, self.TTL_SECONDS, json.dumps(context))
                elif hasattr(self.redis, "set"):
                    self.redis.set(key, json.dumps(context), ex=self.TTL_SECONDS)
            except Exception as e:
                logger.warning(f"[StoreContextCache] Redis write error: {e}")

    async def get_context(self, store_id: str) -> Optional[dict]:
        key = f"{self.KEY_PREFIX}{store_id}"
        if self.redis:
            try:
                if hasattr(self.redis, "get"):
                    raw = self.redis.get(key)
                    if raw:
                        return json.loads(raw)
            except Exception as e:
                logger.warning(f"[StoreContextCache] Redis read error: {e}")

        return self._local_cache.get(key)
