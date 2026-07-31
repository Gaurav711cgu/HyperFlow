import os
import time
import uuid
import json
import jwt
from typing import Optional, Dict, Any, List
from threading import Lock

from backend.services.redis_lock import RedisLockManager

JWT_SECRET = os.getenv("JWT_SECRET", "hyperflow_enterprise_jwt_secret_key_2026")
JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


class TokenManager:
    """
    Enterprise Dual-Token & JTI Revocation Blacklist Manager.
    Uses Redis for real-time O(1) blacklist lookups with TTL auto-purge.
    Falls back gracefully to a thread-safe in-memory store if Redis is unavailable.
    """

    def __init__(self, redis_client=None):
        self.secret_key = JWT_SECRET
        self.algorithm = JWT_ALGORITHM
        self.lock_manager = RedisLockManager(redis_client=redis_client)
        self.redis = getattr(self.lock_manager, 'client', None)
        self.use_fallback = getattr(self.lock_manager, 'use_fallback', True)

        # In-memory fallbacks when Redis is offline
        self._memory_blacklist: Dict[str, float] = {}  # {jti: exp_timestamp}
        self._memory_user_jtis: Dict[str, List[tuple[str, float]]] = {}  # {sub: [(jti, exp_timestamp)]}
        self._mem_lock = Lock()

    # ---------------------------------------------------------------------------
    # Token Generation
    # ---------------------------------------------------------------------------
    def create_access_token(
        self,
        sub: str,
        role: str = "user",
        scopes: Optional[List[str]] = None,
        custom_jti: Optional[str] = None
    ) -> tuple[str, str, float]:
        """Generates a short-lived access token (15 mins) with a unique JTI."""
        now = time.time()
        exp = now + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        jti = custom_jti or str(uuid.uuid4())

        payload = {
            "sub": sub,
            "jti": jti,
            "token_type": "access",
            "role": role,
            "scopes": scopes or ["read"],
            "iat": int(now),
            "exp": int(exp)
        }

        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        self.track_user_jti(sub, jti, exp)
        return token, jti, exp

    def create_refresh_token(
        self,
        sub: str,
        role: str = "user",
        parent_jti: Optional[str] = None,
        custom_jti: Optional[str] = None
    ) -> tuple[str, str, float]:
        """Generates a long-lived refresh token (7 days) with a unique JTI."""
        now = time.time()
        exp = now + (REFRESH_TOKEN_EXPIRE_DAYS * 86400)
        jti = custom_jti or str(uuid.uuid4())

        payload = {
            "sub": sub,
            "jti": jti,
            "token_type": "refresh",
            "role": role,
            "parent_jti": parent_jti,
            "iat": int(now),
            "exp": int(exp)
        }

        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        self.track_user_jti(sub, jti, exp)
        return token, jti, exp

    def issue_token_pair(
        self,
        sub: str,
        role: str = "user",
        scopes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Issues an Access + Refresh dual token pair."""
        access_token, access_jti, access_exp = self.create_access_token(sub, role, scopes)
        refresh_token, refresh_jti, refresh_exp = self.create_refresh_token(sub, role, parent_jti=access_jti)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "access_jti": access_jti,
            "refresh_jti": refresh_jti,
            "access_exp": int(access_exp),
            "refresh_exp": int(refresh_exp)
        }

    # ---------------------------------------------------------------------------
    # Token Verification
    # ---------------------------------------------------------------------------
    def decode_token(self, token_str: str) -> Dict[str, Any]:
        """Decodes and validates token signature and expiration."""
        try:
            payload = jwt.decode(token_str, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token signature has expired")
        except jwt.InvalidTokenError as e:
            raise ValueError(f"Invalid token: {str(e)}")

    def verify_access_token(self, token_str: str) -> Dict[str, Any]:
        """Decodes access token and ensures it is valid, type=='access', and not blacklisted."""
        payload = self.decode_token(token_str)

        if payload.get("token_type") != "access":
            raise ValueError("Invalid token type. Expected access token.")

        jti = payload.get("jti")
        if not jti:
            raise ValueError("Token payload missing JTI identifier.")

        if self.is_jti_blacklisted(jti):
            raise ValueError("Access token has been revoked (blacklisted JTI).")

        return payload

    def verify_refresh_token(self, token_str: str) -> Dict[str, Any]:
        """Decodes refresh token and ensures type=='refresh' and not blacklisted."""
        payload = self.decode_token(token_str)

        if payload.get("token_type") != "refresh":
            raise ValueError("Invalid token type. Expected refresh token.")

        jti = payload.get("jti")
        if not jti:
            raise ValueError("Token payload missing JTI identifier.")

        if self.is_jti_blacklisted(jti):
            raise ValueError("Refresh token has been revoked (blacklisted JTI).")

        return payload

    # ---------------------------------------------------------------------------
    # Redis JTI Blacklisting Engine
    # ---------------------------------------------------------------------------
    def revoke_jti(self, jti: str, exp_timestamp: float) -> bool:
        """
        Blacklists a JTI in Redis with TTL set to remaining token lifetime.
        Automatically deleted by Redis once token naturally expires.
        """
        now = time.time()
        remaining_ttl = int(exp_timestamp - now)
        if remaining_ttl <= 0:
            return True  # Already naturally expired

        if not self.use_fallback and self.redis:
            try:
                key = f"blacklist:jti:{jti}"
                self.redis.set(key, "revoked", ex=remaining_ttl)
                return True
            except Exception as e:
                print(f"[TokenManager] Redis error during revoke_jti: {e}. Using in-memory fallback.")

        # Fallback to thread-safe in-memory store
        with self._mem_lock:
            self._memory_blacklist[jti] = exp_timestamp
            self._purge_expired_memory_blacklist()
        return True

    def is_jti_blacklisted(self, jti: str) -> bool:
        """Checks whether a JTI exists in the Redis or in-memory blacklist."""
        if not jti:
            return False

        if not self.use_fallback and self.redis:
            try:
                key = f"blacklist:jti:{jti}"
                return bool(self.redis.exists(key))
            except Exception as e:
                print(f"[TokenManager] Redis error during is_jti_blacklisted: {e}. Using in-memory fallback.")

        # Fallback check
        now = time.time()
        with self._mem_lock:
            exp = self._memory_blacklist.get(jti)
            if exp and exp > now:
                return True
            elif exp and exp <= now:
                del self._memory_blacklist[jti]
        return False

    def get_jti_status(self, jti: str) -> Dict[str, Any]:
        """Returns details on whether a JTI is blacklisted and its remaining TTL."""
        if not self.use_fallback and self.redis:
            try:
                key = f"blacklist:jti:{jti}"
                ttl = self.redis.ttl(key)
                is_blacklisted = ttl > 0 or self.redis.exists(key) == 1
                return {
                    "jti": jti,
                    "is_blacklisted": is_blacklisted,
                    "ttl_seconds": max(0, ttl) if is_blacklisted else 0,
                    "storage": "redis"
                }
            except Exception:
                pass

        now = time.time()
        with self._mem_lock:
            exp = self._memory_blacklist.get(jti)
            if exp and exp > now:
                return {
                    "jti": jti,
                    "is_blacklisted": True,
                    "ttl_seconds": int(exp - now),
                    "storage": "in_memory"
                }
        return {
            "jti": jti,
            "is_blacklisted": False,
            "ttl_seconds": 0,
            "storage": "in_memory"
        }

    # ---------------------------------------------------------------------------
    # Session Tracking & Mass Revocation
    # ---------------------------------------------------------------------------
    def track_user_jti(self, sub: str, jti: str, exp_timestamp: float):
        """Registers active JTI under user's session list for bulk logout capability."""
        if not self.use_fallback and self.redis:
            try:
                user_key = f"user:{sub}:jtis"
                val = json.dumps({"jti": jti, "exp": exp_timestamp})
                self.redis.sadd(user_key, val)
                # Keep user session set alive for 7 days
                self.redis.expire(user_key, REFRESH_TOKEN_EXPIRE_DAYS * 86400)
                return
            except Exception:
                pass

        with self._mem_lock:
            if sub not in self._memory_user_jtis:
                self._memory_user_jtis[sub] = []
            self._memory_user_jtis[sub].append((jti, exp_timestamp))

    def revoke_all_user_jtis(self, sub: str) -> int:
        """Mass revokes all active JTIs for a specified user (Logout-All)."""
        revoked_count = 0
        now = time.time()

        if not self.use_fallback and self.redis:
            try:
                user_key = f"user:{sub}:jtis"
                members = self.redis.smembers(user_key)
                for member in members:
                    try:
                        data = json.loads(member)
                        jti = data.get("jti")
                        exp = data.get("exp", now + 3600)
                        if jti and exp > now:
                            self.revoke_jti(jti, exp)
                            revoked_count += 1
                    except Exception:
                        continue
                self.redis.delete(user_key)
                return revoked_count
            except Exception:
                pass

        with self._mem_lock:
            jtis = self._memory_user_jtis.pop(sub, [])
            for jti, exp in jtis:
                if exp > now:
                    self._memory_blacklist[jti] = exp
                    revoked_count += 1
        return revoked_count

    def _purge_expired_memory_blacklist(self):
        """Internal helper to prune expired JTIs from memory dictionary."""
        now = time.time()
        expired = [jti for jti, exp in self._memory_blacklist.items() if exp <= now]
        for jti in expired:
            del self._memory_blacklist[jti]
