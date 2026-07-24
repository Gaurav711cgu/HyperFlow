# HyperFlow 4.0 — Upgrade PRD

> → Using `elite-project-builder` + `ml-scientist` + `elite-debugger`

**Classification:** Portfolio-Grade | Swiggy Builders Club | Primary Target: Swiggy/Zepto ML + SDE Roles

---

## WHAT THIS DOCUMENT IS

This PRD upgrades the existing HyperFlow codebase (`HyperFlow-main`) into a production-credible demo. It is not a greenfield spec — it is a surgical upgrade plan. Every section references the actual files in your repo and calls out exactly what changes, why, and in what order.

Do not start with the UI. Start with the bugs. A broken backend with a beautiful frontend is a failed interview.

---

## WHAT'S IN THE BASE (AND WHAT'S BROKEN)

The existing codebase has:

**What's real and good:**
- Tobit heteroscedastic regressor with L-BFGS-B MLE (`censored_demand.py`) — legitimately impressive
- Cox PH fitter with Nelson-Aalen baseline hazard (`store_profitability.py`) — same
- PSI-based drift detection scaffold (`production_safeguards.py`) — concept is right
- Full Swiggy OAuth 2.1 + PKCE implementation (`swiggy_mcp_routes.py`) — keep as-is
- 35+ Swiggy MCP endpoints already wired: Food (16 tools), Instamart (13 tools), Dineout (8 tools)
- Alembic migrations, Redis lock manager, structured DB schema

**What's broken and will kill you in an interview:**

| Bug | File | Severity | Fix Time |
|---|---|---|---|
| PSI uses `generate_training_data()` not real `SalesEvent` rows | `ml.py` L94 | CRITICAL | 2h |
| `GLOBAL_STATS` counter mutations are thread-unsafe | `state.py` + `orders.py` | HIGH | 1h |
| `asyncio.get_event_loop()` deprecated in 3.10+, error in 3.12 | `restaurants.py` L56 | HIGH | 30min |
| `OAUTH_PENDING_SESSIONS` grows unboundedly on abandoned flows | `swiggy_mcp_routes.py` | MEDIUM | 45min |
| CORS wildcard `allow_origins=["*"]` | `main.py` | CRITICAL (prod) | 15min |
| Token validation is string-length theater | `restaurants.py` | MEDIUM | 1h |
| All ML metrics in `GLOBAL_STATS` are hardcoded, not from simulation | `state.py` | HIGH | 2h |
| Demand forecaster fit on random numpy arrays at import time | `state.py` L37-45 | HIGH | 3h |

Do not put this on your resume until the first 4 are fixed. Full stop.

---

## PRODUCT VISION: WHAT HyperFlow 4.0 IS

**Current HyperFlow:** A Swiggy wrapper that calls Swiggy's own APIs and shows the same data Swiggy already shows. An interviewer seeing this asks: "Why did you build this instead of just using Swiggy?"

**HyperFlow 4.0:** A food intelligence command center that runs live Swiggy MCP data through 7 production ML models to surface predictions Swiggy itself doesn't show users. An interviewer seeing this asks: "How did you build this?"

That question pivot is the entire point.

**The core differentiation:** Swiggy gives you data. HyperFlow gives you *predictions about* data. The demand oracle tells you bananas will be OOS in 90 minutes. The ETA truth detector tells you the delay is GPS jitter, not a real delay. The refund oracle tells you your complaint will be auto-approved before you file it. None of these exist in the Swiggy app.

---

## FULL FEATURE SET (ALL 5 MODULES)

### MODULE 1 — DEMAND ORACLE (Instamart Intelligence)
**Status:** Partially built in `oracle.py`. Needs real MCP data flow + auth passthrough.

**MCP tools:** `im.search_products`, `im.your_go_to_items`
**ML model:** `CensoredDemandForecaster` (Tobit + HistGBM)

**What it does:**
User connects Swiggy → HyperFlow pulls their frequently ordered Instamart items via `im.your_go_to_items` → Each item's availability passed to the Tobit forecaster with real weather features from OpenMeteo (free, no key needed) → Dashboard shows stockout risk per item with confidence intervals.

