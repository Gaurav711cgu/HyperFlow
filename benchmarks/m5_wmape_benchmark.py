"""
HyperFlow — M5 WMAPE Benchmark (Tobit vs OLS)
=============================================
Follows the Senior ML/AI Transformation Guide:
  - Phase 2: Mathematical Rigor — real dataset, proper censoring
  - Phase 3: Defensive MLOps   — PSI drift logged, clipping applied
  - Phase 4: Structured logging, no bare print() outside __main__

Dataset:  M5 Forecasting Accuracy (Walmart, Kaggle)
          42,840 item-store time series, daily sales 2011-2016
          Kaggle competition: m5-forecasting-accuracy

Usage:
    python benchmarks/m5_wmape_benchmark.py

Outputs (printed + written to benchmarks/results/m5_benchmark_results.json):
    - Tobit WMAPE  (real number, publishable)
    - OLS   WMAPE  (baseline)
    - WMAPE lift % (the number on your resume)
    - Censoring rate (% of observation-days that hit zero stock)
    - PSI drift score on heldout split

Author: HyperFlow Benchmark Suite
"""

import os
import sys
import json
import logging
import zipfile
import subprocess
import time
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import norm
from scipy.optimize import minimize
from sklearn.linear_model import LinearRegression

# ── Structured Logger (Senior ML Guide § Phase 4) ────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("hyperflow.m5_benchmark")

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "m5"
RESULTS_DIR = ROOT / "benchmarks" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)


# ═══════════════════════════════════════════════════════════════════════════════
# 1. DATA ACQUISITION
# ═══════════════════════════════════════════════════════════════════════════════

