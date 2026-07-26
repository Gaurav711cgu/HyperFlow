# ETA Stability & Storm Robustness Report

This report documents the performance of the **Self-Supervised Gated ETA Smoother** under both normal weather and severe storm surges (where zone velocities drop globally).

---

## 1. Backtest Results

### A. Normal Conditions (100 routes)
- **Raw MIMO Inaccurate Bumps**: 21
- **Learned Smoother Inaccurate Bumps**: **9 (57.1% reduction)**
- **Raw Prediction MAE**: 10.47 mins
- **Learned Display MAE**: **10.67 mins**

### B. Storm Surge / Monsoon Conditions (100 routes - Out-Of-Distribution)
- **Raw MIMO Inaccurate Bumps**: 15
- **Learned Smoother Inaccurate Bumps**: **2 (86.7% reduction)**
- **Raw Prediction MAE**: 19.05 mins
- **Learned Display MAE**: **19.23 mins**

---

## 2. Key Senior Design Takeaways

- **Self-Supervised Labeling**: By utilizing Residual Convergence (error between actual delivery and raw ETA less than 2 mins) post-hoc in our database logs, we eliminated clean simulated label dependencies. The model trains purely on observable, historic order arrival events.
- **Storm-Surge Robustness (Velocity Normalization)**: 
  - Standard classifiers misclassify slow rider speeds during storms as individual rider-stopped noise, filtering out legitimate delay warnings.
  - By dividing velocity by the local zone average velocity, the smoother identifies that all riders are slow, and passes the storm-induced delays to the consumer immediately without smoothing lag.

---

> [!TIP]
> **Interview Talking Point:**
> *"To ensure the ETA smoother is resilient to out-of-distribution shifts (like monsoon storms), I normalized rider velocity against the running zone average. This prevents the classifier from misclassifying global weather slow-downs as individual rider noise. In our storm simulations, this normalization maintained low ETA display errors while reducing display jitter by over 60%."*
