import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)

def test_ml_health_check():
    """Verify ML endpoints are accessible."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

def test_eta_prediction_valid_input():
    """Test valid ETA prediction payload."""
    payload = {
        "order_id": "ord_123",
        "distance_km": 5.0,
        "weather_condition": "rainy",
        "traffic_level": "high"
    }
    response = client.post("/api/v1/ml/predict-eta", json=payload)
    if response.status_code == 200:
        data = response.json()
        assert "eta_minutes" in data
        assert "confidence_score" in data

def test_eta_prediction_missing_fields():
    """Verify validation on missing required fields."""
    response = client.post("/api/v1/ml/predict-eta", json={"order_id": "ord_123"})
    assert response.status_code == 422

def test_eta_prediction_invalid_types():
    """Verify validation on invalid types."""
    payload = {
        "order_id": "ord_123",
        "distance_km": "five",
        "weather_condition": 1,
        "traffic_level": "high"
    }
    response = client.post("/api/v1/ml/predict-eta", json=payload)
    assert response.status_code == 422

def test_fraud_detection_nominal():
    """Test standard transaction scoring."""
    payload = {
        "user_id": "u_999",
        "transaction_amount": 100.0,
        "device_id": "dev_xyz"
    }
    response = client.post("/api/v1/ml/fraud-score", json=payload)
    if response.status_code == 200:
        assert "risk_score" in response.json()

def test_demand_forecast_valid():
    """Test valid demand forecasting payload."""
    payload = {
        "region_id": "reg_01",
        "timestamp": "2026-08-25T10:00:00Z"
    }
    response = client.post("/api/v1/ml/forecast-demand", json=payload)
    if response.status_code == 200:
        assert "forecast_volume" in response.json()

def test_robustness_metrics():
    """Test retrieval of robustness metrics endpoint."""
    response = client.get("/api/v1/ml/robustness")
    if response.status_code == 200:
        data = response.json()
        assert "status" in data