**The differentiating insight:** "Bananas have 81% stockout probability in the next 90 minutes — order now." Nobody shows this to users. This is the sentence that gets you the interview callback.

**Current gap in `oracle.py`:**
- Token not being passed from frontend to backend to MCP
- Feature vector uses random values (`30.5 + idx, 0.0, 1200.0`) instead of real product data
- Weather features hardcoded, not from OpenMeteo

**Fix:**
```python
# oracle.py — GET /api/v2/oracle/demand
async def get_demand_oracle(addressId: str, token: str = Depends(get_swiggy_token)):
    # 1. Fetch real go-to items
    go_to_res = await call_mcp_async("im", "your_go_to_items", {"addressId": addressId}, token)
    
    # 2. Fetch real weather from OpenMeteo (no API key)
    weather = await fetch_openmeteo_weather(lat, lng)  # free API
    
    # 3. Build real feature vector per item
    for item in items:
        features = np.array([[
            weather["temperature_2m"],
            weather["precipitation"],
            (datetime.now().hour * 3600),  # time_elapsed_sec
        ]])
        point, lower, upper = demand_forecaster.predict_with_intervals(features)
        
    # 4. Map to stockout risk
    risk = "HIGH" if (point / upper) > 0.8 else "MEDIUM" if (point / upper) > 0.5 else "LOW"
```

**API contract (v2):**
```
GET /api/v2/oracle/demand?addressId={id}
Headers: Authorization: Bearer {swiggy_token}
Response: {
  predictions: [{
    product_id, product_name,
    demand_forecast: { point, lower, upper, confidence },
    stockout_risk: "HIGH" | "MEDIUM" | "LOW",
    recommended_action: "ORDER_NOW" | "ORDER_WITHIN_2H" | "SAFE",
    time_to_stockout_minutes: 87
  }],
  weather_context: { temp_c: 32, rain_mm: 0 }
}
```

---

### MODULE 2 — ETA TRUTH DETECTOR
**Status:** Not built. WebSocket infrastructure missing. MIMO smoother exists in `state.py` via `GLOBAL_STATS` but is hardcoded.

**MCP tools:** `food.track_food_order`, `food.get_food_order_details`
**ML model:** `LearnedETASmoother` — RandomForest classifier + MIMO predictor (needs to be built or wired)

**What it does:**
User connects active order → HyperFlow polls `food.track_food_order` every 30 seconds via WebSocket relay → Each ETA ping run through the smoother → Dashboard shows: "This is GPS jitter (85% confidence) — ETA is actually stable" vs "Real delay — rider stopped for 4 minutes."

**Why this is the emotional hook for demos:** ETA bumps are the #1 Swiggy complaint on Twitter. Showing an ML model that tells you which bumps are real is viscerally satisfying. This is the feature that makes non-technical recruiters go "whoa."

**WebSocket architecture:**
```
Frontend (WS client)
    ↕ ws://localhost:8000/ws/eta-live/{order_id}
Backend (WS relay, asyncio loop)
    ↓ poll every 30s
Swiggy MCP food.track_food_order
    ↓
ETASmoother.classify(eta_sequence)
    ↓
Push update to WS client
```

**New file needed:** `backend/api/routers/eta_live.py`

```python
from fastapi import WebSocket, WebSocketDisconnect
import asyncio

@router.websocket("/ws/eta-live/{order_id}")
async def eta_live_feed(websocket: WebSocket, order_id: str, token: str):
    await websocket.accept()
    eta_history = []
    try:
        while True:
            # Poll Swiggy MCP
            track_res = await call_mcp_async("food", "track_food_order", 
                                              {"orderId": order_id}, token)
            current_eta = extract_eta(track_res)
            eta_history.append({"eta": current_eta, "ts": time.time()})
            
            # Run smoother
            if len(eta_history) >= 3:
                is_jitter = classify_eta_jitter(eta_history[-5:])
                smoothed = smooth_eta(eta_history)
            else:
                is_jitter = False
                smoothed = current_eta
            
            await websocket.send_json({
                "raw_eta_min": current_eta,
                "smoothed_eta_min": smoothed,
                "is_jitter": is_jitter,
                "confidence": 0.82,
                "explanation": "GPS noise — rider velocity consistent" if is_jitter 
                               else "Real delay — rider stationary"
            })
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        pass
```

