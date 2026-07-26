"""
HyperFlow MCP Server
Exposes HyperFlow ML tools to Hermes Agent and any MCP-compatible agent.
Transport: Streamable HTTP on port 8001
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
import httpx
import os

mcp_app = FastAPI(
    title="HyperFlow MCP Server",
    description="MCP-compatible tool gateway for HyperFlow's ML operations",
    version="1.0.0"
)

HYPERFLOW_BASE = os.getenv("HYPERFLOW_API_URL", "http://localhost:8000")


# ── Tool schemas ─────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    store_id: int = Field(..., description="Dark store ID to forecast for")
    horizon_hours: int = Field(24, ge=1, le=168, description="Forecast horizon in hours")
    include_intervals: bool = Field(True, description="Include 90% confidence intervals")

class PSIRequest(BaseModel):
    store_id: int = Field(..., description="Store ID to check drift for")
    feature: Optional[str] = Field(None, description="Specific feature to check, or None for all")

class ProfitabilityRequest(BaseModel):
    pop_density: float = Field(..., description="Population density (10k/km2)")
    competitor_density: int = Field(..., description="Competitors within 2km radius")
    dist_to_profitable: float = Field(..., description="Distance to nearest profitable store (km)")
    initial_sku_count: float = Field(..., description="Launch SKU count (in thousands)")
    avg_aov_in_zone: float = Field(..., description="Average order value in zone (INR/100)")
    non_grocery_share: float = Field(..., ge=0.0, le=1.0, description="Non-grocery GMV share")

class ReserveRequest(BaseModel):
    store_id: int
    item_id: str
    quantity: int = Field(..., ge=1)
    idempotency_key: str = Field(..., description="UUID for atomic reservation")


# ── MCP Tool endpoints ───────────────────────────────────────────

@mcp_app.post("/tools/forecast_demand")
async def forecast_demand(req: ForecastRequest) -> Dict[str, Any]:
    """
    MCP Tool: forecast_demand
    
    Runs the Heteroscedastic Tobit censored demand forecast for a dark store.
    Returns point forecast, 90% CI lower/upper bounds, and WMAPE confidence.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{HYPERFLOW_BASE}/api/v1/forecast/demand",
                json=req.model_dump(),
                timeout=30.0
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HyperFlow backend error: {str(e)}")


@mcp_app.get("/tools/get_psi_status")
async def get_psi_status(store_id: int, feature: Optional[str] = None) -> Dict[str, Any]:
    """
    MCP Tool: get_psi_status
    
    Returns current Population Stability Index for a store's feature distributions.
    PSI < 0.10 = GREEN (stable), 0.10-0.20 = AMBER (monitor), > 0.20 = RED (retrain).
    """
    async with httpx.AsyncClient() as client:
        try:
            params: Dict[str, Any] = {"store_id": store_id}
            if feature:
                params["feature"] = feature
            resp = await client.get(
                f"{HYPERFLOW_BASE}/api/v1/safeguards/psi",
                params=params,
                timeout=15.0
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HyperFlow backend error: {str(e)}")


@mcp_app.post("/tools/score_profitability")
async def score_profitability(req: ProfitabilityRequest) -> Dict[str, Any]:
    """
    MCP Tool: score_profitability
    
    Runs the Cox PH survival model to predict time-to-profitability for a 
    new dark store location. Returns median months to breakeven and 
    monthly survival probability curve (12-month horizon).
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{HYPERFLOW_BASE}/api/v1/profitability/score",
                json=req.model_dump(),
                timeout=20.0
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HyperFlow backend error: {str(e)}")


@mcp_app.post("/tools/reserve_inventory")
async def reserve_inventory(req: ReserveRequest) -> Dict[str, Any]:
    """
    MCP Tool: reserve_inventory
    
    Atomically reserves inventory using Redis distributed lock.
    Idempotent — same idempotency_key always returns same result.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{HYPERFLOW_BASE}/api/v1/inventory/reserve",
                json=req.model_dump(),
                timeout=10.0
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HyperFlow backend error: {str(e)}")


@mcp_app.get("/tools/get_store_context")
async def get_store_context(store_id: int) -> Dict[str, Any]:
    """
    MCP Tool: get_store_context
    
    Returns full operational context for a store: current inventory levels,
    last forecast run, PSI status, profitability score, active reservations.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{HYPERFLOW_BASE}/api/v1/stores/{store_id}/context",
                timeout=10.0
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HyperFlow backend error: {str(e)}")


@mcp_app.get("/tools/get_robustness_metrics")
async def get_robustness_metrics(store_id: int) -> Dict[str, Any]:
    """
    MCP Tool: get_robustness_metrics
    
    Returns ML robustness metrics: clipping rates per feature, PSI history,
    model confidence bands, anomaly flags.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{HYPERFLOW_BASE}/api/v1/safeguards/robustness",
                params={"store_id": store_id},
                timeout=10.0
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HyperFlow backend error: {str(e)}")


# ── MCP manifest ─────────────────────────────────────────────────

@mcp_app.get("/.well-known/mcp.json")
async def mcp_manifest() -> Dict[str, Any]:
    """MCP discovery manifest for Hermes and other MCP clients."""
    return {
        "name": "hyperflow-ml",
        "version": "1.0.0",
        "description": "HyperFlow dark store ML tools — demand forecasting, profitability scoring, PSI drift detection",
        "transport": "http",
        "tools_endpoint": "/tools",
        "author": "HyperFlow",
    }
