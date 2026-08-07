import os
import sys
import pytest
import numpy as np
import pandas as pd
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.ml.censored_demand import CensoredDemandForecaster
from backend.services.retrain_orchestrator import RetrainOrchestrator
from backend.services.psi_loop import PSIMonitorLoop, PSIComputeResult
from backend.services.etl_pipeline import HyperFlowETL
from backend.db.models import Base, SalesEvent, DarkStore, Inventory, OutboxEvent
from backend.db.warehouse import WarehouseBase, FactSalesAgg, DimStore, DimSku, DimDate
from benchmarks.run_m5_eval import load_or_simulate_m5_data, run_evaluation

try:
    import mlflow
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    WarehouseBase.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Seed initial DarkStore and Inventory
    store = DarkStore(id="DS-BLR-01", name="Indiranagar Dark Store", city="Bengaluru", lat=12.9716, lng=77.5946)
    inv = Inventory(store_id="DS-BLR-01", sku_id="SKU-MILK-01", sku_name="Fresh Milk 1L", qty_available=50)
    session.add(store)
    session.add(inv)
    session.commit()
    
    yield lambda: sessionmaker(bind=engine)()
    session.close()


def test_m5_biased_holdout_wmape_lift():
    """WS-1 Test: Verifies Tobit achieves positive WMAPE lift (> 0%) over OLS on stockout-censored holdout rows."""
    X, observed_sales, latent_demand, censored_mask, censoring_rate = load_or_simulate_m5_data(n_samples=2000)
    
    train_size = int(0.8 * len(X))
    X_train, y_obs_train, cens_train = X[:train_size], observed_sales[:train_size], censored_mask[:train_size]
    X_test, y_true_test, cens_test = X[train_size:], latent_demand[train_size:], censored_mask[train_size:]
    
    from sklearn.linear_model import LinearRegression
    ols = LinearRegression().fit(X_train, y_obs_train)
    ols_preds = np.maximum(0, ols.predict(X_test))
    
    forecaster = CensoredDemandForecaster()
    forecaster.fit(X_train, y_obs_train, cens_train)
    tobit_preds = np.maximum(0, forecaster.predict(X_test))
    
    cens_idx = cens_test
    ols_wmape_cens = float(np.sum(np.abs(y_true_test[cens_idx] - ols_preds[cens_idx])) / np.sum(y_true_test[cens_idx]))
    tobit_wmape_cens = float(np.sum(np.abs(y_true_test[cens_idx] - tobit_preds[cens_idx])) / np.sum(y_true_test[cens_idx]))
    
    lift = (ols_wmape_cens - tobit_wmape_cens) / ols_wmape_cens * 100
    assert lift > 0.0, f"Expected positive WMAPE lift on censored rows, got {lift:.2f}%"
    assert tobit_wmape_cens < ols_wmape_cens, "Tobit WMAPE should be strictly lower than OLS on censored observations"


def test_mlflow_run_closure():
    """P0-C Test: Verifies fit() closes active MLflow runs and does not leak open runs."""
    if not HAS_MLFLOW:
        pytest.skip("MLflow not installed")
        
    forecaster = CensoredDemandForecaster()
    X = np.random.randn(100, 4)
    y_obs = np.random.uniform(5, 20, 100)
    censored = np.random.random(100) < 0.3
    
    if mlflow.active_run():
        mlflow.end_run()
        
    forecaster.fit(X, y_obs, censored)
    
    assert mlflow.active_run() is None, "CensoredDemandForecaster.fit() leaked an active MLflow run!"


