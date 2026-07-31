from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.services.token_manager import TokenManager

security = HTTPBearer(auto_error=False)

# Shared singleton for TokenManager
_token_manager = TokenManager()


def get_token_manager() -> TokenManager:
    """Dependency provider for TokenManager singleton."""
    return _token_manager


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token_mgr: TokenManager = Depends(get_token_manager)
) -> dict:
    """
    FastAPI Security Dependency.
    Validates Bearer Access Token, verifies signature, token_type=='access',
    and checks Redis JTI revocation blacklist.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token header",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token_str = credentials.credentials

    try:
        payload = token_mgr.verify_access_token(token_str)
        return payload
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )
