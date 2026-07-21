"""
HyperFlow — FastAPI Async Load Test
=====================================
Follows the Senior ML/AI Transformation Guide:
  - Phase 4: Production Telemetry — measures real req/sec under concurrency
  - Phase 4: Structured logging, p50/p95/p99 latency, no bare print() outside __main__

Measures:
  - Throughput: req/sec under configurable concurrency
  - Latency:    p50, p95, p99 in ms
  - Error rate: % of failed requests (5xx, timeouts)

Usage:
    # Start backend first:
    #   uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --workers 4

    python benchmarks/load_test.py
    python benchmarks/load_test.py --requests 2000 --concurrency 50 --endpoint /api/ml/forecast

Outputs (printed + benchmarks/results/load_test_results.json):
  - req/sec
  - p50 / p95 / p99 latency in ms
  - Resume-ready summary line

Author: HyperFlow Benchmark Suite
"""

import asyncio
import time
import json
import logging
import argparse
import sys
import random
from pathlib import Path
from typing import Optional

import aiohttp
import numpy as np

# ── Structured Logger (Senior ML Guide § Phase 4) ─────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("hyperflow.load_test")

ROOT = Path(__file__).parent.parent
RESULTS_DIR = ROOT / "benchmarks" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINT PAYLOADS  (realistic, not empty JSON)
# ═══════════════════════════════════════════════════════════════════════════════

ENDPOINT_CONFIGS = {
    "/api/ml/forecast": {
        "method": "POST",
        "payload_factory": lambda: {
            "store_id": f"CA_{random.randint(1, 4)}",
            "item_id": f"FOODS_3_{random.randint(100, 999):03d}",
            "horizon_days": random.choice([7, 14, 28]),
            "features": {
                "lag_7": round(random.uniform(0, 50), 1),
                "lag_14": round(random.uniform(0, 50), 1),
                "lag_28": round(random.uniform(0, 50), 1),
                "roll_mean_7": round(random.uniform(0, 40), 2),
                "roll_std_7": round(random.uniform(0, 15), 2),
                "day_of_week": random.randint(0, 6),
                "week_of_year": random.randint(1, 52),
                "log1p_price": round(random.uniform(0, 4), 3),
            },
        },
    },
    "/health": {
        "method": "GET",
        "payload_factory": lambda: None,
    },
    "/api/ml/psi": {
        "method": "GET",
        "payload_factory": lambda: None,
    },
    "/api/v1/orders/reserve": {
        "method": "POST",
        "payload_factory": lambda: {
            "order_id": f"ORD_{random.randint(100000, 999999)}",
            "store_id": f"store_{random.randint(1, 3):02d}",
            "sku_id": f"SKU_{random.randint(100, 999)}",
            "qty_requested": random.randint(1, 3)
        }
    }
}


# ═══════════════════════════════════════════════════════════════════════════════
# ASYNC WORKER
# ═══════════════════════════════════════════════════════════════════════════════

async def single_request(
    session: aiohttp.ClientSession,
    url: str,
    method: str,
    payload: Optional[dict],
    timeout_secs: float,
) -> dict:
    """Execute a single HTTP request; return latency_ms and status."""
    t0 = time.perf_counter()
    try:
        kwargs = {"timeout": aiohttp.ClientTimeout(total=timeout_secs)}
        if method == "POST" and payload:
            kwargs["json"] = payload

        async with getattr(session, method.lower())(url, **kwargs) as resp:
            _ = await resp.read()   # consume body
            elapsed_ms = (time.perf_counter() - t0) * 1000
            return {"latency_ms": elapsed_ms, "status": resp.status, "error": None}

    except asyncio.TimeoutError:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return {"latency_ms": elapsed_ms, "status": 0, "error": "timeout"}
    except Exception as e:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return {"latency_ms": elapsed_ms, "status": 0, "error": str(e)[:80]}


