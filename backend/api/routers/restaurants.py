import os
import time
import asyncio
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.db.models import Restaurant, Coupon, DineoutReservation, ExpenseLog, SystemSetting
from backend.core.logger import get_logger
from backend.api.utils import call_swiggy_mcp_sync

logger = get_logger(__name__)

security = HTTPBearer(auto_error=False)

router = APIRouter()

class RestaurantCreate(BaseModel):
    name: str
    cuisine: str
    rating: float
    distance: str
    time: str
    slaConfidence: int
    isAIPick: bool
    isExclusive: bool
    image: Optional[str] = None

class CouponCreate(BaseModel):
    code: str
    pct: int
    minOrder: int
    desc: str

class DineoutReserve(BaseModel):
    hotel: str
    time: str
    party: int


@router.get("/restaurants", response_model=List[dict])
async def list_restaurants(
    db: Session = Depends(get_db),
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    token = authorization.credentials if authorization else os.getenv("SWIGGY_ACCESS_TOKEN")
    if token and len(token) > 50 and not token.startswith("YOUR_") and "INVALID" not in token:
        try:
            loop = asyncio.get_event_loop()
            addr_res = await loop.run_in_executor(
                None, 
                call_swiggy_mcp_sync, 
                "food", 
                "get_addresses", 
                {}
            )
            
            address_id = None
            if "structuredContent" in addr_res and "addresses" in addr_res["structuredContent"]:
                addrs = addr_res["structuredContent"]["addresses"]
                if addrs:
                    address_id = addrs[0]["id"]
            
            if address_id:
                rest_res = await loop.run_in_executor(
                    None,
                    call_swiggy_mcp_sync,
                    "food",
                    "search_restaurants",
                    {"addressId": address_id, "query": "food"}
                )
                
                if "structuredContent" in rest_res and "restaurants" in rest_res["structuredContent"]:
                    mcp_rests = rest_res["structuredContent"]["restaurants"]
                    result = []
                    for r in mcp_rests:
                        raw_rating = r.get("avgRating")
                        try:
                            rating = float(raw_rating) if raw_rating and raw_rating != "undefined" else 4.2
                        except ValueError:
                            rating = 4.2
                        
                        sla_conf = 90 + int(hash(r.get("id", "")) % 10)
                        
                        result.append({
                            "id": r.get("id"),
                            "name": r.get("name"),
                            "cuisine": " · ".join([c.strip() for c in r.get("cuisines", [])]) if isinstance(r.get("cuisines"), list) else r.get("cuisine", "Global Cuisine"),
                            "rating": rating,
                            "distance": f"{r.get('distanceKm', 2.5)} km",
                            "time": f"{r.get('deliveryTimeMinutes', 30)} min",
                            "slaConfidence": sla_conf,
                            "isAIPick": rating >= 4.5,
                            "isExclusive": hash(r.get("id", "")) % 3 == 0,
                            "image": r.get("imageUrl") or "https://lh3.googleusercontent.com/aida-public/AB6AXuBO8RUON-0Yl8JERiePhVFj8Z-Nmfi7A-U5kybOvYLPadTK0uNxXuT-6WSHyhmSSwZXdN6Fte6CFkXWaaytQN_GxD8URqNGmiThzbzJomV7WsXP5b5sMfO2GYRMLj8sagiUXcgUTLUwIUFJnGiJUSs-7ScqHOOE8RUkPjgy4cV7DtmYfeHPZKv-H3fBL4IixTqcLluBWbgeMFRFUL-KmmR84fv2SqqNVNdbM0gRUOUSAZJtf_kj549UYqg7Gm_Ch9KT0OcG1BiTR2qH"
                        })
                    if result:
                        return result
        except Exception as e:
            logger.warning(f"[Swiggy MCP REST] Failed to load from real API: {e}. Falling back to PostgreSQL DB.")
            
    rows = db.query(Restaurant).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "cuisine": r.cuisine,
            "rating": r.rating,
            "distance": r.distance,
            "time": r.time,
            "slaConfidence": r.slaConfidence,
            "isAIPick": r.isAIPick,
            "isExclusive": r.isExclusive,
            "image": r.image
        } for r in rows
    ]

