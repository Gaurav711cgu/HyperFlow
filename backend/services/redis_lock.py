import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisLockManager:
    def __init__(self, redis_client=None):
        if redis_client:
            self.client = redis_client
        else:
            try:
                # Add decode_responses=True to handle string formatting
                self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=2)
                self.client.ping()
            except Exception:
                self.client = None
                print("Redis server not available. Lock Manager will operate in hybrid-mock mode.")

        # Atomic release Lua script: checks if key exists and its value matches the owner_id before deletion
        self.release_lua = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """

    def acquire_lock(self, key: str, owner_id: str, ttl_ms: int = 500) -> bool:
        if not self.client:
            # Fallback for mock environments (e.g. serverless or Vercel client demo)
            return True
        try:
            # px defines expiration time in milliseconds, nx=True acts as SETNX
            acquired = self.client.set(key, owner_id, nx=True, px=ttl_ms)
            return bool(acquired)
        except Exception as e:
            print(f"Redis lock acquire failure: {e}. Defaulting to safe fallback.")
            return True

    def release_lock(self, key: str, owner_id: str) -> bool:
        if not self.client:
            return True
        try:
            result = self.client.eval(self.release_lua, 1, key, owner_id)
            return result == 1
        except Exception as e:
            print(f"Redis lock release failure: {e}. Defaulting to safe fallback.")
            return True
