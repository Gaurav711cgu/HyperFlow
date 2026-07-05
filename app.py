import os
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import our ML core modules
from ml_core.demand_forecaster import TobitRegressor, CensoredDemandForecaster
from ml_core.eta_smoother import MIMOEtaPredictor, LearnedETASmoother
from ml_core.rescue_optimizer import RescueOptimizer
from ml_core.fraud_guard import FraudGuard
from ml_core.dispatch_batcher import DispatchBatcher

app = FastAPI(
    title="Antigravity Hyperlocal AI/ML Engine",
    description="FastAPI Backend for Swiggy/Zomato ML Systems (Tobit Forecasting, Gated ETA, Canceled Resale, and Fraud Shields)",
    version="1.0.0"
)

# Enable CORS for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initialize and Pre-train Models on App Startup ---
# We pre-train on synthetic data so the backend endpoints are fully operational with real parameters
print("Initializing and pre-training models...")

# 1. Tobit Forecaster
forecaster = CensoredDemandForecaster()
X_demand = np.random.uniform(5, 35, (100, 3)) # temp_anomaly, is_weekend, is_ipl
y_demand = 50.0 + 1.2 * X_demand[:, 0] + 15.0 * X_demand[:, 1] + 25.0 * X_demand[:, 2] + np.random.normal(0, 5.0, 100)
censored_demand = y_demand >= 90.0
y_demand_censored = np.minimum(y_demand, 90.0)
forecaster.fit(X_demand, y_demand_censored, censored_demand)

# 2. ETA Smoother
mimo = MIMOEtaPredictor()
X_mimo = np.random.uniform(500, 5000, (200, 5))
Y_mimo = np.column_stack([
    3.0 + 0.4 * X_mimo[:, 2] + np.random.normal(0, 0.5, 200),
    2.0 + 0.001 * X_mimo[:, 0] + np.random.normal(0, 0.5, 200),
    4.0 + 0.0015 * X_mimo[:, 1] + np.random.normal(0, 0.8, 200)
])
mimo.fit(X_mimo, Y_mimo)

eta_smoother = LearnedETASmoother()
# Pre-fit with synthetic deltas
X_deltas = np.random.normal(0, 1.5, (100, 7))
X_deltas[:, 0] = np.abs(X_deltas[:, 0]) # Positive jumps
y_delays = np.random.binomial(1, 0.3, 100)
eta_smoother.fit(X_deltas, y_delays)

# 3. Rescue Optimizer
rescue_opt = RescueOptimizer()

# 4. Fraud Guard
fraud_guard = FraudGuard()
# Record some complaints to seed merchant_1 as a cold food violator
for _ in range(12):
    fraud_guard.record_complaint("merchant_1", "cold_food", 300.0)

# 5. Dispatch Batcher
dispatch_batcher = DispatchBatcher()

print("All models successfully initialized!")

# --- API Models ---

class ForecastRequest(BaseModel):
    store_id: str
    sku_id: str
    temp_anomaly: float
    is_weekend: bool
    is_ipl_day: bool

class ETARequest(BaseModel):
    prev_smoothed_eta: Optional[float] = None
    curr_raw_legs: List[float]
    prev_raw_legs: Optional[List[float]] = None
    time_elapsed_sec: float
    distance_left_m: float
    velocity_mps: float
    zone_avg_velocity_mps: Optional[float] = 8.0

class RescueRequest(BaseModel):
    buyer_lat: float
    buyer_lng: float
    buyer_ip: str
    cancelling_lat: float
    cancelling_lng: float
    cancelling_ip: str
    buyer_cancellation_history_30m: Optional[bool] = False
    discount_pct: Optional[float] = 0.0
    flat_discount: Optional[float] = 0.0

class RefundTriageRequest(BaseModel):
    merchant_id: str
    user_refund_ratio: float
    user_tenure_days: int
    user_historical_orders: int
    user_auto_refunds_30d: int
    delivery_duration_min: float
    refund_amount_ratio: float
    has_duplicate_hash: bool
    complaint_type: str
    complaint_text: str
    items_list: List[str]

