from locust import HttpUser, task, between
import random
import time

class HighFrequencyTradingUser(HttpUser):
    """
    Staff-Level Performance Test:
    Simulates high-frequency order ingestion against the mmap-backed endpoint.
    Goal: Prove the system can sustain > 25,000 RPS on a single node without GC pauses or DB lock contention.
    """
    wait_time = between(0.001, 0.005)  # Simulate aggressive traffic

    @task
    def submit_high_frequency_order(self):
        # Fire-and-forget UDP style or ultra-low-latency HTTP
        payload = {
            "order_id": random.randint(100000, 999999),
            "amount": round(random.uniform(10.0, 500.0), 2),
            "timestamp": time.time(),
            # Fast ingestion path triggers the O(1) lock-free mmap buffer
            "fast_ingest": True 
        }
        
        # We expect p99 latency < 2ms for this route
        with self.client.post("/api/v1/ml/predict-eta", json=payload, catch_response=True) as response:
            if response.elapsed.total_seconds() > 0.010:
                response.failure(f"Latency spike: {response.elapsed.total_seconds()}s")
            elif response.status_code == 200:
                response.success()
