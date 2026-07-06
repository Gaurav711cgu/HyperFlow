# Swiggy & Zomato Engineering Blog Design Mapping

This document provides a direct architectural trace mapping public quick-commerce engineering challenges published by Swiggy Bytes and Zomato Engineering to our actual production-grade implementation.

---

## 1. Instamart: Tackling Censored Sales (Demand Forecasting)
*   **The Principle**: Swiggy Bytes writes: *"When a product runs out of stock, sales drop to zero, truncating our observation of customer demand. Fitting naive models on this censored data underestimates demand, causing recurring stockouts."*
*   **How We Implemented It**:
    *   **File**: [backend/ml/censored_demand.py](file:///Users/gauravkumarnayak/Desktop/SWIGGG/backend/ml/censored_demand.py)
    *   **Mechanism**: We implemented a two-stage forecaster. In Stage 1, a heteroscedastic Tobit Type I MLE regressor dynamically models the log standard deviation ($\sigma_i = \exp(Z_i \gamma)$) instead of assuming homoscedastic variance. On stockout days (`censored=True`), we calculate the Inverse Mills Ratio (IMR) to impute the unobserved latent demand.
    *   **Stage 2**: LightGBM is trained on the Tobit-imputed demand target with quantile regression objectives (fitting the 5th, 50th, and 95th quantiles) to outputpoint predictions and a 90% confidence interval, ensuring safety stock parameters scale with prediction uncertainty.

---

## 2. Swiggy: Display ETA Calibration & Drift Checks
*   **The Principle**: Swiggy Bytes writes: *"Display ETAs suffer from GPS jumps and network drops. We must suppress this display jitter. Additionally, incoming feature scales (seconds vs milliseconds) and drift under monsoon surges can lead to bad estimations."*
*   **How We Implemented It**:
    *   **File**: [backend/ml/production_safeguards.py](file:///Users/gauravkumarnayak/Desktop/SWIGGG/backend/ml/production_safeguards.py)
    *   **Mechanism**: 
        1. **Unit Audit**: We created automated checking parameters that detect scale discrepancies in incoming GPS latency features (e.g. milliseconds instead of seconds).
        2. **PSI Drift Calculations**: We calculate the real Population Stability Index (PSI) values continuously over sliding batches to trigger retraining if feature drift exceeds 0.2.
        3. **Outlier Clipping**: We clip features to the training distribution's p1 and p99 percentiles, guarding model stability.

---

## 3. Zomato: Zero Waste Cancelled Order Resale (CORO)
*   **The Principle**: Zomato writes: *"Zomato Food Rescue resells cancelled orders at a discount to nearby customers. However, co-located users could exploit this by cancelling an order to buy it back at a lower price from a neighboring device."*
*   **How We Implemented It**:
    *   **File**: [backend/api/main.py](file:///Users/gauravkumarnayak/Desktop/SWIGGG/backend/api/main.py)
    *   **Mechanism**: We implemented the anti-arbitrage check. When checking a cancellation resale offer, the system filters out nearby buyers sharing the same IP subnet, co-location coordinates (<15 meters), or cancel histories.

---

## 4. Swiggy Instamart: High-Concurrency Inventory Reservations
*   **The Principle**: Quick-commerce checkout flows handle 10k+ concurrent transactions during peak morning hours. Row-level blocking during database write commits causes connection pool starvation.
*   **How We Implemented It**:
    *   **Files**: [backend/services/redis_lock.py](file:///Users/gauravkumarnayak/Desktop/SWIGGG/backend/services/redis_lock.py) & [backend/api/main.py](file:///Users/gauravkumarnayak/Desktop/SWIGGG/backend/api/main.py)
    *   **Mechanism**:
        1. **Redis Lock Manager**: Acquires inventory holds using Redis `SETNX` locks with thread ownership parameters, released via an atomic Lua script.
        2. **PostgreSQL NOWAIT Lock Bypass**: If PostgreSQL is set as the lock backend, we fetch and lock rows with `.with_for_update(nowait=True)`. Catching `OperationalError` aborts transactions instantly instead of letting them queue, preventing pool saturation and server hangs.
        3. **Transactional Outbox**: Decoupled downstream order events from the API transaction block using `OutboxEvent` inserts, resolving the dual-write anomaly.