class OrderItem(BaseModel):
    order_id: str
    lat: float
    lng: float
    t_prep: float

class BatchRequest(BaseModel):
    store_lat: float
    store_lng: float
    pending_orders: List[OrderItem]

class CODCheckRequest(BaseModel):
    user_cancellation_rate: float
    user_rating: float
    order_value: float
    hour_of_day: int

class RiderCheckRequest(BaseModel):
    rider_id: str
    historical_claims_30d: int
    current_velocity_mps: float

# --- REST Endpoints ---

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Antigravity Hyperlocal ML Engine",
        "deployment": "Hugging Face Spaces"
    }

@app.post("/forecast")
def predict_forecast(req: ForecastRequest):
    x = np.array([[req.temp_anomaly, float(req.is_weekend), float(req.is_ipl_day)]])
    try:
        point_forecast = forecaster.predict(x)[0]
        _, lower_bound, upper_bound = forecaster.predict_with_intervals(x)
        
        # Calculate safety stock
        safety_stock = int(np.ceil(upper_bound[0]))
        
        return {
            "store_id": req.store_id,
            "sku_id": req.sku_id,
            "point_forecast": float(np.round(point_forecast, 2)),
            "lower_bound_90": float(np.round(lower_bound[0], 2)),
            "upper_bound_90": float(np.round(upper_bound[0], 2)),
            "safety_stock_units": safety_stock,
            "restock_recommended": bool(point_forecast > lower_bound[0])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/smooth-eta")
def smooth_eta(req: ETARequest):
    try:
        curr_legs = np.array(req.curr_raw_legs)
        prev_legs = np.array(req.prev_raw_legs) if req.prev_raw_legs else curr_legs
        
        smoothed, is_real, prob = eta_smoother.smooth_eta(
            prev_smoothed_eta=req.prev_smoothed_eta,
            prev_raw_eta_legs=prev_legs,
            curr_raw_eta_legs=curr_legs,
            time_elapsed_sec=req.time_elapsed_sec,
            distance_left_m=req.distance_left_m,
            velocity_mps=req.velocity_mps,
            zone_avg_velocity_mps=req.zone_avg_velocity_mps
        )
        
        return {
            "smoothed_eta": float(np.round(smoothed, 2)),
            "is_real_delay": bool(is_real),
            "prob_real_delay": float(np.round(prob, 3)),
            "raw_eta": float(np.sum(curr_legs))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rescue-offers")
def get_rescue_offers(req: RescueRequest):
    try:
        # Evaluate arbitrage risk
        is_risk, reasons = rescue_opt.check_arbitrage_risk(
            buyer_lat=req.buyer_lat,
            buyer_lng=req.buyer_lng,
            buyer_ip=req.buyer_ip,
            cancelling_lat=req.cancelling_lat,
            cancelling_lng=req.cancelling_lng,
            cancelling_ip=req.cancelling_ip,
            buyer_cancellation_history_30m=req.buyer_cancellation_history_30m
        )
        
        if is_risk:
            return {
                "available_rescue_offers": [],
                "arbitrage_alert_triggered": True,
                "exclusion_reasons": reasons
            }
            
        # Standard mock rescuable orders inside Bangalore coordinates
        # Order 1: Chicken Biryani (warm meal, rescuable)
        # Order 2: Crispy Chicken Fingers (fried food, too cold/degraded, filtered out!)
        offers = []
        
        # Test Biryani thermal quality
        biryani_sqi = rescue_opt.get_sensory_quality("warm_meal", 10.0)
        is_biryani_ok = rescue_opt.is_rescuable("warm_meal", 10.0)
        
        if is_biryani_ok:
            coupon_dict = {"discount_pct": req.discount_pct, "flat_discount": req.flat_discount}
            price = rescue_opt.calculate_rescue_price(380.0, coupon_dict)
            
            offers.append({
                "order_id": "rescue_ord_701",
                "restaurant_name": "Meghana Foods",
                "items": "1x Special Chicken Biryani",
                "category": "warm_meal",
                "menu_price_inr": 380.0,
                "rescue_price_inr": price,
                "sensory_quality_index": round(biryani_sqi, 1),
                "distance_km": 0.6,
                "status": "AVAILABLE"
            })
            
        # Test Fried Chicken (transit = 18 mins, ambient = 25C -> SQI falls below 60 -> filtered!)
        fried_sqi = rescue_opt.get_sensory_quality("fried_food", 18.0)
        is_fried_ok = rescue_opt.is_rescuable("fried_food", 18.0)
        
        excluded_count = 0 if is_fried_ok else 1
        if is_fried_ok:
            offers.append({
                "order_id": "rescue_ord_702",
                "restaurant_name": "KFC",
                "items": "1x 8pc Hot & Crispy",
                "category": "fried_food",
                "menu_price_inr": 650.0,
                "rescue_price_inr": 325.0,
                "sensory_quality_index": round(fried_sqi, 1),
                "distance_km": 1.2,
                "status": "AVAILABLE"
            })
            
        return {
            "available_rescue_offers": offers,
            "arbitrage_alert_triggered": False,
            "excluded_expired_offers_count": excluded_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/triage-refund")
def triage_refund(req: RefundTriageRequest):
    try:
        outcome, prob, reason = fraud_guard.triage_refund_request(
            merchant_id=req.merchant_id,
            user_refund_ratio=req.user_refund_ratio,
            user_tenure_days=req.user_tenure_days,
            user_historical_orders=req.user_historical_orders,
            user_auto_refunds_30d=req.user_auto_refunds_30d,
            delivery_duration_min=req.delivery_duration_min,
            refund_amount_ratio=req.refund_amount_ratio,
            has_duplicate_hash=req.has_duplicate_hash,
            complaint_type=req.complaint_type,
            complaint_text=req.complaint_text,
            items_list=req.items_list
        )
        
        # Check merchant visibility status for additional context
        m_stats = fraud_guard.get_merchant_metrics(req.merchant_id)
        
        return {
            "outcome": outcome,
            "fraud_probability": float(np.round(prob, 3)),
            "reason_code": reason,
            "merchant_visibility_factor": m_stats["search_visibility_factor"],
            "merchant_high_alert": m_stats["high_cold_food_alert"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize-dispatch")
def optimize_dispatch(req: BatchRequest):
    try:
        orders_input = []
        for o in req.pending_orders:
            orders_input.append({
                "order_id": o.order_id,
                "lat": o.lat,
                "lng": o.lng,
                "t_prep": o.t_prep
            })
            
        batches = dispatch_batcher.optimize_batches(
            store_lat=req.store_lat,
            store_lng=req.store_lng,
            pending_orders=orders_input
        )
        
        # Calculate recommended hotspots
        dark_stores = [{"id": "store_1", "lat": req.store_lat, "lng": req.store_lng}]
        hotspots = dispatch_batcher.get_rider_hotspots(dark_stores, orders_input)
        
        return {
            "batches": batches,
            "total_batches_count": len(batches),
            "unbatched_orders_count": 0,
            "rider_hotspots": hotspots
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cod-check")
def check_cod(req: CODCheckRequest):
    try:
        prob, is_allowed = fraud_guard.predict_cod_rejection_risk(
            user_cancellation_rate=req.user_cancellation_rate,
            user_rating=req.user_rating,
            order_value=req.order_value,
            hour_of_day=req.hour_of_day
        )
        return {
            "cod_allowed": is_allowed,
            "rejection_probability": prob
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rider-check")
def check_rider(req: RiderCheckRequest):
    try:
        is_valid, reasons = fraud_guard.validate_breakdown_claim(
            rider_id=req.rider_id,
            historical_claims_30d=req.historical_claims_30d,
            current_velocity_mps=req.current_velocity_mps
        )
        return {
            "breakdown_valid": is_valid,
            "flags": reasons
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=7860, reload=True)
