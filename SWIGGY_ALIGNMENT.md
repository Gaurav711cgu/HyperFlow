# HyperFlow -> Swiggy AI Strategy Alignment

HyperFlow is built as a Swiggy/Instamart strategy and ML command center, not a food-ordering clone. It uses Swiggy MCP for commerce data/actions and adds decision intelligence on top.

## 30-Second Hiring Manager Map

| Swiggy Strategy Decision | HyperFlow Capability | File / Endpoint |
|---|---|---|
| Should we open an Instamart dark store in this pincode? | Go/Hold/No-Go site scoring from food-order density, AOV, rent, competitor pressure, and cannibalization risk | `backend/ml/dark_store_site_selection.py`, `POST /api/v2/strategy/dark-store/site-selection` |
| When will the dark store break even? | Cox PH survival model for months-to-profitability | `backend/ml/store_profitability.py`, `POST /api/v1/profitability/score` |
| What should the initial SKU mix look like? | Zone-aware launch category priorities and SKU count estimate | `evaluate_site(...).priority_categories` |
| Which SKUs may stock out despite observed sales looking low? | Tobit censored-demand model corrects stockout-biased demand | `backend/ml/censored_demand.py`, `GET /api/v1/forecast/{store}/{sku}` |
| Are model features drifting in production? | PSI drift monitor with retraining trigger language | `backend/ml/production_safeguards.py`, `GET /api/v1/metrics/robustness` |
| Can AI agents operate across Swiggy Food, Instamart, and Dineout? | Swiggy MCP proxy routes plus HyperFlow's own MCP tool server | `backend/api/swiggy_mcp_routes.py`, `backend/mcp_server.py` |
| Can delivery operations reduce rider trips without breaking SLA? | Haversine route batching with SLA pruning | `ml_core/dispatch_batcher.py`, `POST /api/v2/dispatch/analyze` |
| Can refunds be triaged without hurting legitimate users? | Semantic plausibility plus tenure-aware fraud guard | `ml_core/fraud_guard.py`, `POST /api/v2/refund/predict` |

## Why This Fits Swiggy AIML

Swiggy's AI/ML work is not only model accuracy. The important product question is whether a model changes an operational decision: dark-store expansion, SKU availability, delivery reliability, or trust-and-safety cost.

HyperFlow frames each model output as a business decision:

- `GO/HOLD/NO-GO` instead of only "model score"
- `months_to_breakeven` instead of only "hazard ratio"
- `stockout_risk` instead of only "WMAPE"
- `jitter_suppressed` instead of only "classifier probability"
- `AUTO_REFUND / VERIFICATION_REQUIRED / HUMAN_TAKEOVER` instead of only "fraud probability"

## Star Demo Script

1. Open the Vercel demo: https://hyper-flow-chi.vercel.app/
2. Open the hosted Space/API surface: https://huggingface.co/spaces/Gaurav711/HyperFlow
3. Show the dark-store site-selection API with a Bengaluru tech-corridor pincode.
4. Explain: "I use Swiggy food-order density as a demand proxy for Instamart catchment demand, then adjust for rent, competition, and existing Swiggy dark-store cannibalization."
5. Show `backend/mcp_server.py` and the `evaluate_dark_store_site` tool.
6. Close with the model progression: site selection -> censored demand -> Cox breakeven -> PSI monitoring -> dispatch/refund safeguards.

## Resume Bullet

Built HyperFlow, an MCP-native q-commerce ML strategy engine for Swiggy-style operations: dark-store site selection, Tobit censored-demand forecasting, Cox PH breakeven prediction, ETA smoothing, and fraud/refund triage; exposed decision models through FastAPI, React, and MCP tools with reproducible tests and load benchmarks.

## Next Upgrade

Add a frontend "Site Selection Lab" where the interviewer can edit pincode demand, rent, competitor count, and zone type, then watch the Go/Hold/No-Go decision and breakeven confidence interval update live.