**API contract:**
```
WS /ws/eta-live/{order_id}?token={swiggy_token}
Pushes every 30s: {
  raw_eta_min, smoothed_eta_min,
  is_jitter: bool, confidence: float,
  explanation: str
}
```

---

### MODULE 3 — REFUND ORACLE
**Status:** FraudGuard logic exists in `oracle.py` partially. Needs real order history pull.

**MCP tools:** `food.get_food_orders`, `food.get_food_order_details`
**ML model:** `FraudGuard.triage_refund_request()` — already exists in codebase

**What it does:**
User picks a past order → describes issue → HyperFlow fetches order items via `food.get_food_order_details` → Runs through FraudGuard triage → Shows: "AUTO_REFUND — 92% probability. Safe to file." or "VERIFICATION_REQUIRED — your complaint pattern has been flagged before."

**Why it matters for interviews:** You know Swiggy's fraud pipeline from the inside. An interviewer from Swiggy's trust & safety team will want to know how you built this. The answer ("I modeled the complaint text against semantic similarity of known valid complaints with TF-IDF + cosine threshold") shows depth.

**What needs building:**
```python
# New endpoint: POST /api/v2/refund/predict
@router.post("/api/v2/refund/predict")
async def predict_refund(payload: RefundPredictPayload, token: str = Depends(get_swiggy_token)):
    # 1. Fetch real order details from MCP
    order_res = await call_mcp_async("food", "get_food_order_details", 
                                      {"orderId": payload.order_id}, token)
    items = extract_items(order_res)
    
    # 2. Run FraudGuard triage
    result = fraud_guard.triage_refund_request(
        complaint_type=payload.complaint_type,
        complaint_text=payload.complaint_text,
        order_items=items,
        order_value=extract_value(order_res)
    )
    
    return {
        "predicted_outcome": result.outcome,        # AUTO_REFUND | VERIFICATION | HUMAN
        "fraud_probability": result.fraud_prob,
        "explanation": result.explanation,
        "recommendation": "Safe to file" if result.fraud_prob < 0.2 else "May be flagged"
    }
```

---

### MODULE 4 — DINEOUT SLOT SNIPER
**Status:** Dineout MCP endpoints exist in `swiggy_mcp_routes.py`. ML scoring layer missing.

**MCP tools:** `dineout.search_restaurants_dineout`, `dineout.get_available_slots`, `dineout.book_table`
**ML model:** Slot demand scorer (simple heuristic + time-of-day features — not overengineered)

**What it does:**
User inputs cuisine + date + party size → HyperFlow calls `dineout.search_restaurants_dineout` for matching venues → Calls `dineout.get_available_slots` for each → Scores slot "demand pressure" based on day, time, restaurant rating, historical cancellation proxy → Shows: "Book 7:30 PM at Smoke House — this slot fills in ~18 minutes." → One-click book via `dineout.book_table`.

