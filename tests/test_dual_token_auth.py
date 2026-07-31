import time
import pytest
from fastapi.testclient import TestClient

from backend.api.main import app
from backend.services.token_manager import TokenManager, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

client = TestClient(app)


# ---------------------------------------------------------------------------
# Unit Tests for TokenManager
# ---------------------------------------------------------------------------
def test_token_manager_issuance_and_verification():
    mgr = TokenManager()
    pair = mgr.issue_token_pair(sub="test_user_01", role="admin", scopes=["read", "write"])

    assert "access_token" in pair
    assert "refresh_token" in pair
    assert pair["token_type"] == "bearer"
    assert pair["expires_in"] == ACCESS_TOKEN_EXPIRE_MINUTES * 60

    # Verify access token
    access_payload = mgr.verify_access_token(pair["access_token"])
    assert access_payload["sub"] == "test_user_01"
    assert access_payload["token_type"] == "access"
    assert access_payload["role"] == "admin"
    assert access_payload["jti"] == pair["access_jti"]

    # Verify refresh token
    refresh_payload = mgr.verify_refresh_token(pair["refresh_token"])
    assert refresh_payload["sub"] == "test_user_01"
    assert refresh_payload["token_type"] == "refresh"
    assert refresh_payload["jti"] == pair["refresh_jti"]


def test_jti_revocation_blacklist():
    mgr = TokenManager()
    pair = mgr.issue_token_pair(sub="test_user_02", role="user")

    access_jti = pair["access_jti"]
    access_exp = pair["access_exp"]

    # Initially not blacklisted
    assert not mgr.is_jti_blacklisted(access_jti)
    assert mgr.verify_access_token(pair["access_token"])["sub"] == "test_user_02"

    # Revoke JTI
    mgr.revoke_jti(access_jti, access_exp)
    assert mgr.is_jti_blacklisted(access_jti)

    # Verification must fail once blacklisted
    with pytest.raises(ValueError, match="revoked"):
        mgr.verify_access_token(pair["access_token"])


def test_mass_user_jti_revocation():
    mgr = TokenManager()
    user_id = "test_user_mass_logout"

    pair1 = mgr.issue_token_pair(sub=user_id, role="user")
    pair2 = mgr.issue_token_pair(sub=user_id, role="user")

    assert not mgr.is_jti_blacklisted(pair1["access_jti"])
    assert not mgr.is_jti_blacklisted(pair2["access_jti"])

    revoked_count = mgr.revoke_all_user_jtis(user_id)
    assert revoked_count >= 2

    assert mgr.is_jti_blacklisted(pair1["access_jti"])
    assert mgr.is_jti_blacklisted(pair2["access_jti"])


# ---------------------------------------------------------------------------
# API Integration Tests (/api/v1/auth)
# ---------------------------------------------------------------------------
def test_api_login_endpoint():
    resp = client.post("/api/v1/auth/login", json={
        "username": "enterprise_user",
        "password": "secure_password_2026",
        "role": "auditor"
    })
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "success"
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert "access_jti" in data
    assert "refresh_jti" in data


def test_api_authenticated_me_endpoint_and_revocation():
    # 1. Login to get tokens
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "me_test_user",
        "password": "password123",
        "role": "engineer"
    })
    tokens = login_resp.json()
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]
    access_jti = tokens["access_jti"]

    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Access /me endpoint successfully
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_data = me_resp.json()["user"]
    assert user_data["sub"] == "me_test_user"
    assert user_data["role"] == "engineer"

    # 3. Inspect JTI status endpoint
    jti_resp = client.get(f"/api/v1/auth/jti-status/{access_jti}")
    assert jti_resp.status_code == 200
    assert jti_resp.json()["revocation_details"]["is_blacklisted"] is False

    # 4. Logout (revoke access & refresh tokens)
    logout_resp = client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token}, headers=headers)
    assert logout_resp.status_code == 200
    assert logout_resp.json()["access_jti_revoked"] == access_jti

    # 5. Access /me endpoint again — must return 401 Unauthorized
    me_after_logout = client.get("/api/v1/auth/me", headers=headers)
    assert me_after_logout.status_code == 401
    assert "revoked" in me_after_logout.json()["detail"].lower()

    # 6. Inspect JTI status — must show blacklisted
    jti_resp_after = client.get(f"/api/v1/auth/jti-status/{access_jti}")
    assert jti_resp_after.json()["revocation_details"]["is_blacklisted"] is True


def test_api_token_refresh_rotation():
    # 1. Login
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "rotation_user",
        "password": "password123"
    })
    tokens = login_resp.json()
    old_refresh_token = tokens["refresh_token"]
    old_refresh_jti = tokens["refresh_jti"]

    # 2. Refresh tokens
    refresh_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh_token})
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()

    assert new_tokens["access_token"] != tokens["access_token"]
    assert new_tokens["refresh_token"] != old_refresh_token
    assert new_tokens["refresh_jti"] != old_refresh_jti

    # 3. Old refresh token JTI must now be blacklisted
    jti_check = client.get(f"/api/v1/auth/jti-status/{old_refresh_jti}")
    assert jti_check.json()["revocation_details"]["is_blacklisted"] is True

    # 4. Re-using old refresh token must be rejected
    reuse_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh_token})
    assert reuse_resp.status_code == 401
    assert "revoked" in reuse_resp.json()["detail"].lower()


def test_api_logout_all_mass_revocation():
    user = "logout_all_user"

    # Login twice to get two sessions
    sess1 = client.post("/api/v1/auth/login", json={"username": user, "password": "pwd"}).json()
    sess2 = client.post("/api/v1/auth/login", json={"username": user, "password": "pwd"}).json()

    token1 = sess1["access_token"]
    token2 = sess2["access_token"]

    # Confirm session 1 is valid
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token1}"}).status_code == 200
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token2}"}).status_code == 200

    # Perform logout-all using session 1
    logout_all_resp = client.post("/api/v1/auth/logout-all", headers={"Authorization": f"Bearer {token1}"})
    assert logout_all_resp.status_code == 200
    assert logout_all_resp.json()["revoked_sessions_count"] >= 2

    # Both sessions must now be rejected
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token1}"}).status_code == 401
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token2}"}).status_code == 401