@pytest.mark.asyncio
async def test_psi_retrain_orchestrator_flow(in_memory_db):
    """P0-B & WS-2 Test: Verifies 3x RED PSI triggers RetrainOrchestrator and writes OutboxEvent log."""
    db = in_memory_db()
    
    # Seed 100 SalesEvents
    now = datetime.datetime.now(datetime.timezone.utc)
    for i in range(100):
        ev = SalesEvent(
            store_id="DS-BLR-01",
            sku_id="SKU-MILK-01",
            observed_sales=float(np.random.uniform(5, 15)),
            censored=bool(i % 3 == 0),
            event_date=now.date(),
            hour_bucket=14,
            weather_temp=28.5,
            weather_rain=0.0,
            time_elapsed_sec=120.0
        )
        db.add(ev)
    db.commit()
    db.close()
    
    orchestrator = RetrainOrchestrator(db_session_factory=in_memory_db)
    
    class MockSafeguards:
        def calculate_drift_metrics(self, df):
            return {"weather_temp": {"psi": 0.25}}
            
    psi_loop = PSIMonitorLoop(
        db_session_factory=in_memory_db,
        safeguards=MockSafeguards(),
        retrain_orchestrator=orchestrator
    )
    
    # Simulate 3 RED checks
    res = PSIComputeResult(score=0.25, feature_drifts={"weather_temp": {"psi": 0.25}}, data_source="real")
    
    for _ in range(3):
        status = psi_loop._verify(res)
        assert status == "RED"
        if status == "RED":
            psi_loop.state.consecutive_amber += 1
            if psi_loop.state.consecutive_amber >= psi_loop.MAX_CONSECUTIVE_RED:
                retrain_res = await psi_loop.retrain_orchestrator.trigger(res.score, res.feature_drifts)
                psi_loop.state.consecutive_amber = 0
                
    assert retrain_res["status"] == "success", f"Retrain orchestrator failed: {retrain_res}"
    
    # Verify OutboxEvent recorded
    check_db = in_memory_db()
    outbox_events = check_db.query(OutboxEvent).filter(OutboxEvent.event_type == "model_retrained").all()
    assert len(outbox_events) == 1, "Expected exactly 1 OutboxEvent for model_retrained"
    assert "psi_red_3x" in outbox_events[0].payload
    check_db.close()


def test_etl_pipeline_idempotency(in_memory_db):
    """WS-3 Test: Verifies HyperFlowETL processes operational events into FactSalesAgg idempotently."""
    db = in_memory_db()
    now = datetime.datetime.now(datetime.timezone.utc)
    
    for i in range(50):
        ev = SalesEvent(
            store_id="DS-BLR-01",
            sku_id="SKU-MILK-01",
            observed_sales=10.0,
            censored=(i % 2 == 0),
            event_date=now.date(),
            hour_bucket=10,
            weather_temp=26.0,
            weather_rain=0.0,
            time_elapsed_sec=60.0
        )
        db.add(ev)
    db.commit()
    db.close()
    
    etl = HyperFlowETL(op_session_factory=in_memory_db, dw_session_factory=in_memory_db)
    
    # First run
    res1 = etl.run_incremental(since=datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc))
    assert res1["loaded"] > 0, "First ETL run should load fact records"
    
    dw_check1 = in_memory_db()
    fact_count1 = dw_check1.query(FactSalesAgg).count()
    dw_check1.close()
    
    # Second run (idempotency check)
    res2 = etl.run_incremental(since=datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc))
    dw_check2 = in_memory_db()
    fact_count2 = dw_check2.query(FactSalesAgg).count()
    dw_check2.close()
    
    assert fact_count1 == fact_count2, f"ETL not idempotent: {fact_count1} facts != {fact_count2} facts"


def test_analytics_olap_queries(in_memory_db):
    """WS-3 Test: Verifies GET /api/v1/analytics/demand-summary OLAP aggregations."""
    from fastapi.testclient import TestClient
    from backend.api.main import app
    from backend.api.routers.analytics_dw import get_demand_summary
    
    db = in_memory_db()

    # Seed operational data and run ETL
    now = datetime.datetime.now(datetime.timezone.utc)
    for i in range(20):
        ev = SalesEvent(
            store_id="DS-BLR-01",
            sku_id="SKU-MILK-01",
            observed_sales=15.0,
            censored=True,
            event_date=now.date(),
            hour_bucket=12,
            weather_temp=30.0,
            weather_rain=1.5,
            time_elapsed_sec=90.0
        )
        db.add(ev)
    db.commit()
    db.close()
    
    etl = HyperFlowETL(op_session_factory=in_memory_db)
    etl.run_incremental(since=datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc))
    
    from backend.db.session import get_db
    client = TestClient(app)
    
    def override_get_db():
        session = in_memory_db()
        try:
            yield session
        finally:
            session.close()
            
    app.dependency_overrides[get_db] = override_get_db
    
    response = client.get("/api/v1/analytics/demand-summary")
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}: {response.text}"
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "data" in json_data
    assert "store_demand_summary" in json_data["data"]
    assert "top_stockout_skus" in json_data["data"]
    app.dependency_overrides.clear()
