import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisLockManager:
    def __init__(self, redis_client=None):
        self.use_fallback = False
        if redis_client:
            self.client = redis_client
        else:
            try:
                self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=1)
                self.client.ping()
            except Exception:
                print("[RedisLockManager] Redis connection failed. Falling back to local in-memory lock manager.")
                self.use_fallback = True
                self.locks = {} # In-memory lock store: {key: owner_id}

        # Atomic release Lua script: checks if key exists and its value matches the owner_id before deletion
        self.release_lua = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """

    def acquire_lock(self, key: str, owner_id: str, ttl_ms: int = 500) -> bool:
        if self.use_fallback:
            if key in self.locks:
                return False
            self.locks[key] = owner_id
            return True
        # px defines expiration time in milliseconds, nx=True acts as SETNX
        acquired = self.client.set(key, owner_id, nx=True, px=ttl_ms)
        return bool(acquired)

    def release_lock(self, key: str, owner_id: str) -> bool:
        if self.use_fallback:
            if self.locks.get(key) == owner_id:
                self.locks.pop(key, None)
                return True
            return False
        result = self.client.eval(self.release_lua, 1, key, owner_id)
        return result == 1