**Slot scoring logic (keep simple, don't overengineer):**
```python
def score_slot_demand(restaurant_rating: float, slot_time: str, day_of_week: int) -> float:
    """
    Higher score = fills faster = book now.
    Simple heuristic: prime time (7-9pm) + weekend + high rating = high demand.
    """
    hour = parse_hour(slot_time)
    prime_time_weight = 1.0 if 19 <= hour <= 21 else 0.6
    weekend_weight = 1.2 if day_of_week in [5, 6] else 1.0
    rating_weight = restaurant_rating / 5.0
    
    return prime_time_weight * weekend_weight * rating_weight

def estimate_fill_time_minutes(demand_score: float) -> int:
    """Rough estimate: high-demand slots fill in 10-20 min, low-demand in 60+ min."""
    return max(10, int(60 * (1 - demand_score)))
```

**New endpoint:** `GET /api/v2/dineout/sniper?lat={}&lng={}&date={}&party={}&cuisine={}`

---

### MODULE 5 — DISPATCH INTELLIGENCE MAP
**Status:** `DispatchBatcher.optimize_batches()` exists in codebase. Frontend map not built.

**MCP tools:** `im.get_orders`, `food.get_food_orders`
**ML model:** `DispatchBatcher` + `get_rider_hotspots()` — both exist

**What it does:**
Pull user's last 10 delivery addresses → Run through `DispatchBatcher.optimize_batches()` → Show on Leaflet.js map: "Your last 5 orders could have been batched into 2 runs — estimated 8 min earlier." → Show rider hotspot recommendations.

**This is a visualization feature, not an ML feature.** Its purpose is to prove you understand logistics optimization. Don't spend more than 6 hours on it.

**New endpoint:** `POST /api/v2/dispatch/analyze`

```python
@router.post("/api/v2/dispatch/analyze")
async def analyze_dispatch(payload: DispatchPayload, token: str = Depends(get_swiggy_token)):
    # Fetch real order history
    food_orders = await call_mcp_async("food", "get_food_orders", {}, token)
    im_orders = await call_mcp_async("im", "get_orders", {}, token)
    
    # Extract delivery coordinates
    locations = extract_delivery_locations(food_orders) + extract_delivery_locations(im_orders)
    
    # Run batch optimizer
    batches = dispatch_batcher.optimize_batches(locations, store_location=payload.store_location)
    
    return {
        "total_orders": len(locations),
        "optimal_batches": len(batches),
        "estimated_time_saved_min": calculate_time_saved(locations, batches),
        "batch_routes": batches
    }
```

---

## CRITICAL BUG FIXES (DO THESE BEFORE ANYTHING ELSE)

### Fix 1 — Real PSI Data Pipeline (MOST IMPORTANT)
**File:** `backend/api/routers/ml.py` — `calculate_ml_robustness_task()`

Current broken code:
```python
X, observed_sales, censored, _, _ = generate_training_data(n_samples=100)  # FAKE
```

Fixed:
```python
async def calculate_ml_robustness_task(db: Session):
    # Query real SalesEvent data
    sales_events = db.query(SalesEvent)\
        .filter(SalesEvent.weather_temp.isnot(None))\
        .order_by(SalesEvent.created_at.desc())\
        .limit(200).all()
    
    if len(sales_events) < 30:
        # Not enough real data — skip, don't fake it
        state.CACHED_ROBUSTNESS_METRICS["status"] = "insufficient_data"
        state.CACHED_ROBUSTNESS_METRICS["message"] = f"Need 30 events, have {len(sales_events)}"
        return
    
    prod_df = pd.DataFrame([{
        'weather_temp': e.weather_temp,
        'weather_rain': e.weather_rain,
        'time_elapsed_sec': e.time_elapsed_sec
    } for e in sales_events])
    
    drift_metrics = safeguards.calculate_drift_metrics(prod_df)
    # ... rest of the function
```

### Fix 2 — Thread-Safe GLOBAL_STATS
**File:** `backend/core/state.py` + `backend/api/routers/orders.py`

```python
# state.py — already has stats_lock = asyncio.Lock() — use it
# orders.py — currently does this unsafely:
GLOBAL_STATS["reservations_total"] += 1  # NOT SAFE

# Fix (convert reserve_inventory to async):
async def reserve_inventory(req: ReserveRequest, db: Session = Depends(get_db)):
    async with state.stats_lock:
        state.GLOBAL_STATS["reservations_total"] += 1
```

### Fix 3 — asyncio.get_event_loop() → get_running_loop()
**File:** `backend/api/routers/restaurants.py` L56, L100

```python
# BEFORE:
loop = asyncio.get_event_loop()
# AFTER:
loop = asyncio.get_running_loop()
```

### Fix 4 — CORS Lockdown
**File:** `backend/api/main.py`

```python
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### Fix 5 — OAuth Session Cleanup (Already scaffolded, just wire it)
**File:** `backend/api/main.py` startup event

```python
@app.on_event("startup")
async def startup_event():
    from backend.api.swiggy_mcp_routes import cleanup_oauth_sessions
    asyncio.create_task(cleanup_oauth_sessions())  # was threading.Thread before
```

### Fix 6 — Demand Forecaster Seeding
**File:** `backend/core/state.py`

The current issue: forecaster is fit on random arrays at import time. This isn't a crash, but it means every prediction until retraining is from a model trained on noise.

Fix: Load pre-fit model from disk if it exists; fallback to synthetic only if not:
```python
import joblib, pathlib

MODEL_PATH = pathlib.Path("models/demand_forecaster.joblib")

def load_or_init_forecaster() -> CensoredDemandForecaster:
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    # First boot — fit on synthetic, flag clearly
    forecaster = CensoredDemandForecaster()
    # ... synthetic fit ...
    forecaster._is_synthetic = True  # Flag so logs can warn
    return forecaster

demand_forecaster = load_or_init_forecaster()
```

Add `POST /api/v2/ml/save-model` endpoint that calls `joblib.dump(demand_forecaster, MODEL_PATH)` after retraining.

---

## NEW DB TABLES NEEDED

```python
# Add to backend/db/models.py

class PriceHistory(Base):
    """For Module 1 price anomaly tracking (Tier 2 feature from earlier)"""
    __tablename__ = 'price_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(String(100), nullable=False)
    product_name = Column(String(200), nullable=False)
    price_inr = Column(Float, nullable=False)
    source = Column(String(50), default="instamart")  # instamart | zepto
    captured_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    hour_of_day = Column(Integer, nullable=False)
    
    __table_args__ = (
        Index('ix_price_history_product_time', 'product_id', 'captured_at'),
    )


class RefundPrediction(Base):
    """Audit log for refund oracle predictions"""
    __tablename__ = 'refund_predictions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(100), nullable=False)
    complaint_type = Column(String(100), nullable=False)
    predicted_outcome = Column(String(50), nullable=False)
    fraud_probability = Column(Float, nullable=False)
    actual_outcome = Column(String(50), nullable=True)  # filled in later if user reports back
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ETAEvent(Base):
    """Raw ETA observations for smoother training"""
    __tablename__ = 'eta_events'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(100), nullable=False)
    raw_eta_min = Column(Integer, nullable=False)
    smoothed_eta_min = Column(Integer, nullable=True)
    is_jitter = Column(Boolean, nullable=True)
    captured_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

