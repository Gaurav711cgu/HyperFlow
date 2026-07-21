import os
import datetime
import jwt
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/demo")
async def demo_login():
    secret_key = os.getenv("JWT_SECRET", "hyperflow_demo_secret_998877")
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    payload = {
        "sub": "demo_user",
        "role": "recruiter_evaluator",
        "scopes": ["orders:read", "orders:write", "inventory:read", "ml:view"],
        "exp": expiration
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return {"status": "success", "token": token, "message": "Demo access granted."}