@router.get("/restaurants/{restaurant_id}/menu", response_model=List[dict])
async def list_restaurant_menu(
    restaurant_id: str, 
    db: Session = Depends(get_db),
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    token = authorization.credentials if authorization else os.getenv("SWIGGY_ACCESS_TOKEN")
    if token and len(token) > 50 and not token.startswith("YOUR_") and "INVALID" not in token:
        try:
            loop = asyncio.get_event_loop()
            addr_res = await loop.run_in_executor(
                None, 
                call_swiggy_mcp_sync, 
                "food", 
                "get_addresses", 
                {}
            )
            address_id = None
            if "structuredContent" in addr_res and "addresses" in addr_res["structuredContent"]:
                addrs = addr_res["structuredContent"]["addresses"]
                if addrs:
                    address_id = addrs[0]["id"]
            
            if address_id:
                menu_res = await loop.run_in_executor(
                    None,
                    call_swiggy_mcp_sync,
                    "food",
                    "get_restaurant_menu",
                    {"addressId": address_id, "restaurantId": restaurant_id}
                )
                
                if "structuredContent" in menu_res and "categories" in menu_res["structuredContent"]:
                    cats = menu_res["structuredContent"]["categories"]
                    flat_menu = []
                    seen_names = set()
                    for cat in cats:
                        for item in cat.get("items", []):
                            name = item.get("name")
                            if name in seen_names:
                                continue
                            seen_names.add(name)
                            
                            raw_rating = item.get("rating")
                            try:
                                rating = float(raw_rating) if raw_rating and raw_rating != "undefined" else 4.2
                            except ValueError:
                                rating = 4.2
                            
                            item_hash = hash(item.get("id", ""))
                            protein = 10 + (item_hash % 25)
                            calories = 200 + (item_hash % 300)
                            
                            flat_menu.append({
                                "id": item.get("id"),
                                "name": name,
                                "price": int(item.get("price") or 199),
                                "rating": rating,
                                "desc": item.get("description") or f"Delicious {name} prepared with premium ingredients.",
                                "protein": protein,
                                "cal": calories,
                                "veg": item.get("isVeg", False),
                                "image": item.get("imageUrl") or "https://lh3.googleusercontent.com/aida-public/AB6AXuAy8Ulq_axTRp6t2EagRb5G-YtqpRnvPzPmyNLG-1FBJ0_p-83Hb7anlB2ZhXsi9Yd0x4n4HVmWhRYJ4r1J0aeYhAKyBpAHs5R59gryk1trq626wW1LuUFZ7SkM8OvhMdS78RXzvNqpn-E03C047MfVamHP-NIetglvLA2A5zzJjsUUJ8KlWdV_E4DdUow8sK7YValAPmnwch_EcyAii9s8yhA-yi925HvzzqKBSoWyYDzGpNFU46e2dbF68cDx_CA1jI2gcAKBGs_E"
                            })
                    if flat_menu:
                        return flat_menu
        except Exception as e:
            logger.error(f"[Swiggy MCP REST] Failed to load menu for {restaurant_id}: {e}")
            
    local_menus = {
        "rest_behrouz": [
            { "id": "dum_gosht", "name": "Dum Gosht Biryani", "price": 349, "rating": 4.6, "desc": "Fragrant long-grain basmati rice layered with juicy mutton in royal spices.", "protein": 36, "cal": 540, "veg": False, "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAy8Ulq_axTRp6t2EagRb5G-YtqpRnvPzPmyNLG-1FBJ0_p-83Hb7anlB2ZhXsi9Yd0x4n4HVmWhRYJ4r1J0aeYhAKyBpAHs5R59gryk1trq626wW1LuUFZ7SkM8OvhMdS78RXzvNqpn-E03C047MfVamHP-NIetglvLA2A5zzJjsUUJ8KlWdV_E4DdUow8sK7YValAPmnwch_EcyAii9s8yhA-yi925HvzzqKBSoWyYDzGpNFU46e2dbF68cDx_CA1jI2gcAKBGs_E" },
            { "id": "lazeez_chicken", "name": "Lazeez Bhuna Murgh Biryani", "price": 299, "rating": 4.5, "desc": "Tender boneless chicken in bhuna spices layered with basmati rice.", "protein": 32, "cal": 480, "veg": False, "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBVH7_iiDjEwAqM-iOH8jm3r4ljZMINGVU_Xp5Q-c5wjp04ir3wyacHOLYmjmdPdsAEKmN7NFvNQ8ccPIwOAUEqVu7ESWWZFV7ECSWX7JzlbDWyCtYJ_7mti2MWNy3Yuj77gJG8cjX2qVom1OGcFA8kzAFxQ4u3CBk-mzNORIV01WqDHbcX9ae4xKUwXCM69aXnh0vKIHvWcTm7xzkbIx4a_pAK1gBNf1lGPPzRLuDKikphdzej965g0gpkdAKQ1V-5hDx9OoV1vQMF" },
            { "id": "mint_raita", "name": "Mint Raita", "price": 49, "rating": 4.2, "desc": "Refreshing raita flavored with fresh mint leaves.", "protein": 2, "cal": 60, "veg": True, "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuA9dB7F5xSnF4KMn9vZmYR-rdDJJynymGxYucwoE-YBitPw0VKGSu-DN14kA90BSzp-2uy6VqlvfPFGUv1w1bAkAncDACJEjmjyIs5U_edIxKkwyJXxKBdiWMNunXofnk0gpGuMhOYRmiAlpBLt1eDqi27iQu4sKk2m2BOZdHLrGxGFXuHSxNxRfZrvdjjDlDh9Qzm9Bq8gJA1kCDLJqJ4Wt4tvK3bGLCdxh0ENy_AR1ED6oHIrCU53WfftTybXUz_QCYlouZZvj1fU" }
        ],
        "rest_carbon_grill": [
            { "id": "truffle_burger", "name": "Truffle Cheese Burger", "price": 280, "rating": 4.5, "desc": "Gourmet double-patty burger with Swiss cheese and black truffle aioli.", "protein": 34, "cal": 620, "veg": False, "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuD9C62CkwFO1Ta65rOPGt_zkQb3NWBfpIVfhSCWsS173P7Hw1t8O2CFnA1Swhsh03BFAJeCU4v8zMcs2FtgfS9UKrkQ-pgIxmQV0atKwEY1VvIrOO2nqjJirHB5LtlEy7v2E23zmpz5QUROCmGsEwpUTOxc6-W7bqEnwZTpjlEj84W0_wRNkm3oiChRsbQBbdUsj6iQ4IQ8MjgCXDjvXHjIGyb2EehurUmG2rcFE5E_2NQqMXhnC7sZPl5JUl0b-89s8s1A5HghkpjV" },
            { "id": "peri_fries", "name": "Spicy Peri Peri Fries", "price": 149, "rating": 4.3, "desc": "Crispy golden skin-on fries tossed in house peri-peri spice dust.", "protein": 5, "cal": 320, "veg": True, "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuD9C62CkwFO1Ta65rOPGt_zkQb3NWBfpIVfhSCWsS173P7Hw1t8O2CFnA1Swhsh03BFAJeCU4v8zMcs2FtgfS9UKrkQ-pgIxmQV0atKwEY1VvIrOO2nqjJirHB5LtlEy7v2E23zmpz5QUROCmGsEwpUTOxc6-W7bqEnwZTpjlEj84W0_wRNkm3oiChRsbQBbdUsj6iQ4IQ8MjgCXDjvXHjIGyb2EehurUmG2rcFE5E_2NQqMXhnC7sZPl5JUl0b-89s8s1A5HghkpjV" }
        ],
        "rest_yoko_ono": [
            { "id": "salmon_nigiri", "name": "Salmon Nigiri (2pcs)", "price": 320, "rating": 4.7, "desc": "Slices of premium fresh Atlantic salmon laid over seasoned sushi rice.", "protein": 14, "cal": 180, "veg": False, "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCBY63vuIkeBp6l5cHYDUYAUxyfZjekeIUDrgoaWXdYWfRsIItON9yVcNgasVY5EVJ_z9UCEYE7ifS6es_em8GXuQSZjL4elMAOcYKY-mFqvK7XoIYiCdoO9fXcs76s27BFjIlZ-jibt94sXMKAMiW-HDhL8Fx6YgFDMjXCKJuqgQvL6f2QokApfLDSvnpgf5uRCpVCyjlevWvENzKb2pD1gJvWBrOj_kU8HsHYg8siO1GP2yGFdEgOS79jFlelYdFjbEs_cIizY-X6" },
            { "id": "tuna_maki", "name": "Tuna Maki Roll (6pcs)", "price": 280, "rating": 4.5, "desc": "Yellowfin tuna wrapped in nori sheet with sushi rice.", "protein": 18, "cal": 220, "veg": False, "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCBY63vuIkeBp6l5cHYDUYAUxyfZjekeIUDrgoaWXdYWfRsIItON9yVcNgasVY5EVJ_z9UCEYE7ifS6es_em8GXuQSZjL4elMAOcYKY-mFqvK7XoIYiCdoO9fXcs76s27BFjIlZ-jibt94sXMKAMiW-HDhL8Fx6YgFDMjXCKJuqgQvL6f2QokApfLDSvnpgf5uRCpVCyjlevWvENzKb2pD1gJvWBrOj_kU8HsHYg8siO1GP2yGFdEgOS79jFlelYdFjbEs_cIizY-X6" }
        ]
    }
    return local_menus.get(restaurant_id, [])

@router.post("/restaurants")
async def create_restaurant(req: RestaurantCreate, db: Session = Depends(get_db)):
    new_id = f"rest_{int(time.time() * 1000)}"
    new_rest = Restaurant(
        id=new_id,
        name=req.name,
        cuisine=req.cuisine,
        rating=req.rating,
        distance=req.distance,
        time=req.time,
        slaConfidence=req.slaConfidence,
        isAIPick=req.isAIPick,
        isExclusive=req.isExclusive,
        image=req.image or "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=60"
    )
    db.add(new_rest)
    db.commit()
    db.refresh(new_rest)
    return {
        "status": "success",
        "restaurant": {
            "id": new_rest.id,
            "name": new_rest.name,
            "cuisine": new_rest.cuisine,
            "rating": new_rest.rating,
            "distance": new_rest.distance,
            "time": new_rest.time,
            "slaConfidence": new_rest.slaConfidence,
            "isAIPick": new_rest.isAIPick,
            "isExclusive": new_rest.isExclusive,
            "image": new_rest.image
        }
    }

@router.get("/coupons", response_model=List[dict])
async def list_coupons(db: Session = Depends(get_db)):
    rows = db.query(Coupon).all()
    return [
        {
            "code": c.code,
            "pct": c.discount_percentage,
            "minOrder": int(c.min_cart_value),
            "desc": f"{c.discount_percentage}% off above ₹{c.min_cart_value}"
        } for c in rows
    ]

@router.post("/coupons")
async def create_coupon(req: CouponCreate, db: Session = Depends(get_db)):
    new_cop = Coupon(
        code=req.code.upper(),
        discount_percentage=req.pct,
        min_cart_value=req.minOrder,
        active=True
    )
    db.add(new_cop)
    db.commit()
    db.refresh(new_cop)
    return {
        "status": "success",
        "coupon": {
            "code": new_cop.code,
            "pct": new_cop.discount_percentage,
            "minOrder": int(new_cop.min_cart_value),
            "desc": f"{new_cop.discount_percentage}% off above ₹{new_cop.min_cart_value}"
        }
    }

@router.get("/dineout/reservations", response_model=List[dict])
async def list_dineout_reservations(db: Session = Depends(get_db)):
    rows = db.query(DineoutReservation).all()
    return [
        {
            "id": f"res_{r.id}",
            "hotel": r.restaurant_id,
            "time": r.time_slot,
            "party": r.guests,
            "status": "CONFIRMED"
        } for r in rows
    ]

@router.post("/dineout/reserve")
async def reserve_dineout(req: DineoutReserve, db: Session = Depends(get_db)):
    new_res = DineoutReservation(
        customer_name="HyperFlow Customer",
        restaurant_id=req.hotel,
        time_slot=req.time,
        guests=req.party
    )
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return {
        "status": "success",
        "reservation": {
            "id": f"res_{new_res.id}",
            "hotel": new_res.restaurant_id,
            "time": new_res.time_slot,
            "party": new_res.guests,
            "status": "CONFIRMED"
        }
    }

@router.get("/user/expenses", response_model=List[dict])
async def list_user_expenses(db: Session = Depends(get_db)):
    rows = db.query(ExpenseLog).all()
    return [
        {
            "id": e.id,
            "date": e.timestamp.strftime("%b %d") if e.timestamp else "Today",
            "amount": int(e.amount),
            "category": e.category,
            "desc": e.description
        } for e in rows
    ]

@router.get("/settings/festival")
async def get_festival_settings(db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "festival_theme").first()
    theme = setting.value if setting else "nominal"
    return {"festival_theme": theme}

@router.post("/settings/festival")
async def update_festival_settings(theme_name: str, db: Session = Depends(get_db)):
    if theme_name not in ["nominal", "diwali", "holi"]:
        raise HTTPException(status_code=400, detail="Invalid festival theme.")
    setting = db.query(SystemSetting).filter(SystemSetting.key == "festival_theme").first()
    if not setting:
        setting = SystemSetting(key="festival_theme", value=theme_name)
        db.add(setting)
    else:
        setting.value = theme_name
    db.commit()
    return {"status": "success", "festival_theme": theme_name}
