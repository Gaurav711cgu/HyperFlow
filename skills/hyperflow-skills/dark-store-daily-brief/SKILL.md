---
name: dark-store-daily-brief
description: Generate and deliver a daily morning ops brief for all monitored dark stores via Telegram/Slack
version: 1.0.0
author: Gaurav Kumar Nayak
metadata:
  hermes:
    tags: [automation, reporting, food-tech, daily]
    category: automation
    requires_tools: [hyperflow-ml]
---

# Dark Store Daily Brief

Generates and delivers the morning ops brief for all monitored dark stores.
Designed to run on a cron schedule at 06:30 every day.

## When to Use

- Triggered by cron at 06:30 daily
- User asks "give me this morning's store brief"
- User asks "how are all stores doing today?"

## Procedure

1. Load the list of monitored store IDs from memory. Key: `hyperflow_monitored_stores`.
   If not in memory, use default: [1, 2, 3]. Ask the user to update this list.

2. For each store, invoke the `hyperflow-store-ops` skill.

3. Collect all briefs. Identify any stores with RED PSI or URGENT RESTOCK status.

4. Generate a summary header:
   - Total stores checked
   - Count of RED alerts
   - Count of URGENT RESTOCK alerts
   - Most critical store (worst combined status)

5. Deliver to Slack #hyperflow-ops channel as a structured message.
   For any RED alert, also send a Telegram direct message.

6. Save today's brief summary to memory:
   `daily_brief_{YYYY-MM-DD}: {summary_json}`

## Cron Setup

```bash
hermes cron add \
  --name "daily-store-brief" \
  --schedule "30 6 * * *" \
  --task "/dark-store-daily-brief" \
  --deliver slack:#hyperflow-ops
```

## Pitfalls

- If a store API call fails, do NOT skip the store silently. Report it as
  "STORE [id]: API UNAVAILABLE" in the brief.
- Deliver the Telegram alert BEFORE the Slack summary. Telegram is urgent;
  Slack is informational.
- Memory key `hyperflow_monitored_stores` must be a JSON array of integers.
