import pytest
import httpx
from backend.mcp_server import mcp_app
from backend.api.main import app as backend_app

@pytest.mark.asyncio
async def test_mcp_manifest():
    transport = httpx.ASGITransport(app=mcp_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/.well-known/mcp.json")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "hyperflow-ml"
        assert data["transport"] == "http"

@pytest.mark.asyncio
async def test_mcp_tools_with_asgi():
    # Test MCP tool handlers directly by pointing transport at backend_app
    backend_transport = httpx.ASGITransport(app=backend_app)
    
    # 1. Forecast Demand
    async with httpx.AsyncClient(transport=backend_transport, base_url="http://localhost:8000") as client:
        resp_forecast = await client.post("/api/v1/forecast/demand", json={
            "store_id": 1,
            "horizon_hours": 24,
            "include_intervals": True
        })
        assert resp_forecast.status_code == 200
        f_data = resp_forecast.json()
        assert "point_forecast" in f_data
        assert "lower_90" in f_data
        assert "upper_90" in f_data

        # 2. Get PSI Status
        resp_psi = await client.get("/api/v1/safeguards/psi", params={"store_id": 1})
        assert resp_psi.status_code == 200
        psi_data = resp_psi.json()
        assert "overall_psi" in psi_data
        assert "status" in psi_data

        # 3. Score Profitability
        resp_prof = await client.post("/api/v1/profitability/score", json={
            "pop_density": 8.5,
            "competitor_density": 3,
            "dist_to_profitable": 1.4,
            "initial_sku_count": 4.2,
            "avg_aov_in_zone": 580.0,
            "non_grocery_share": 0.28
        })
        assert resp_prof.status_code == 200
        prof_data = resp_prof.json()
        assert "months_to_profit_median" in prof_data

        # 4. Reserve Inventory
        resp_res = await client.post("/api/v1/inventory/reserve", json={
            "store_id": 1,
            "item_id": "SKU_101",
            "quantity": 5,
            "idempotency_key": "test-uuid-key-001"
        })
        assert resp_res.status_code == 200
        res_data = resp_res.json()
        assert res_data["status"] == "RESERVED"

        # 5. Store Context
        resp_ctx = await client.get("/api/v1/stores/1/context")
        assert resp_ctx.status_code == 200
        ctx_data = resp_ctx.json()
        assert ctx_data["store_id"] == 1

        # 6. Robustness Metrics
        resp_rob = await client.get("/api/v1/safeguards/robustness", params={"store_id": 1})
        assert resp_rob.status_code == 200
        rob_data = resp_rob.json()
        assert rob_data["store_id"] == 1