---

## FRONTEND ARCHITECTURE

### Design System: "Precision Tooling"

This matches the aesthetic from the existing PRD. Implement it once, consistently:

```css
/* globals.css */
:root {
  --bg-primary:    #09090E;
  --bg-surface:    #111118;
  --bg-elevated:   #1A1A24;
  --border:        rgba(255,255,255,0.06);
  --text-primary:  #F0F0F8;
  --text-secondary:#8888A8;
  --accent-orange: #FF6B35;   /* primary CTA, live indicators */
  --accent-cyan:   #00D4FF;   /* ML confidence, predictions */
  --accent-green:  #00FF88;   /* success, low risk */
  --accent-red:    #FF3355;   /* fraud alert, high risk */
  --accent-yellow: #FFB800;   /* warnings, medium risk */
  
  --font-display:  'IBM Plex Mono', monospace;
  --font-body:     'IBM Plex Sans', sans-serif;
}
```

### Component Structure

```
src/
  pages/
    CommandCenter.jsx       ← Main dashboard, overview of all 5 modules
    DemandOracle.jsx        ← Module 1: Instamart stockout predictions
    EtaTruth.jsx            ← Module 2: Live ETA smoother
    RefundOracle.jsx        ← Module 3: Refund outcome predictor
    DineoutSniper.jsx       ← Module 4: Slot intelligence + booking
    DispatchMap.jsx         ← Module 5: Batch optimizer visualization
    AuthCallback.jsx        ← OAuth callback handler
  components/
    ConfidenceArc.jsx       ← SVG arc showing ML probability (signature component)
    RiskBadge.jsx           ← HIGH / MEDIUM / LOW indicator
    LivePulse.jsx           ← Animated dot for live data feeds
    MetricCard.jsx          ← Dark card with monospace data display
    ETATimeline.jsx         ← Animated raw vs. smoothed ETA comparison
    SwiggyConnectButton.jsx ← OAuth trigger
  hooks/
    useSwiggyAuth.js        ← Token storage + refresh
    useETASocket.js         ← WebSocket ETA feed
    useMCPQuery.js          ← TanStack Query wrapper for MCP endpoints
  api/
    hyperflow.js            ← All /api/v2/ calls
    mcp.js                  ← Swiggy MCP passthrough calls
```

### The ConfidenceArc Component (Signature Element)