async def run_load_test(
    base_url: str,
    endpoint: str,
    total_requests: int,
    concurrency: int,
    timeout_secs: float = 10.0,
) -> dict:
    """
    Senior ML Guide § Phase 4: Production concurrency test.

    Uses semaphore-bounded asyncio.gather to simulate `concurrency` simultaneous
    clients, which mirrors exactly what happens under real traffic spikes.
    """
    config = ENDPOINT_CONFIGS.get(endpoint, ENDPOINT_CONFIGS["/health"])
    method = config["method"]
    payload_factory = config["payload_factory"]
    url = base_url.rstrip("/") + endpoint

    logger.info("Target URL : %s", url)
    logger.info("Method     : %s", method)
    logger.info("Requests   : %d", total_requests)
    logger.info("Concurrency: %d simultaneous clients", concurrency)
    logger.info("Timeout    : %.1f s/request", timeout_secs)

    semaphore = asyncio.Semaphore(concurrency)
    results = []

    async def bounded_request(session):
        async with semaphore:
            payload = payload_factory()
            return await single_request(session, url, method, payload, timeout_secs)

    # Warm-up: 5 requests to ensure server JIT is warm
    logger.info("Warming up (5 requests)…")
    connector = aiohttp.TCPConnector(limit=concurrency + 10, force_close=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        warmup = [bounded_request(session) for _ in range(5)]
        warmup_results = await asyncio.gather(*warmup, return_exceptions=True)
        warmup_errors = [r for r in warmup_results if isinstance(r, Exception) or r.get("error")]
        if warmup_errors:
            logger.warning("Warm-up had %d failures; backend may still be starting.", len(warmup_errors))

        # Main timed load test
        logger.info("Starting main load test…")
        tasks = [bounded_request(session) for _ in range(total_requests)]
        t0 = time.perf_counter()
        raw = await asyncio.gather(*tasks, return_exceptions=True)
        elapsed = time.perf_counter() - t0

    for r in raw:
        if isinstance(r, Exception):
            results.append({"latency_ms": 0, "status": 0, "error": str(r)[:80]})
        else:
            results.append(r)

    # ── Compute statistics ─────────────────────────────────────────────────────
    latencies = np.array([r["latency_ms"] for r in results])
    statuses = [r["status"] for r in results]
    errors = [r for r in results if r["error"] or r["status"] >= 500 or r["status"] == 0]

    req_per_sec = total_requests / elapsed
    error_rate_pct = len(errors) / total_requests * 100

    p50 = float(np.percentile(latencies, 50))
    p95 = float(np.percentile(latencies, 95))
    p99 = float(np.percentile(latencies, 99))

    status_counts = {}
    for s in statuses:
        status_counts[str(s)] = status_counts.get(str(s), 0) + 1

    return {
        "endpoint": endpoint,
        "method": method,
        "base_url": base_url,
        "total_requests": total_requests,
        "concurrency": concurrency,
        "elapsed_seconds": round(elapsed, 2),
        "req_per_sec": round(req_per_sec, 1),
        "error_rate_pct": round(error_rate_pct, 2),
        "latency_p50_ms": round(p50, 1),
        "latency_p95_ms": round(p95, 1),
        "latency_p99_ms": round(p99, 1),
        "status_counts": status_counts,
        "resume_line": (
            f"FastAPI dispatch layer handles {req_per_sec:.0f} req/sec under "
            f"{concurrency}-client concurrency with <{p99:.0f}ms p99 latency "
            f"({error_rate_pct:.1f}% error rate) on endpoint {endpoint}"
        ),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

async def main():
    parser = argparse.ArgumentParser(description="HyperFlow FastAPI Load Test")
    parser.add_argument("--url", type=str, default="http://localhost:8000",
                        help="Base URL of the FastAPI server (default: http://localhost:8000)")
    parser.add_argument("--endpoint", type=str, default="/health",
                        help="Endpoint to hit (default: /health)")
    parser.add_argument("--requests", type=int, default=1000,
                        help="Total number of requests (default: 1000)")
    parser.add_argument("--concurrency", type=int, default=50,
                        help="Simultaneous concurrent clients (default: 50)")
    parser.add_argument("--timeout", type=float, default=10.0,
                        help="Per-request timeout in seconds (default: 10.0)")
    args = parser.parse_args()

    # First check server is up
    logger.info("Checking server at %s…", args.url)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get(args.url + "/health", timeout=aiohttp.ClientTimeout(total=5)) as r:
                logger.info("Server health check: HTTP %d", r.status)
    except Exception as e:
        logger.error("Server not reachable at %s: %s", args.url, e)
        logger.error("Start with: uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --workers 4")
        sys.exit(1)

    results = await run_load_test(
        base_url=args.url,
        endpoint=args.endpoint,
        total_requests=args.requests,
        concurrency=args.concurrency,
        timeout_secs=args.timeout,
    )

    # Save results
    out_path = RESULTS_DIR / "load_test_results.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    # Print summary
    print("\n" + "=" * 70)
    print("  LOAD TEST RESULTS")
    print("=" * 70)
    print(f"  Endpoint     : {results['endpoint']}")
    print(f"  Total reqs   : {results['total_requests']:,}")
    print(f"  Concurrency  : {results['concurrency']} clients")
    print(f"  Elapsed      : {results['elapsed_seconds']}s")
    print(f"  Throughput   : {results['req_per_sec']:.1f} req/sec  ← THE NUMBER")
    print(f"  Error rate   : {results['error_rate_pct']}%")
    print(f"  Latency p50  : {results['latency_p50_ms']} ms")
    print(f"  Latency p95  : {results['latency_p95_ms']} ms")
    print(f"  Latency p99  : {results['latency_p99_ms']} ms  ← THE NUMBER")
    print(f"  Status codes : {results['status_counts']}")
    print()
    print("  ── RESUME LINE ──────────────────────────────────────────────────")
    print(f"  {results['resume_line']}")
    print("=" * 70)
    print(f"\n  Full results saved to: {out_path}")


if __name__ == "__main__":
    asyncio.run(main())
