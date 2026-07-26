import pytest
import asyncio
import numpy as np
from backend.core.state import demand_forecaster
from backend.ml.production_safeguards import ProductionSafeguards
from backend.ml.verifier import DemandForecastVerifier, VerificationResult
from backend.ml.harness import MLHarness
from backend.services.psi_loop import PSIMonitorLoop
from backend.services.store_context import StoreContextCache

def test_verifier_bounds():
    verifier = DemandForecastVerifier()
    
    # Normal prediction check
    res_normal = verifier.check(np.array([12.5, 45.0]), context={})
    assert not res_normal.triggered
    assert res_normal.action == "ship"
    
    # Negative prediction check
    res_neg = verifier.check(np.array([-5.0, 10.0]), context={})
    assert res_neg.triggered
    assert res_neg.action == "fallback"
    
    # Extreme uplift ratio check vs OLS baseline
    res_uplift = verifier.check(np.array([100.0]), context={"ols_baseline": np.array([10.0])})
    assert res_uplift.triggered
    assert res_uplift.action == "alert"

def test_ml_harness_execution():
    safeguards = ProductionSafeguards()
    harness = MLHarness(demand_forecaster, safeguards)
    
    X_input = np.array([[28.5, 2.0, 950.0]])
    context = {"feature_names": ["weather_temp", "weather_rain", "time_elapsed_sec"]}
    
    result = harness.run(X_input, context)
    assert result.model_name == "CensoredDemandForecaster"
    assert len(result.input_hash) == 8
    assert result.action == "ship"

@pytest.mark.asyncio
async def test_store_context_cache():
    cache = StoreContextCache(redis_client=None)
    await cache.set_context("store_01", {"profitability_score": 0.88, "status": "nominal"})
    ctx = await cache.get_context("store_01")
    assert ctx is not None
    assert ctx["profitability_score"] == 0.88