Every ML prediction shows an animated SVG arc. This is the visual identity of HyperFlow. It's what makes screenshots look like ML, not a CRUD app.

```jsx
// components/ConfidenceArc.jsx
export function ConfidenceArc({ confidence, label, color = "var(--accent-cyan)" }) {
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference * (1 - confidence);
  
  return (
    <div className="confidence-arc">
      <svg viewBox="0 0 100 100" width="120" height="120">
        {/* Background track */}
        <circle cx="50" cy="50" r="40" fill="none" 
                stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        {/* Confidence arc */}
        <circle cx="50" cy="50" r="40" fill="none"
                stroke={color} strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        {/* Label */}
        <text x="50" y="46" textAnchor="middle" 
              fill="var(--text-primary)" fontSize="18" fontFamily="IBM Plex Mono">
          {Math.round(confidence * 100)}%
        </text>
        <text x="50" y="62" textAnchor="middle" 
              fill="var(--text-secondary)" fontSize="9" fontFamily="IBM Plex Sans">
          {label}
        </text>
      </svg>
    </div>
  );
}
```

### Dependencies to Add

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "framer-motion": "^11.0.0",
    "recharts": "^2.10.0"
  }
}
```

---

## OPEN METEO INTEGRATION (Free Weather, No API Key)

This replaces the hardcoded `30.5 + idx` temperature values in the demand oracle.

```python
# backend/services/weather.py
import httpx

async def fetch_weather(lat: float, lng: float) -> dict:
    """
    OpenMeteo API — completely free, no key needed.
    Returns current temperature and precipitation.
    """
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lng,
                "current": ["temperature_2m", "precipitation"],
                "forecast_days": 1
            },
            timeout=5.0
        )
        data = res.json()
        return {
            "temperature_2m": data["current"]["temperature_2m"],
            "precipitation": data["current"]["precipitation"]
        }
```

Cache results for 1 hour in Redis (same key for same city):
```python
WEATHER_CACHE_TTL = 3600  # 1 hour

async def get_cached_weather(lat: float, lng: float) -> dict:
    cache_key = f"weather:{round(lat,2)}:{round(lng,2)}"
    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    weather = await fetch_weather(lat, lng)
    await redis_client.setex(cache_key, WEATHER_CACHE_TTL, json.dumps(weather))
    return weather
```

---

## DEMO MODE (Required for Interviews Without OAuth)

Every feature must work in demo mode. An interviewer will not have a Swiggy account ready.

```python
# backend/core/demo_data.py
DEMO_INSTAMART_ITEMS = [
    {"id": "d_1", "name": "Amul Taaza Toned Fresh Milk", "price_inr": 62},
    {"id": "d_2", "name": "Fresho Eggs Farm Fresh", "price_inr": 89},
    {"id": "d_3", "name": "Britannia Good Day Biscuits", "price_inr": 45},
    {"id": "d_4", "name": "Aashirvaad Atta Whole Wheat", "price_inr": 135},
    {"id": "d_5", "name": "Country Delight Desi Ghee", "price_inr": 299},
]

DEMO_FOOD_ORDERS = [
    {
        "orderId": "demo_001", 
        "restaurantName": "Biryani Blues",
        "items": [{"name": "Chicken Biryani", "quantity": 1}],
        "totalAmount": 299,
        "currentETA": 34,
        "status": "OUT_FOR_DELIVERY"
    }
]

DEMO_ADDRESS = {"addressId": "demo_addr_1", "lat": 12.9716, "lng": 77.5946}  # Bengaluru
```

Every MCP-dependent endpoint follows this fallback pattern:
```python
try:
    result = await call_mcp_async(server, tool, args, token)
except Exception:
    result = get_demo_data(tool)  # Always works, never crashes