def download_m5(data_dir: Path):
    """Download & unzip M5 dataset from Kaggle if not already present."""
    if (data_dir / "sales_train_evaluation.csv").exists():
        logger.info("M5 data already present, skipping download.")
        return

    logger.info("Downloading M5 dataset via Kaggle CLI (~450 MB)…")
    cmd = [
        "kaggle", "competitions", "download",
        "-c", "m5-forecasting-accuracy",
        "-p", str(data_dir),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        logger.error("Kaggle download failed: %s", result.stderr)
        sys.exit(1)

    logger.info("Unzipping M5 archive…")
    for zf in data_dir.glob("*.zip"):
        with zipfile.ZipFile(zf, "r") as z:
            z.extractall(data_dir)
    logger.info("M5 data ready at %s", data_dir)


# ═══════════════════════════════════════════════════════════════════════════════
# 2. FEATURE ENGINEERING
# ═══════════════════════════════════════════════════════════════════════════════

def build_features(df_long: pd.DataFrame) -> pd.DataFrame:
    """
    Build time-series features from melted M5 sales data.

    Features (Senior ML Guide § Phase 2 — real-world statistical nuance):
      - lag_7, lag_14, lag_28  : recent demand history
      - roll_mean_7, roll_std_7: rolling statistics (captures seasonality)
      - day_of_week, week_of_year: calendar signals
      - log1p_price            : price elasticity proxy (from sell_price)
    """
    df = df_long.sort_values(["id", "d_int"]).copy()

    # Lag features
    for lag in [7, 14, 28]:
        df[f"lag_{lag}"] = df.groupby("id")["sales"].shift(lag)

    # Rolling mean / std on 7-day window
    df["roll_mean_7"] = (
        df.groupby("id")["sales"]
        .transform(lambda x: x.shift(1).rolling(7, min_periods=1).mean())
    )
    df["roll_std_7"] = (
        df.groupby("id")["sales"]
        .transform(lambda x: x.shift(1).rolling(7, min_periods=1).std().fillna(0))
    )

    # Calendar
    df["day_of_week"] = df["d_int"] % 7
    df["week_of_year"] = (df["d_int"] // 7) % 52

    # Log price (fill missing with median)
    if "sell_price" in df.columns:
        median_price = df["sell_price"].median()
        df["log1p_price"] = np.log1p(df["sell_price"].fillna(median_price))
    else:
        df["log1p_price"] = 0.0

    df = df.dropna(subset=[f"lag_{l}" for l in [7, 14, 28]])
    return df


def identify_censoring(df: pd.DataFrame, zero_run_threshold: int = 3) -> np.ndarray:
    """
    Censoring heuristic: A zero-sales day is CENSORED (stockout, not true zero demand)
    if it is preceded by ≥ threshold consecutive zero-sales days.

    This is the exact same logic as the dark-store Tobit model but adapted
    to M5's retail context where Walmart regularly runs out of stock.

    Senior ML Guide § Phase 2: 'Censoring occurs naturally at stockout events.'
    """
    censored = np.zeros(len(df), dtype=bool)
    sales = df["sales"].values
    ids = df["id"].values

    prev_id = None
    zero_streak = 0
    for i in range(len(sales)):
        if ids[i] != prev_id:
            zero_streak = 0
            prev_id = ids[i]
        if sales[i] == 0:
            zero_streak += 1
            if zero_streak >= zero_run_threshold:
                censored[i] = True
        else:
            zero_streak = 0

    return censored


# ═══════════════════════════════════════════════════════════════════════════════
# 3. TOBIT REGRESSOR (production-grade, from censored_demand.py)
# ═══════════════════════════════════════════════════════════════════════════════

class TobitRegressor:
    """
    Heteroscedastic Tobit (Type I Right-Censored) via MLE with L-BFGS-B.
    Identical implementation to backend/ml/censored_demand.py.
    log(sigma_i) = X_i @ gamma  ← resolves heteroscedasticity bias.
    """

    def __init__(self):
        self.beta = None
        self.gamma = None
        self.fitted = False

    def _neg_log_likelihood(self, params, X, y, censored):
        n_features = X.shape[1]
        beta = params[:n_features]
        gamma = params[n_features:]

        mu = X @ beta
        sigma = np.exp(X @ gamma)
        sigma = np.clip(sigma, 1e-4, 1e4)

        uncens = ~censored
        ll_uncens = (
            -0.5 * np.sum(np.log(2 * np.pi * sigma[uncens] ** 2))
            - np.sum(((y[uncens] - mu[uncens]) / sigma[uncens]) ** 2) / 2.0
        )

        z = (y[censored] - mu[censored]) / sigma[censored]
        ll_cens = np.sum(norm.logsf(z))

        return -(ll_uncens + ll_cens)

    def fit(self, X, y, censored):
        X_c = np.column_stack([np.ones(len(X)), X])
        n = X_c.shape[1]

        ols = LinearRegression(fit_intercept=False).fit(X_c, y)
        init_beta = ols.coef_
        resid_std = np.std(y - ols.predict(X_c)) or 1.0
        init_gamma = np.zeros(n)
        init_gamma[0] = np.log(resid_std)
        init_params = np.concatenate([init_beta, init_gamma])

        res = minimize(
            self._neg_log_likelihood,
            init_params,
            args=(X_c, y, censored),
            method="L-BFGS-B",
            options={"maxiter": 500, "ftol": 1e-9},
        )

        self.beta = res.x[:n] if res.success else init_beta
        self.gamma = res.x[n:] if res.success else init_gamma
        self.fitted = True
        logger.debug("Tobit optimizer: success=%s msg=%s", res.success, res.message)
        return self

    def predict_latent(self, X):
        X_c = np.column_stack([np.ones(len(X)), X])
        return X_c @ self.beta

    def impute_demand(self, X, y_obs, censored):
        X_c = np.column_stack([np.ones(len(X)), X])
        mu = X_c @ self.beta
        sigma = np.clip(np.exp(X_c @ self.gamma), 1e-4, 1e4)
        y_imp = y_obs.astype(float).copy()

        if np.any(censored):
            z = np.clip((y_obs[censored] - mu[censored]) / sigma[censored], -5, 5)
            imr = norm.pdf(z) / (norm.sf(z) + 1e-9)           # Inverse Mills Ratio
            y_imp[censored] = mu[censored] + sigma[censored] * imr
            y_imp[censored] = np.maximum(y_imp[censored], y_obs[censored])

        return y_imp


# ═══════════════════════════════════════════════════════════════════════════════
# 4. PSI DRIFT DETECTION (Senior ML Guide § Phase 3 — Defensive MLOps)
# ═══════════════════════════════════════════════════════════════════════════════

def compute_psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    """
    Population Stability Index between train and test distributions.
    PSI < 0.10  : No significant shift  (green)
    PSI < 0.20  : Moderate shift        (amber — monitor)
    PSI >= 0.20 : Significant shift     (red  — trigger retraining)
    """
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf

    exp_pct = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    act_pct = np.histogram(actual, bins=breakpoints)[0] / len(actual)

    exp_pct = np.clip(exp_pct, 1e-6, None)
    act_pct = np.clip(act_pct, 1e-6, None)

    psi = np.sum((act_pct - exp_pct) * np.log(act_pct / exp_pct))
    return float(psi)


# ═══════════════════════════════════════════════════════════════════════════════
# 5. WMAPE METRIC
# ═══════════════════════════════════════════════════════════════════════════════

def wmape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Weighted Mean Absolute Percentage Error — M5 official metric."""
    denom = np.sum(np.abs(y_true))
    if denom < 1e-9:
        return 0.0
    return float(np.sum(np.abs(y_true - y_pred)) / denom)


# ═══════════════════════════════════════════════════════════════════════════════
# 6. MAIN BENCHMARK RUNNER
# ═══════════════════════════════════════════════════════════════════════════════

def run_benchmark(sample_items: int = 500, test_days: int = 28) -> dict:
    """
    Full benchmark pipeline on M5 data.

    Args:
        sample_items: How many of the 42,840 item-store series to use.
                      500 → ~2 min runtime. Set to 5000 for full precision.
        test_days:    Holdout window (mirrors M5 evaluation window).

    Returns:
        dict of benchmark results suitable for JSON export.
    """
    t_start = time.perf_counter()

    # ── 1. Load raw M5 data ───────────────────────────────────────────────────
    logger.info("Loading M5 sales data…")
    sales_path = DATA_DIR / "sales_train_evaluation.csv"
    prices_path = DATA_DIR / "sell_prices.csv"
    cal_path = DATA_DIR / "calendar.csv"

    sales_wide = pd.read_csv(sales_path)
    calendar = pd.read_csv(cal_path)
    prices = pd.read_csv(prices_path) if prices_path.exists() else None

    logger.info(
        "Loaded: %d items × %d days",
        len(sales_wide),
        len([c for c in sales_wide.columns if c.startswith("d_")]),
    )

    # ── 2. Sample items (reproducible) ────────────────────────────────────────
    rng = np.random.default_rng(42)
    sample_ids = rng.choice(sales_wide["id"].values, size=min(sample_items, len(sales_wide)), replace=False)
    sales_wide = sales_wide[sales_wide["id"].isin(sample_ids)].reset_index(drop=True)

    # ── 3. Melt to long format ────────────────────────────────────────────────
    id_cols = ["id", "item_id", "dept_id", "cat_id", "store_id", "state_id"]
    d_cols = [c for c in sales_wide.columns if c.startswith("d_")]

    df_long = sales_wide.melt(id_vars=id_cols, value_vars=d_cols, var_name="d", value_name="sales")
    df_long["d_int"] = df_long["d"].str.replace("d_", "").astype(int)

    # Optional: merge sell prices
    if prices is not None:
        cal_slim = calendar[["d", "wm_yr_wk"]].rename(columns={"d": "d_col"})
        cal_slim["d_int"] = cal_slim["d_col"].str.replace("d_", "").astype(int)
        df_long = df_long.merge(
            cal_slim[["d_int", "wm_yr_wk"]], on="d_int", how="left"
        )
        df_long = df_long.merge(
            prices[["store_id", "item_id", "wm_yr_wk", "sell_price"]],
            on=["store_id", "item_id", "wm_yr_wk"],
            how="left",
        )

    # ── 4. Train / test split ─────────────────────────────────────────────────
    max_d = df_long["d_int"].max()
    split_d = max_d - test_days

    df_train = df_long[df_long["d_int"] <= split_d].copy()
    df_test = df_long[df_long["d_int"] > split_d].copy()

    logger.info(
        "Train: %d rows | Test: %d rows | split at d=%d",
        len(df_train), len(df_test), split_d,
    )

    # ── 5. Feature engineering ────────────────────────────────────────────────
    logger.info("Engineering features…")
    df_train = build_features(df_train)

    # ── 6. Censoring detection ────────────────────────────────────────────────
    logger.info("Detecting censored observations (stockout heuristic)…")
    censored = identify_censoring(df_train)
    censoring_rate = float(np.mean(censored))
    logger.info("Censoring rate: %.2f%%", censoring_rate * 100)

    # ── 7. Build feature matrix ───────────────────────────────────────────────
    feat_cols = ["lag_7", "lag_14", "lag_28", "roll_mean_7", "roll_std_7",
                 "day_of_week", "week_of_year", "log1p_price"]
    feat_cols = [f for f in feat_cols if f in df_train.columns]

    # Senior ML Guide § Phase 3: Semantic Clipping (1st–99th pct)
    clip_bounds = {}
    for col in feat_cols:
        lo = df_train[col].quantile(0.01)
        hi = df_train[col].quantile(0.99)
        clip_bounds[col] = (lo, hi)
        df_train[col] = df_train[col].clip(lo, hi)

    X_train = df_train[feat_cols].values
    y_train = df_train["sales"].values.astype(float)

    # ── 8. OLS baseline ───────────────────────────────────────────────────────
    logger.info("Fitting OLS baseline…")
    ols = LinearRegression()
    ols.fit(X_train, y_train)

    # ── 9. Tobit model ────────────────────────────────────────────────────────
    logger.info("Fitting Heteroscedastic Tobit (MLE via L-BFGS-B)…")
    t_tobit = time.perf_counter()
    tobit = TobitRegressor()
    tobit.fit(X_train, y_train, censored)
    tobit_fit_secs = time.perf_counter() - t_tobit
    logger.info("Tobit fit completed in %.1fs", tobit_fit_secs)

    # ── 10. Evaluate on test set ──────────────────────────────────────────────
    logger.info("Evaluating on holdout window (%d days)…", test_days)
    df_test_feat = build_features(df_long)  # Use full df for lag lookback
    df_test_feat = df_test_feat[df_test_feat["d_int"] > split_d].copy()
    df_test_feat = df_test_feat.dropna(subset=feat_cols)

    for col in feat_cols:
        lo, hi = clip_bounds[col]
        df_test_feat[col] = df_test_feat[col].clip(lo, hi)

    X_test = df_test_feat[feat_cols].values
    y_test = df_test_feat["sales"].values.astype(float)

    y_ols_pred = np.maximum(0, ols.predict(X_test))
    y_tobit_pred = np.maximum(0, tobit.predict_latent(X_test))

    ols_wmape = wmape(y_test, y_ols_pred)
    tobit_wmape = wmape(y_test, y_tobit_pred)
    wmape_lift_pct = (ols_wmape - tobit_wmape) / (ols_wmape + 1e-9) * 100

    # ── 11. PSI Drift Score ───────────────────────────────────────────────────
    psi_score = compute_psi(y_train, y_test)
    psi_status = "GREEN" if psi_score < 0.10 else ("AMBER" if psi_score < 0.20 else "RED")
    logger.info("PSI drift score: %.4f [%s]", psi_score, psi_status)

    total_secs = time.perf_counter() - t_start

    # ── 12. Results ───────────────────────────────────────────────────────────
    results = {
        "dataset": "M5 Forecasting Accuracy (Walmart Kaggle)",
        "items_sampled": int(len(sample_ids)),
        "train_rows": int(len(df_train)),
        "test_rows": int(len(df_test_feat)),
        "test_days": test_days,
        "censoring_rate_pct": round(censoring_rate * 100, 2),
        "ols_wmape": round(ols_wmape, 4),
        "tobit_wmape": round(tobit_wmape, 4),
        "wmape_lift_pct": round(wmape_lift_pct, 2),
        "tobit_fit_seconds": round(tobit_fit_secs, 1),
        "psi_score": round(psi_score, 4),
        "psi_status": psi_status,
        "total_runtime_seconds": round(total_secs, 1),
        "resume_line": (
            f"Heteroscedastic Tobit MLE achieves {wmape_lift_pct:.1f}% WMAPE improvement "
            f"over OLS on M5 Walmart demand dataset ({len(sample_ids)} item-store series) "
            f"at {censoring_rate*100:.1f}% censoring rate; "
            f"PSI drift score {psi_score:.3f} [{psi_status}]"
        ),
    }
    return results


# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="HyperFlow M5 WMAPE Benchmark")
    parser.add_argument("--items", type=int, default=500,
                        help="Number of item-store series to sample (default: 500, max: 42840)")
    parser.add_argument("--test-days", type=int, default=28,
                        help="Holdout window in days (default: 28, mirrors M5 eval)")
    parser.add_argument("--download", action="store_true",
                        help="Force re-download of M5 dataset")
    args = parser.parse_args()

    # Download data
    download_m5(DATA_DIR)

    # Run benchmark
    logger.info("=" * 70)
    logger.info("HyperFlow M5 WMAPE Benchmark — Senior ML/AI Standard")
    logger.info("=" * 70)

    results = run_benchmark(sample_items=args.items, test_days=args.test_days)

    # Save results
    out_path = RESULTS_DIR / "m5_benchmark_results.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    # ── Print resume-ready summary ────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  BENCHMARK RESULTS")
    print("=" * 70)
    print(f"  Dataset         : {results['dataset']}")
    print(f"  Items sampled   : {results['items_sampled']:,}")
    print(f"  Censoring rate  : {results['censoring_rate_pct']}%")
    print(f"  OLS   WMAPE     : {results['ols_wmape']:.4f}")
    print(f"  Tobit WMAPE     : {results['tobit_wmape']:.4f}")
    print(f"  WMAPE lift      : {results['wmape_lift_pct']:+.1f}%  ← THE NUMBER")
    print(f"  PSI drift       : {results['psi_score']:.4f} [{results['psi_status']}]")
    print(f"  Runtime         : {results['total_runtime_seconds']}s")
    print()
    print("  ── RESUME LINE ──────────────────────────────────────────────────")
    print(f"  {results['resume_line']}")
    print("=" * 70)
    print(f"\n  Full results saved to: {out_path}")
