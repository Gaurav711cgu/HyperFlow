from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.services.token_manager import TokenManager
from backend.api.deps.auth_deps import get_current_user, get_token_manager

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Pydantic Request / Response Schemas
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str = Field(..., example="demo_user")
    password: str = Field(..., example="hyperflow2026")
    role: Optional[str] = Field("recruiter_evaluator", example="recruiter_evaluator")
    scopes: Optional[List[str]] = Field(
        default=["orders:read", "orders:write", "inventory:read", "ml:view"],
        example=["orders:read", "orders:write", "inventory:read", "ml:view"]
    )


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="Active Refresh Token")


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = Field(None, description="Optional Refresh Token to revoke alongside Access Token")


class TokenResponse(BaseModel):
    status: str = "success"
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    access_jti: str
    refresh_jti: str
    message: str = "Dual token pair issued successfully."


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------
@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    token_mgr: TokenManager = Depends(get_token_manager)
):
    """
    Authenticates user credentials and issues an Enterprise Dual-Token Pair.
    Access Token (15 min) + Refresh Token (7 days) with unique JTIs.
    """
    # Demo validation: accept any user or demo credentials
    if not req.username or not req.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required."
        )

    pair = token_mgr.issue_token_pair(
        sub=req.username,
        role=req.role or "user",
        scopes=req.scopes
    )

    return TokenResponse(
        status="success",
        access_token=pair["access_token"],
        refresh_token=pair["refresh_token"],
        token_type="bearer",
        expires_in=pair["expires_in"],
        access_jti=pair["access_jti"],
        refresh_jti=pair["refresh_jti"],
        message=f"Enterprise dual token pair issued for {req.username}."
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    req: TokenRefreshRequest,
    token_mgr: TokenManager = Depends(get_token_manager)
):
    """
    Refresh Token Rotation endpoint.
    Validates refresh token JTI, revokes old refresh token in Redis,
    and issues a brand new Access + Refresh token pair.
    """
    try:
        payload = token_mgr.verify_refresh_token(req.refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Refresh failed: {str(e)}"
        )

    sub = payload["sub"]
    role = payload.get("role", "user")
    old_refresh_jti = payload["jti"]
    old_refresh_exp = payload["exp"]

    # Revoke old refresh token JTI in Redis (Token Rotation Security)
    token_mgr.revoke_jti(old_refresh_jti, old_refresh_exp)

    # Issue fresh token pair
    pair = token_mgr.issue_token_pair(
        sub=sub,
        role=role,
        scopes=["orders:read", "orders:write", "inventory:read", "ml:view"]
    )

    return TokenResponse(
        status="success",
        access_token=pair["access_token"],
        refresh_token=pair["refresh_token"],
        token_type="bearer",
        expires_in=pair["expires_in"],
        access_jti=pair["access_jti"],
        refresh_jti=pair["refresh_jti"],
        message="Token pair successfully rotated."
    )


@router.post("/logout")
async def logout(
    req: LogoutRequest,
    current_user: dict = Depends(get_current_user),
    token_mgr: TokenManager = Depends(get_token_manager)
):
    """
    Logs out user by adding current Access Token JTI (and optional Refresh Token JTI)
    to the Redis JTI Revocation Blacklist with TTL.
    """
    access_jti = current_user.get("jti")
    access_exp = current_user.get("exp")

    if access_jti and access_exp:
        token_mgr.revoke_jti(access_jti, access_exp)

    revoked_refresh = False
    if req.refresh_token:
        try:
            refresh_payload = token_mgr.decode_token(req.refresh_token)
            ref_jti = refresh_payload.get("jti")
            ref_exp = refresh_payload.get("exp")
            if ref_jti and ref_exp:
                token_mgr.revoke_jti(ref_jti, ref_exp)
                revoked_refresh = True
        except ValueError:
            pass

    return {
        "status": "success",
        "message": f"Successfully revoked access token (JTI: {access_jti}).",
        "access_jti_revoked": access_jti,
        "refresh_jti_revoked": revoked_refresh
    }


@router.post("/logout-all")
async def logout_all(
    current_user: dict = Depends(get_current_user),
    token_mgr: TokenManager = Depends(get_token_manager)
):
    """
    Mass Revocation (Logout All Sessions).
    Blacklists all active JTIs registered for the authenticated user ID in Redis.
    """
    sub = current_user["sub"]
    count = token_mgr.revoke_all_user_jtis(sub)

    return {
        "status": "success",
        "message": f"Mass revocation completed for user '{sub}'.",
        "revoked_sessions_count": count
    }


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Authenticated user profile endpoint verified against Redis JTI blacklist."""
    return {
        "status": "success",
        "user": {
            "sub": current_user["sub"],
            "role": current_user.get("role"),
            "scopes": current_user.get("scopes", []),
            "token_jti": current_user.get("jti"),
            "token_exp": current_user.get("exp"),
            "issued_at": current_user.get("iat")
        }
    }


@router.get("/jti-status/{jti}")
async def get_jti_status(
    jti: str,
    token_mgr: TokenManager = Depends(get_token_manager)
):
    """Inspection endpoint for monitoring JTI revocation state and remaining TTL in Redis."""
    status_info = token_mgr.get_jti_status(jti)
    return {
        "status": "success",
        "revocation_details": status_info
    }


# Retain legacy demo login endpoint for backward compatibility
@router.post("/demo")
async def demo_login(token_mgr: TokenManager = Depends(get_token_manager)):
    pair = token_mgr.issue_token_pair(
        sub="demo_user",
        role="recruiter_evaluator",
        scopes=["orders:read", "orders:write", "inventory:read", "ml:view"]
    )
    return {
        "status": "success",
        "token": pair["access_token"],
        "access_token": pair["access_token"],
        "refresh_token": pair["refresh_token"],
        "access_jti": pair["access_jti"],
        "refresh_jti": pair["refresh_jti"],
        "message": "Enterprise dual token demo access granted."
    }
