---
name: hyperflow-demand-forecast
description: Run Tobit censored demand forecast for a HyperFlow dark store and surface actionable restock decisions
version: 1.0.0
author: Gaurav Kumar Nayak
metadata:
  hermes:
    tags: [ml, forecasting, food-tech, hyperlocal]
    category: ml-ops
    requires_tools: [hyperflow-ml]
---

# HyperFlow Demand Forecast

Runs the Heteroscedastic Tobit MLE demand forecast for a dark store and
returns point estimate, 90% CI, and a restock recommendation.

## When to Use

- User asks "what will store X sell tomorrow?"
- User asks "should we restock item Y at store Z?"
- User asks "what's the demand forecast for the next N hours?"
- Scheduled cron trigger fires for nightly demand planning

## Procedure

1. Call `get_store_context` first. Check that PSI status is GREEN or AMBER.
   If RED, warn the user that forecast confidence is degraded before proceeding.

2. Call `get_robustness_metrics`. If clipping_rate > 15% on any feature,
   note which feature is being clipped and why this reduces confidence.

3. Call `forecast_demand` with the requested store_id and horizon_hours.

4. Parse the response:
   - `point_forecast`: the Tobit latent demand estimate
   - `lower_90`: 5th percentile quantile (safety stock floor)
   - `upper_90`: 95th percentile quantile (safety stock ceiling)
   - `wmape_confidence`: model confidence based on training WMAPE

5. Compute restock recommendation:
   - If current_inventory < lower_90 → URGENT RESTOCK
   - If current_inventory < point_forecast → RESTOCK RECOMMENDED  
   - If current_inventory > upper_90 → OVERSTOCKED, hold orders
   - Otherwise → NOMINAL

6. Format output as a structured brief (see template below).

## Output Template

```
📊 DEMAND FORECAST — Store [store_id]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Horizon:        [horizon_hours]h
Point Forecast: [point_forecast] units
90% CI:         [lower_90] – [upper_90] units
PSI Status:     [GREEN/AMBER/RED]
Model WMAPE:    [wmape_confidence]%

📦 RECOMMENDATION: [URGENT RESTOCK / RESTOCK / NOMINAL / OVERSTOCKED]

Reasoning: [1-2 sentence explanation of the key driver]
```

## Pitfalls

- Never forecast without checking PSI first. A RED PSI means distribution
  shift — the Tobit model was trained on different data than current reality.
- If horizon_hours > 72, confidence degrades significantly. State this.
- Don't recommend URGENT RESTOCK if current_inventory data is stale (>2h old).
  Check the context timestamp.

## Verification

After running, check that:
- point_forecast is between lower_90 and upper_90
- upper_90 > lower_90 (if not, model has collapsed — report as anomaly)
- PSI was checked before forecast was issued
