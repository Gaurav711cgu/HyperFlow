import pytest
import httpx

from backend.ml.dark_store_site_selection import SiteProfile, evaluate_site, haversine_km
from backend.mcp_server import mcp_app
from backend.api.main import app as backend_app


def test_haversine_distance_is_reasonable_for_bengaluru_blocks():
    distance = haversine_km(12.9352, 77.6245, 12.9410, 77.6200)
    assert 0.7 <= distance <= 0.9


def test_site_selection_recommends_go_for_high_density_tech_corridor():
    decision = evaluate_site(
        SiteProfile(
            pincode="560103",
            city="Bengaluru",
            latitude=12.9352,
            longitude=77.6245,
            avg_daily_food_orders_zone=240,
            avg_order_value_food=420,
            cancellation_rate_food=0.08,
            peak_hour_concentration=0.52,
            zone_type="tech_corridor",
            existing_blinkit_stores_radius=1,
            existing_zepto_stores_radius=1,
            existing_swiggy_dark_stores_radius=0,
            real_estate_cost_monthly=145000,
            median_household_income_index=1.15,
            college_or_office_density_index=1.25,
        )
    )

    assert decision.recommendation == "GO"
    assert decision.projected_breakeven_months <= 9.5
    assert decision.recommended_initial_sku_count >= 3000
    assert "ready-to-eat" in decision.priority_categories


def test_site_selection_rejects_saturated_low_density_site():
    decision = evaluate_site(
        SiteProfile(
            pincode="751001",
            city="Bhubaneswar",
            latitude=20.2961,
            longitude=85.8245,
            avg_daily_food_orders_zone=28,
            avg_order_value_food=210,
            cancellation_rate_food=0.02,
            peak_hour_concentration=0.82,
            zone_type="suburban",
            existing_blinkit_stores_radius=3,
            existing_zepto_stores_radius=2,
            existing_swiggy_dark_stores_radius=2,
            real_estate_cost_monthly=180000,
        )
    )

    assert decision.recommendation == "NO-GO"
    assert decision.ttp_risk_flag is True
    assert decision.confidence_level == "LOW"


@pytest.mark.asyncio
async def test_mcp_dark_store_site_tool():
    transport = httpx.ASGITransport(app=mcp_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/tools/evaluate_dark_store_site",
            json={
                "pincode": "560103",
                "city": "Bengaluru",
                "latitude": 12.9352,
                "longitude": 77.6245,
                "avg_daily_food_orders_zone": 210,
                "avg_order_value_food": 385,
                "cancellation_rate_food": 0.09,
                "peak_hour_concentration": 0.55,
                "zone_type": "tech_corridor",
                "existing_blinkit_stores_radius": 1,
                "existing_zepto_stores_radius": 1,
                "existing_swiggy_dark_stores_radius": 0,
                "real_estate_cost_monthly": 150000,
            },
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["model"] == "HyperFlow Dark Store Site Selection v1"
    assert data["recommendation"] in {"GO", "HOLD"}
    assert "projected_breakeven_months" in data


@pytest.mark.asyncio
async def test_v2_strategy_endpoint():
    transport = httpx.ASGITransport(app=backend_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v2/strategy/dark-store/site-selection",
            json={
                "pincode": "560103",
                "city": "Bengaluru",
                "latitude": 12.9352,
                "longitude": 77.6245,
                "avg_daily_food_orders_zone": 210,
                "avg_order_value_food": 385,
                "cancellation_rate_food": 0.09,
                "peak_hour_concentration": 0.55,
                "zone_type": "tech_corridor",
                "existing_blinkit_stores_radius": 1,
                "existing_zepto_stores_radius": 1,
                "existing_swiggy_dark_stores_radius": 0,
                "real_estate_cost_monthly": 150000,
            },
        )

    assert resp.status_code == 200
    assert resp.json()["strategy_question"].startswith("Should Swiggy open")
