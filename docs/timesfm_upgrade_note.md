# TimesFM Upgrade Note for HyperFlow Demand Forecasting

HyperFlow currently uses a heteroscedastic Tobit model plus quantile forecasting to correct demand labels that are censored by stockouts. That is the right first-principles baseline because Instamart observed sales are not equal to true demand when inventory is unavailable.

## Upgrade Path

| Layer | Current HyperFlow | TimesFM-Ready Upgrade |
|---|---|---|
| Label correction | Tobit MLE imputes latent demand under stockout censoring | Keep Tobit/availability de-biasing as preprocessing |
| Forecast backbone | LightGBM/quantile features | TimesFM or similar foundation time-series model |
| Hierarchy | Store-SKU local model | City -> dark store -> category -> SKU reconciliation |
| Uncertainty | 90% confidence interval | Quantile forecasts calibrated against availability-adjusted demand |
| Monitoring | PSI on weather/time features | PSI + forecast residual drift by city/category/SKU |

## Why Not Replace Tobit Entirely?

A foundation time-series model can learn strong seasonality and hierarchy, but it still needs honest labels. If a SKU sold 40 units only because 40 were available, the model should not learn that demand was 40. HyperFlow's Tobit layer remains useful as an availability de-biasing stage before the time-series backbone.

## Interview Explanation

"I would not simply swap Tobit for TimesFM. I would keep Tobit as the censored-sales correction layer, then feed availability-adjusted demand into a hierarchical TimesFM forecast. That preserves the statistical fix for stockouts while gaining better long-horizon seasonality and cross-SKU transfer."