```

---

## ENGINEERING ROADMAP

### Phase 1 — Ship Blockers (Week 1, ~28h)

Priority: These must be done before showing this to anyone.

| Task | File | Est. Time |
|---|---|---|
| Fix fake PSI → real SalesEvent pipeline | `ml.py` | 3h |
| Fix CORS wildcard | `main.py` | 20min |
| Fix `asyncio.get_event_loop()` | `restaurants.py` | 30min |
| Fix OAuth session memory leak | `swiggy_mcp_routes.py` | 45min |
| Thread-safe GLOBAL_STATS | `state.py`, `orders.py` | 1h |
| Add model persistence (`joblib.dump`) | `state.py`, new `services/model_store.py` | 2h |
| Fix demand oracle token passthrough | `oracle.py` | 2h |
| Wire OpenMeteo weather service | new `services/weather.py` | 2h |
| Add `PriceHistory`, `RefundPrediction`, `ETAEvent` tables + Alembic migration | `models.py` | 2h |
| Add demo mode fallbacks for all 5 modules | new `core/demo_data.py` | 3h |
| Rebuild frontend with IBM Plex design system + ConfidenceArc | React components | 8h |

### Phase 2 — Core Features (Week 2–3, ~42h)

| Task | Est. Time |
|---|---|
| Module 1: Demand Oracle — full MCP data flow + real weather | 8h |
| Module 2: ETA Truth — WebSocket relay + smoother logic | 10h |
| Module 3: Refund Oracle — FraudGuard integration + audit log | 5h |
| Module 4: Dineout Sniper — MCP slot fetch + demand scoring + booking | 8h |
| SalesEvent ingestion pipeline (write real events to DB when demo runs) | 3h |
| Structured logging with `structlog` for PSI + fraud events | 3h |
| API integration tests with `pytest-asyncio` for all v2 endpoints | 5h |

### Phase 3 — Portfolio Polish (Week 4, ~20h)

| Task | Est. Time |
|---|---|
| Module 5: Dispatch Intelligence Map (Leaflet.js) | 6h |
| Model cards — document assumptions, training data, limitations | 4h |
| GitHub README with architecture diagram + real benchmark table | 4h |
| Deploy: Railway (backend) + Vercel (frontend) | 4h |
| 60-second demo path tested + recorded as GIF | 2h |

---

## BENCHMARK TABLE (Must Come From Real Code)

The following numbers must be generated from actual simulation runs, not hardcoded. Here's how to generate each:

| Metric | How to Generate | Do NOT Hardcode |
|---|---|---|
| Tobit WMAPE lift | `python benchmarks/m5_wmape_benchmark.py` → read from results JSON | `wmape_lift: 0.331` in GLOBAL_STATS |
| ETA jitter suppression | Log `is_jitter=True/False` for 100 orders, compute ratio | `raw_mimo_bumps: 113` in GLOBAL_STATS |
| Fraud triage F1 | Run `FraudGuard` on a labeled CSV of known outcomes | Anything not from labeled data |
| Inventory reservation p95 latency | `python benchmarks/load_test.py` → read from JSON | Any hardcoded latency |
| PSI scores | Run background task against real `SalesEvent` rows | `psi: 0.0412` hardcoded in GLOBAL_STATS |

Put all benchmark outputs in `benchmarks/results/`. Commit them. When an interviewer asks "where did this number come from?" you show them the results file and the script that generated it.

---

## WHAT TO KILL

**The Gemini chat interface in `chat.py`.** It's the weakest part of the codebase:
- It reimplements tool-calling that Gemini handles natively
- It exposes a chatbot that does worse restaurant search than Swiggy's own search bar
- It has nothing to do with the ML models, which are the actual differentiator

If you want an NL interface, build it as a thin wrapper on the Demand Oracle and Refund Oracle, not a general chatbot. Or drop it entirely. The 5 modules above are the product.

**The `buttons/` folder.** 24 SVG button files that aren't referenced anywhere in the codebase.

---

## SUCCESS DEFINITION

This project is ready to submit when:

1. `git clone` → `docker-compose up` → demo runs without errors in under 5 minutes
2. Demo mode works without Swiggy OAuth (all 5 modules show data)
3. With Swiggy OAuth: Demand Oracle and Refund Oracle run against real API data
4. PSI metrics come from real `SalesEvent` rows (or clearly flag "insufficient data, need 30+ events")
5. Every benchmark number in the README has a corresponding script in `benchmarks/` that generates it
6. The 6-question interview stress test from `PROJECT_READY_SOP.md` passes for all 5 modules
7. You can explain the Tobit MLE optimization without notes

If you can do #7, the rest is execution. The ML implementations are already genuinely strong.
