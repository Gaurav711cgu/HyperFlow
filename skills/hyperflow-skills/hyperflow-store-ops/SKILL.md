---
name: hyperflow-store-ops
description: Full dark store operational check — forecast + PSI + profitability + inventory in one pass
version: 1.0.0
author: Gaurav Kumar Nayak
metadata:
  hermes:
    tags: [ml, operations, dark-store, food-tech]
    category: ml-ops
    requires_tools: [hyperflow-ml]
---

# HyperFlow Store Ops

Complete operational check for a dark store. Runs all three ML models in
sequence and produces a unified ops brief. This is the skill the daily cron
job uses.

## When to Use

- Daily morning ops check
- Before any inventory or restocking decision
- When a human operator asks for a "full check" on a store
- When Hermes detects a PSI alert and needs to assess severity in context

## Procedure

1. Call `get_store_context` — extract inventory levels, last forecast age, PSI status.

2. Call `get_psi_status` — get current drift status across all features.

3. If PSI is RED on any feature: call `get_robustness_metrics` to assess
   how much the model confidence is degraded.

4. Call `forecast_demand` with horizon_hours=24 (daily horizon).

5. Call `score_profitability` only if:
   - The store is < 6 months old (new store tracking)
   - OR the user explicitly asked for profitability data
   - Otherwise skip to keep the ops brief focused.

6. Synthesize into the unified ops brief template.

7. Identify ONE priority action and state it explicitly at the top.

## Output Template

```
⚡ DARK STORE OPS BRIEF — Store [store_id]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: [timestamp]

🎯 PRIORITY ACTION: [single most important thing to do right now]

━━ DEMAND FORECAST (24h) ━━━━━━━━━━━━━━━━━
Point:  [value] units
90% CI: [lower] – [upper] units
Status: [URGENT RESTOCK / RESTOCK / NOMINAL / OVERSTOCKED]

━━ MODEL HEALTH ━━━━━━━━━━━━━━━━━━━━━━━━
PSI Overall:  [GREEN/AMBER/RED]
Worst Feature: [feature] (PSI=[value])
Data Source:  [real/synthetic]

━━ PROFITABILITY (if applicable) ━━━━━━━━
Time to Profit (median): [N] months
6-month probability:     [X]%

━━ INVENTORY ━━━━━━━━━━━━━━━━━━━━━━━━━━
Current stock:   [level]
vs. Forecast:    [above/below/within CI]
Last updated:    [timestamp]

━━ ALERTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[List any RED flags or anomalies]
```

## Pitfalls

- Always put the priority action FIRST. Operators scan the top of the brief.
- If inventory data is stale (>2h), flag it. Restocking decisions on stale
  data are dangerous.
- The profitability model uses mock training data when real store history
  is unavailable. Note this explicitly if so.

## Verification

Check that:
- All three tool calls (context, PSI, forecast) succeeded
- The priority action is specific and actionable, not "monitor the situation"
- Any RED PSI is reflected in the priority action if it's the most urgent issue
