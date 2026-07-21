import os
import json
import asyncio
import time
import secrets
import base64
import hashlib
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel

# DB and local imports
from backend.db.session import get_db
from backend.db.models import SystemSetting, Restaurant, Coupon, DineoutReservation
from backend.api.utils import call_swiggy_mcp_sync

router = APIRouter(tags=["Swiggy MCP Tools"])
security = HTTPBearer(auto_error=False)

# In-memory dictionary for PKCE code verifiers: {state: {"code_verifier": verifier, "expires_at": timestamp}}
OAUTH_PENDING_SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_swiggy_token(authorization: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[str]:
    if authorization:
        token = authorization.credentials
        if not token or len(token) < 10:
            raise HTTPException(status_code=401, detail="Invalid token format")
        return token
    return None

async def cleanup_oauth_sessions():
    """Background task to remove expired OAuth sessions"""
    while True:
        try:
            now = time.time()
            expired_keys = [state for state, data in OAUTH_PENDING_SESSIONS.items() if data["expires_at"] < now]
            for state in expired_keys:
                OAUTH_PENDING_SESSIONS.pop(state, None)
        except Exception as e:
            print(f"[OAuth Cleanup Error] {e}")
        await asyncio.sleep(60)

async def call_mcp_async(server: str, tool_name: str, arguments: dict, token: Optional[str]) -> dict:
    loop = asyncio.get_running_loop()
    try:
        res = await loop.run_in_executor(
            None,
            call_swiggy_mcp_sync,
            server,
            tool_name,
            arguments,
            token
        )
        return res
    except Exception as e:
        print(f"[Swiggy MCP Error] {server}/{tool_name} failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ─── OAuth 2.1 + PKCE Authentication ──────────────────────────────────────────

class ExchangePayload(BaseModel):
    code: str
    state: str

@router.get("/api/v1/auth/login-url")
async def get_login_url(db: Session = Depends(get_db)):
    client_id_setting = db.query(SystemSetting).filter(SystemSetting.key == "oauth_client_id").first()
    client_id = client_id_setting.value if client_id_setting else None
    
    if not client_id:
        print("[OAuth] Registering new client dynamically with Swiggy...")
        try:
            import urllib.request
            req = urllib.request.Request(
                "https://mcp.swiggy.com/auth/register",
                data=json.dumps({
                    "client_name": "HyperFlow 3.0",
                    "redirect_uris": ["http://localhost:5173/auth/callback"],
                    "grant_types": ["authorization_code"],
                    "response_types": ["code"],
                    "token_endpoint_auth_method": "none"
                }).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                res = json.loads(response.read().decode("utf-8"))
                client_id = res.get("client_id")
                if client_id:
                    setting = SystemSetting(key="oauth_client_id", value=client_id)
                    db.merge(setting)
                    db.commit()
                else:
                    raise ValueError("Registration failed - no client_id returned")
        except Exception as e:
            print(f"[OAuth] Dynamic client registration failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to register OAuth client: {e}")
            
    code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode("utf-8").replace("=", "")
    code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode("utf-8")).digest()).decode("utf-8").replace("=", "")
    state = secrets.token_hex(16)
    
    OAUTH_PENDING_SESSIONS[state] = {
        "code_verifier": code_verifier,
        "expires_at": time.time() + 120
    }
    
    redirect_uri = "http://localhost:5173/auth/callback"
    auth_url = (
        f"https://mcp.swiggy.com/auth/authorize?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"code_challenge={code_challenge}&"
        f"code_challenge_method=S256&"
        f"state={state}&"
        f"scope=mcp:tools"
    )
    return {"auth_url": auth_url, "state": state}

@router.post("/api/v1/auth/exchange")
async def exchange_token(payload: ExchangePayload, db: Session = Depends(get_db)):
    session = OAUTH_PENDING_SESSIONS.pop(payload.state, None)
    if not session or session["expires_at"] < time.time():
        raise HTTPException(status_code=400, detail="Invalid or expired state session")
        
    code_verifier = session["code_verifier"]
    client_id_setting = db.query(SystemSetting).filter(SystemSetting.key == "oauth_client_id").first()
    if not client_id_setting:
        raise HTTPException(status_code=500, detail="OAuth client not registered")
    client_id = client_id_setting.value
    
    try:
        import urllib.request
        exchange_data = {
            "grant_type": "authorization_code",
            "code": payload.code,
            "code_verifier": code_verifier,
            "client_id": client_id,
            "redirect_uri": "http://localhost:5173/auth/callback"
        }
        req = urllib.request.Request(
            "https://mcp.swiggy.com/auth/token",
            data=json.dumps(exchange_data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            res = json.loads(response.read().decode("utf-8"))
            return res
    except Exception as e:
        print(f"[OAuth] Token exchange failed: {e}")
        raise HTTPException(status_code=500, detail=f"OAuth exchange failed: {e}")

@router.get("/api/v1/auth/pending-sessions")
async def get_pending_sessions():
    now = time.time()
    sessions = [
        {"state": state, "expires_in": max(0, data["expires_at"] - now)}
        for state, data in OAUTH_PENDING_SESSIONS.items()
    ]
    return {"active_sessions": sessions, "count": len(sessions)}

# ─── Food MCP Endpoints (14 Tools) ───────────────────────────────────────────

@router.get("/api/v1/food/addresses")
async def food_get_addresses(token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "get_addresses", {}, token)

@router.get("/api/v1/food/restaurants")
async def food_search_restaurants(addressId: str, query: str = "food", token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "search_restaurants", {"addressId": addressId, "query": query}, token)

@router.get("/api/v1/food/restaurants/{restaurant_id}/menu")
async def food_get_restaurant_menu(restaurant_id: str, addressId: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "get_restaurant_menu", {"addressId": addressId, "restaurantId": restaurant_id}, token)

@router.get("/api/v1/food/menu/search")
async def food_search_menu(addressId: str, query: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "search_menu", {"addressId": addressId, "query": query}, token)

class UpdateFoodCartPayload(BaseModel):
    addressId: str
    items: List[Dict[str, Any]]
    couponCode: Optional[str] = None

@router.post("/api/v1/food/cart")
async def food_update_cart(payload: UpdateFoodCartPayload, token: Optional[str] = Depends(get_swiggy_token)):
    args = {"addressId": payload.addressId, "items": payload.items}
    if payload.couponCode:
        args["couponCode"] = payload.couponCode
    return await call_mcp_async("food", "update_food_cart", args, token)

@router.get("/api/v1/food/cart")
async def food_get_cart(addressId: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "get_food_cart", {"addressId": addressId}, token)

@router.post("/api/v1/food/cart/clear")
async def food_flush_cart(token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "flush_food_cart", {}, token)

@router.get("/api/v1/food/coupons")
async def food_fetch_coupons(addressId: str, restaurantId: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "fetch_food_coupons", {"addressId": addressId, "restaurantId": restaurantId}, token)

class ApplyCouponPayload(BaseModel):
    couponCode: str

@router.post("/api/v1/food/coupons/apply")
async def food_apply_coupon(payload: ApplyCouponPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "apply_food_coupon", {"couponCode": payload.couponCode}, token)

class PlaceFoodOrderPayload(BaseModel):
    addressId: str
    paymentMethod: str = "COD"

@router.post("/api/v1/food/orders")
async def food_place_order(payload: PlaceFoodOrderPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "place_food_order", {"addressId": payload.addressId, "paymentMethod": payload.paymentMethod}, token)

@router.get("/api/v1/food/orders")
async def food_get_orders(token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "get_food_orders", {}, token)

@router.get("/api/v1/food/orders/{order_id}")
async def food_get_order_details(order_id: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "get_food_order_details", {"orderId": order_id}, token)

@router.get("/api/v1/food/orders/{order_id}/track")
async def food_track_order(order_id: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "track_food_order", {"orderId": order_id}, token)

class ReportErrorPayload(BaseModel):
    server: str
    toolName: str
    errorCode: str
    errorMessage: str

@router.post("/api/v1/food/error-report")
async def food_report_error(payload: ReportErrorPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("food", "report_error", {
        "server": payload.server,
        "toolName": payload.toolName,
        "errorCode": payload.errorCode,
        "errorMessage": payload.errorMessage
    }, token)

# ─── Instamart MCP Endpoints (13 Tools) ──────────────────────────────────────

@router.get("/api/v1/im/addresses")
async def im_get_addresses(token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "get_addresses", {}, token)

class CreateAddressPayload(BaseModel):
    name: str
    addressLine1: str
    addressLine2: Optional[str] = None
    latitude: float
    longitude: float

@router.post("/api/v1/im/addresses")
async def im_create_address(payload: CreateAddressPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "create_address", payload.dict(), token)

@router.delete("/api/v1/im/addresses/{address_id}")
async def im_delete_address(address_id: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "delete_address", {"addressId": address_id}, token)

@router.get("/api/v1/im/products")
async def im_search_products(addressId: str, query: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "search_products", {"addressId": addressId, "query": query}, token)

@router.get("/api/v1/im/go-to-items")
async def im_your_go_to_items(addressId: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "your_go_to_items", {"addressId": addressId}, token)

class UpdateImCartPayload(BaseModel):
    addressId: str
    items: List[Dict[str, Any]]

@router.post("/api/v1/im/cart")
async def im_update_cart(payload: UpdateImCartPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "update_cart", {"addressId": payload.addressId, "items": payload.items}, token)

@router.get("/api/v1/im/cart")
async def im_get_cart(addressId: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "get_cart", {"addressId": addressId}, token)

@router.post("/api/v1/im/cart/clear")
async def im_clear_cart(token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "clear_cart", {}, token)

class ImCheckoutPayload(BaseModel):
    addressId: str
    paymentMethod: str = "COD"

@router.post("/api/v1/im/orders")
async def im_checkout(payload: ImCheckoutPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "checkout", {"addressId": payload.addressId, "paymentMethod": payload.paymentMethod}, token)

@router.get("/api/v1/im/orders")
async def im_get_orders(token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "get_orders", {}, token)

@router.get("/api/v1/im/orders/{order_id}")
async def im_get_order_details(order_id: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "get_order_details", {"orderId": order_id}, token)

@router.get("/api/v1/im/orders/{order_id}/track")
async def im_track_order(order_id: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "track_order", {"orderId": order_id}, token)

@router.post("/api/v1/im/error-report")
async def im_report_error(payload: ReportErrorPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("im", "report_error", {
        "server": payload.server,
        "toolName": payload.toolName,
        "errorCode": payload.errorCode,
        "errorMessage": payload.errorMessage
    }, token)

# ─── Dineout MCP Endpoints (8 Tools) ─────────────────────────────────────────

@router.get("/api/v1/dineout/addresses")
async def dineout_get_addresses(token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "get_saved_locations", {}, token)

@router.get("/api/v1/dineout/restaurants")
async def dineout_search_restaurants(latitude: float, longitude: float, query: str = "food", token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "search_restaurants_dineout", {"latitude": latitude, "longitude": longitude, "query": query}, token)

@router.get("/api/v1/dineout/restaurants/{restaurant_id}")
async def dineout_get_restaurant_details(restaurant_id: str, latitude: float, longitude: float, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "get_restaurant_details", {"restaurantId": restaurant_id, "latitude": latitude, "longitude": longitude}, token)

@router.get("/api/v1/dineout/restaurants/{restaurant_id}/slots")
async def dineout_get_slots(restaurant_id: str, date: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "get_available_slots", {"restaurantId": restaurant_id, "date": date}, token)

class DineoutCartPayload(BaseModel):
    restaurantId: str
    slotId: str
    guests: int

@router.post("/api/v1/dineout/cart")
async def dineout_create_cart(payload: DineoutCartPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "create_cart", {
        "restaurantId": payload.restaurantId,
        "slotId": payload.slotId,
        "guests": payload.guests
    }, token)

class BookTablePayload(BaseModel):
    cartId: str
    bookingPrice: int = 0

@router.post("/api/v1/dineout/book")
async def dineout_book_table(payload: BookTablePayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "book_table", {
        "cartId": payload.cartId,
        "bookingPrice": payload.bookingPrice
    }, token)

@router.get("/api/v1/dineout/bookings/{booking_id}")
async def dineout_booking_status(booking_id: str, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "get_booking_status", {"orderId": booking_id}, token)

@router.post("/api/v1/dineout/error-report")
async def dineout_report_error(payload: ReportErrorPayload, token: Optional[str] = Depends(get_swiggy_token)):
    return await call_mcp_async("dineout", "report_error", {
        "server": payload.server,
        "toolName": payload.toolName,
        "errorCode": payload.errorCode,
        "errorMessage": payload.errorMessage
    }, token)
