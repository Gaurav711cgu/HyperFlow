import numpy as np
from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class VerificationResult:
    triggered: bool
    reason: Optional[str]
    action: str  # "ship" | "alert" | "fallback"

class DemandForecastVerifier:
    """
    Post-prediction verification layer in the ML Harness.
    Checks: output bounds, negative predictions, extreme uplift vs. baseline.
    """
    MAX_DAILY_DEMAND = 10_000
    MAX_UPLIFT_RATIO = 5.0  # Tobit should never predict >5x the OLS baseline

    def check(self, output: np.ndarray, context: Dict[str, Any]) -> VerificationResult:
        if np.any(output < 0):
            return VerificationResult(True, "Negative demand prediction detected", "fallback")
            
        if np.any(output > self.MAX_DAILY_DEMAND):
            return VerificationResult(True, f"Prediction exceeds upper daily bound of {self.MAX_DAILY_DEMAND}", "alert")
            
        if "ols_baseline" in context:
            ols_baseline = context["ols_baseline"]
            ratio = output / (np.maximum(1e-9, ols_baseline))
            if np.any(ratio > self.MAX_UPLIFT_RATIO):
                max_r = float(np.max(ratio))
                return VerificationResult(True, f"Uplift ratio {max_r:.1f}x exceeds safety threshold {self.MAX_UPLIFT_RATIO}x", "alert")
                
        return VerificationResult(False, None, "ship")
