"""
HyperFlow — Credibility Fixes Verification Tests
=================================================
Verifies that all 3 credibility issues identified in the PRD are fixed:
1. Load test hits actual ML forecast inference route (/api/ml/demand-forecast), not /health.
2. M5 benchmark uses structured Kaggle/empirical time-series schema (sales_train_evaluation.csv).
3. PSI reference baseline is seeded from historical distributions, avoiding synthetic fallbacks.
"""

import os
import json
import pytest
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "m5"
RESULTS_DIR = ROOT / "benchmarks" / "results"
MODELS_DIR = ROOT / "models"


def test_load_test_hits_ml_endpoint():
    """Fix Issue 1: Verify load test targets actual ML endpoint, not /health."""
    results_path = RESULTS_DIR / "load_test_results.json"
    assert results_path.exists(), "Load test results file must exist"
    
    with open(results_path) as f:
        data = json.load(f)
        
    assert data["endpoint"] in ["/api/ml/demand-forecast", "/api/ml/forecast"], (
        f"Load test endpoint must be an ML inference route. Got {data.get('endpoint')}"
    )
    assert data["req_per_sec"] > 0, "Throughput must be > 0 req/sec"
    assert data["error_rate_pct"] == 0.0, "Load test should have 0% error rate"


def test_m5_dataset_structure():
    """Fix Issue 2: Verify M5 dataset has valid 1,941 day schema and series."""
    sales_path = DATA_DIR / "sales_train_evaluation.csv"
    assert sales_path.exists(), "M5 sales_train_evaluation.csv must exist"
    
    df = pd.read_csv(sales_path, nrows=10)
    d_cols = [c for c in df.columns if c.startswith("d_")]
    assert len(d_cols) == 1941, f"M5 dataset must have 1,941 day columns. Got {len(d_cols)}"
    assert "id" in df.columns, "M5 dataset must contain series 'id'"
    assert "item_id" in df.columns, "M5 dataset must contain 'item_id'"


def test_psi_reference_seeded():
    """Fix Issue 3: Verify reference baseline is seeded for PSI drift detector."""
    ref_csv = DATA_DIR / "psi_reference_baseline.csv"
    json_stats = MODELS_DIR / "psi_reference.json"
    
    assert ref_csv.exists(), "PSI reference baseline CSV must exist"
    assert json_stats.exists(), "PSI reference JSON stats must exist"
    
    df = pd.read_csv(ref_csv)
    assert "weather_temp" in df.columns
    assert "observed_sales" in df.columns
    assert len(df) >= 100, f"Reference dataset must have >= 100 rows. Got {len(df)}"
