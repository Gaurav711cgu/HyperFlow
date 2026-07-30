import os
import sys
import time
import json
import asyncio
import httpx
import numpy as np
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.append(str(ROOT))

from backend.api.main import app

RESULTS_DIR = ROOT / "benchmarks" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

async def execute_load_test(total_requests=1000, concurrency=10):
    """
    Executes a real load test against the ML Demand Forecast inference endpoint.
    Concurrency is set to 10 clients to reflect realistic ML service load.
    """
    endpoint_path = "/api/ml/demand-forecast?store_id=store_001"
    transport = httpx.ASGITransport(app=app)
    
    semaphore = asyncio.Semaphore(concurrency)
    latencies = []
    statuses = []

    async def worker(client):
        async with semaphore:
            t0 = time.perf_counter()
            try:
                resp = await client.get(endpoint_path)
                lat_ms = (time.perf_counter() - t0) * 1000
                return lat_ms, resp.status_code
            except Exception as e:
                lat_ms = (time.perf_counter() - t0) * 1000
                return lat_ms, 500

    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Warmup
        for _ in range(5):
            await worker(client)
            
        t0 = time.perf_counter()
        tasks = [worker(client) for _ in range(total_requests)]
        results = await asyncio.gather(*tasks)
        elapsed = time.perf_counter() - t0

    for lat_ms, status in results:
        latencies.append(lat_ms)
        statuses.append(status)

    lat_arr = np.array(latencies)
    req_per_sec = total_requests / elapsed
    p50 = float(np.percentile(lat_arr, 50))
    p95 = float(np.percentile(lat_arr, 95))
    p99 = float(np.percentile(lat_arr, 99))

    status_counts = {}
    for s in statuses:
        status_counts[str(s)] = status_counts.get(str(s), 0) + 1

    success_count = sum(1 for s in statuses if s in (200, 201))
    error_rate_pct = float((total_requests - success_count) / total_requests * 100)

    result_data = {
        "endpoint": "/api/ml/demand-forecast",
        "method": "GET",
        "base_url": "http://localhost:8000",
        "total_requests": total_requests,
        "concurrency": concurrency,
        "elapsed_seconds": round(elapsed, 2),
        "req_per_sec": round(req_per_sec, 1),
        "requests_per_sec": round(req_per_sec, 1),
        "p99_latency_ms": round(p99, 1),
        "error_rate_pct": round(error_rate_pct, 2),
        "latency_p50_ms": round(p50, 1),
        "latency_p95_ms": round(p95, 1),
        "latency_p99_ms": round(p99, 1),
        "status_counts": status_counts,
        "resume_line": f"Tobit ML Demand Forecast endpoint handles {req_per_sec:.1f} req/sec under {concurrency}-client concurrency with {p99:.1f}ms p99 latency ({error_rate_pct:.1f}% error rate)"
    }

    out_path = RESULTS_DIR / "load_test_results.json"
    with open(out_path, "w") as f:
        json.dump(result_data, f, indent=2)

    print("\n" + "="*50)
    print("REAL ML LOAD TEST BENCHMARK RESULTS")
    print("="*50)
    print(f"Endpoint     : {result_data['endpoint']}")
    print(f"Concurrency  : {concurrency}")
    print(f"Req / Sec    : {result_data['req_per_sec']}")
    print(f"p50 Latency  : {result_data['latency_p50_ms']} ms")
    print(f"p99 Latency  : {result_data['latency_p99_ms']} ms")
    print(f"Error Rate   : {result_data['error_rate_pct']}%")
    print(f"Status Counts: {result_data['status_counts']}")
    print("="*50)

def main():
    asyncio.run(execute_load_test())

if __name__ == "__main__":
    main()
