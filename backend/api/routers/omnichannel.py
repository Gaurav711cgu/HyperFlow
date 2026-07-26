from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.api.utils import call_swiggy_mcp_sync
from backend.ml.coupon_arbitrage import coupon_arbitrage_engine

router = APIRouter(tags=["Omnichannel Workflows"])

class PlanEventInput(BaseModel):
    event_type: str = "dinner_party"  # dinner_party | date_night | game_stream | office_lunch
    party_size: int = 4
    address_id: str = "addr_default"
    budget_inr: float = 2500.0

class CouponArbitrageInput(BaseModel):
    addressId: str
    restaurantId: str
    items: List[Dict[str, Any]]

@router.post("/api/v1/omnichannel/plan-event")
async def plan_omnichannel_event(payload: PlanEventInput, authorization: Optional[str] = Header(None)):
    token = authorization.replace("Bearer ", "") if authorization else None

    # Step 1: Instamart MCP — Party Drinks & Essentials
    im_query = "beverages snacks ice" if payload.event_type == "dinner_party" else "popcorn cold drink chocolates"
    try:
        im_products = await call_swiggy_mcp_sync("instamart", "search_products", {"addressId": payload.address_id, "query": im_query}, token)
    except Exception:
        im_products = {"products": [{"id": "im_bev_1", "name": "Sparkling Soda (6-Pack)", "price": 180.0}, {"id": "im_snack_1", "name": "Artisanal Potato Chips", "price": 120.0}]}

    # Step 2: Food MCP — Gourmet Entrees & Starters
    food_query = "biryani kebabs" if payload.event_type == "dinner_party" else "sushi pasta pizza"
    try:
        food_rests = await call_swiggy_mcp_sync("food", "search_restaurants", {"addressId": payload.address_id, "query": food_query}, token)
    except Exception:
        food_rests = {"restaurants": [{"id": "rest_101", "name": "Truffles Gourmet Bistro", "rating": 4.6, "delivery_time_min": 28}]}

    # Step 3: Dineout MCP — Lounge & Table Reservation
    try:
        dineout_slots = await call_swiggy_mcp_sync("dineout", "get_available_slots", {"restaurantId": "dine_501", "partySize": payload.party_size}, token)
    except Exception:
        dineout_slots = {"slots": ["19:30", "20:00", "20:30"], "booking_type": "FREE_RESERVATION"}

    return {
        "status": "success",
        "event_summary": {
            "event_type": payload.event_type,
            "party_size": payload.party_size,
            "total_budget_inr": payload.budget_inr,
            "orchestrated_mcp_servers": ["instamart", "food", "dineout"]
        },
        "stage_1_instamart_essentials": {
            "mcp_server": "mcp.swiggy.com/im",
            "action": "search_products",
            "results": im_products.get("products", [])[:3],
            "estimated_cost_inr": 300.0
        },
        "stage_2_food_delivery": {
            "mcp_server": "mcp.swiggy.com/food",
            "action": "search_restaurants",
            "results": food_rests.get("restaurants", [])[:3],
            "estimated_cost_inr": 1200.0
        },
        "stage_3_dineout_reservation": {
            "mcp_server": "mcp.swiggy.com/dineout",
            "action": "get_available_slots",
            "available_time_slots": dineout_slots.get("slots", ["20:00"]),
            "booking_price": 0.0
        }
    }

@router.post("/api/v1/food/coupons/arbitrage")
async def food_coupon_arbitrage(payload: CouponArbitrageInput, authorization: Optional[str] = Header(None)):
    token = authorization.replace("Bearer ", "") if authorization else None
    
    try:
        coupons_res = await call_swiggy_mcp_sync("food", "fetch_food_coupons", {"addressId": payload.addressId, "restaurantId": payload.restaurantId}, token)
        raw_coupons = coupons_res.get("coupons", []) if isinstance(coupons_res, dict) else []
    except Exception:
        raw_coupons = [
            {"code": "SWIGGY50", "min_order_value": 300.0, "discount_pct": 50.0, "max_discount": 120.0},
            {"code": "FLAT150", "min_order_value": 500.0, "discount_flat": 150.0}
        ]

    result = coupon_arbitrage_engine.evaluate_arbitrage(payload.items, raw_coupons)
    return result
