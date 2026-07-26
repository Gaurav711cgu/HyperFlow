---
name: hyperflow-psi-audit
description: Run a full Population Stability Index audit across all features for a dark store and produce a drift report
version: 1.0.0
author: Gaurav Kumar Nayak
metadata:
  hermes:
    tags: [ml, drift-detection, psi, monitoring]
    category: ml-ops
    requires_tools: [hyperflow-ml]
---

# HyperFlow PSI Audit

Full PSI drift audit across all features for a dark store. Produces a
structured drift report with action recommendations.

## When to Use

- User asks "is the model still valid for store X?"
- User asks "why is the forecast accuracy degrading?"
- Scheduled weekly audit trigger fires
- After any significant operational event (festival, weather event, new competitor)

## Procedure

1. Call `get_psi_status` for store_id without specifying a feature (gets all).

2. For each feature in the response, classify:
   - PSI < 0.10 → 🟢 STABLE
   - PSI 0.10–0.20 → 🟡 MONITOR
   - PSI > 0.20 → 🔴 DRIFT DETECTED — retrain signal

3. Identify the most-drifted feature (highest PSI value).

4. Cross-reference with store context to identify likely cause:
   - weather_temp drift → seasonal shift
   - time_elapsed_sec drift → operational schedule change
   - weather_rain drift → regional weather event

5. Produce the drift report using the template below.

6. If any feature is RED, create a memory entry:
   `store_{store_id}_psi_red: {feature} PSI={value} as of {timestamp}`

## Output Template

```
🔍 PSI DRIFT AUDIT — Store [store_id]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audit Time: [timestamp]

FEATURE STATUS
━━━━━━━━━━━━━
[🟢/🟡/🔴] weather_temp:        PSI [value]
[🟢/🟡/🔴] weather_rain:        PSI [value]  
[🟢/🟡/🔴] time_elapsed_sec:    PSI [value]
[🟢/🟡/🔴] observed_sales:      PSI [value]

OVERALL STATUS: [GREEN/AMBER/RED]

⚠️  DRIFT ALERT (if any):
Most-drifted feature: [feature] (PSI=[value])
Likely cause: [reasoning]
Recommended action: [MONITOR/RETRAIN/INVESTIGATE]
```

## Pitfalls

- PSI is relative to the training reference distribution. If the reference
  was fit on mock data (look for data_source: "synthetic" in context), the
  PSI values are meaningless. Report this explicitly.
- A single RED feature doesn't always require retraining — check whether
  it's a genuinely important predictive feature first.

## Verification

Confirm that every feature in get_psi_status response appears in your report.
If a feature is missing from the API response, note it as "DATA UNAVAILABLE".
