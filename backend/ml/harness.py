import time
import hashlib
import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import Any, List, Dict, Optional

from backend.ml.verifier import DemandForecastVerifier, VerificationResult

@dataclass
class HarnessResult:
    output: Any
    latency_ms: int
    model_name: str
    input_hash: str
    clipped_features: List[str]
    guardrail_triggered: bool
    verification_reason: Optional[str] = None
    action: str = "ship"

class MLHarness:
    """
    Single entry point for all ML model calls in HyperFlow.
    Enforces: schema validation → input clipping → model call → output verification.
    """
    def __init__(self, model, safeguards, verifier: Optional[DemandForecastVerifier] = None):
        self.model = model
        self.safeguards = safeguards
        self.verifier = verifier or DemandForecastVerifier()

    def run(self, X: np.ndarray, context: Dict[str, Any]) -> HarnessResult:
        t0 = time.perf_counter()
        feature_names = context.get("feature_names", ["weather_temp", "weather_rain", "time_elapsed_sec"])
        
        # Layer 1: Input validation & clipping
        X_df = pd.DataFrame(X, columns=feature_names)
        X_clipped, alerts = self.safeguards.validate_and_clip(X_df)
        clipped_features = [a.get("feature", "unknown") for a in alerts]
        
        # Layer 2: Model execution
        output = self.model.predict(X_clipped.values)
        
        # Layer 3: Output verification gate
        verification: VerificationResult = self.verifier.check(output, context)
        
        latency_ms = int((time.perf_counter() - t0) * 1000)
        input_bytes = X_clipped.values.tobytes()
        input_hash = hashlib.md5(input_bytes).hexdigest()[:8]
        
        return HarnessResult(
            output=output if verification.action != "fallback" else np.maximum(0, context.get("ols_baseline", output)),
            latency_ms=latency_ms,
            model_name=type(self.model).__name__,
            input_hash=input_hash,
            clipped_features=clipped_features,
            guardrail_triggered=verification.triggered,
            verification_reason=verification.reason,
            action=verification.action
        )
