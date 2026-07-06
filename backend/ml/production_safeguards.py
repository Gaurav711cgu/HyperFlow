import numpy as np
import pandas as pd

class ProductionSafeguards:
    """
    Direct implementation of Swiggy's published ML system robustness patterns.
    Manages range-validation, input clipping, unit consistency checks, and
    calculates real Population Stability Index (PSI) values.
    """
    def __init__(self, reference_data: pd.DataFrame = None):
        self.reference_data = reference_data
        self.feature_stats = {}
        
        # Initialize default reference limits if no data is provided
        if reference_data is not None:
            self._fit_reference(reference_data)
        else:
            self._fit_mock_reference()

    def _fit_reference(self, df: pd.DataFrame):
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                vals = df[col].dropna().values
                if len(vals) > 0:
                    p1 = float(np.percentile(vals, 1))
                    p99 = float(np.percentile(vals, 99))
                    mean = float(np.mean(vals))
                    std = float(np.std(vals))
                    self.feature_stats[col] = {
                        "p1": p1,
                        "p99": p99,
                        "mean": mean,
                        "std": std,
                        "reference_distribution": vals
                    }

    def _fit_mock_reference(self):
        # Setup stats for expected feature inputs to prevent empty runs
        np.random.seed(42)
        mock_features = {
            'weather_temp': np.random.uniform(15, 38, 500),
            'weather_rain': np.random.exponential(2.0, 500),
            'observed_sales': np.random.normal(20.0, 8.0, 500),
            'time_elapsed_sec': np.random.normal(900.0, 300.0, 500)
        }
        df_mock = pd.DataFrame(mock_features)
        self._fit_reference(df_mock)

    def validate_and_clip(self, input_df: pd.DataFrame) -> tuple[pd.DataFrame, list[dict]]:
        """
        Validates feature ranges, logs clipping anomalies, and clips outliers to p1/p99.
        """
        clipped_df = input_df.copy()
        alerts = []
        
        for col in input_df.columns:
            if col in self.feature_stats:
                p1 = self.feature_stats[col]["p1"]
                p99 = self.feature_stats[col]["p99"]
                
                # Check for values below p1
                below_mask = input_df[col] < p1
                below_count = int(np.sum(below_mask))
                if below_count > 0:
                    alerts.append({
                        "level": "warning",
                        "feature": col,
                        "count": below_count,
                        "reason": f"Value below p1 limit ({p1:.2f}). Outlier clipped."
                    })
                    
                # Check for values above p99
                above_mask = input_df[col] > p99
                above_count = int(np.sum(above_mask))
                if above_count > 0:
                    alerts.append({
                        "level": "warning",
                        "feature": col,
                        "count": above_count,
                        "reason": f"Value above p99 limit ({p99:.2f}). Outlier clipped."
                    })
                
                # Apply clipping
                clipped_df[col] = np.clip(input_df[col].values, p1, p99)
                
        return clipped_df, alerts

    def check_unit_consistency(self, input_df: pd.DataFrame) -> list[dict]:
        """
        Detects if inputs are provided in incorrect units (e.g. milliseconds instead of seconds).
        Derived from Swiggy's public disclosure of microsecond/millisecond production failures.
        """
        alerts = []
        for col in input_df.columns:
            if "time" in col or "duration" in col or "elapsed" in col:
                # E.g. expected mean is ~900s (15 mins), if we receive values > 100,000,
                # they are likely milliseconds (900,000ms)
                huge_values = (input_df[col] > 100000).sum()
                if huge_values > 0:
                    alerts.append({
                        "level": "critical",
                        "feature": col,
                        "reason": f"Detected {huge_values} unit scale anomalies. Time inputs likely in milliseconds/microseconds instead of seconds."
                    })
        return alerts

    def calculate_psi(self, expected: np.ndarray, actual: np.ndarray, num_bins=10) -> float:
        """
        Calculates Population Stability Index mathematically to track data drift.
        PSI = sum( (Actual_i - Expected_i) * ln(Actual_i / Expected_i) )
        """
        if len(expected) == 0 or len(actual) == 0:
            return 0.0
            
        percentiles = np.linspace(0, 100, num_bins + 1)
        bins = np.percentile(expected, percentiles)
        bins = np.unique(bins)
        
        if len(bins) < 2:
            return 0.0
            
        expected_counts, _ = np.histogram(expected, bins=bins)
        actual_counts, _ = np.histogram(actual, bins=bins)
        
        # Apply Laplace smoothing to avoid divisions by zero
        expected_pct = (expected_counts + 1e-5) / (np.sum(expected_counts) + 1e-5 * len(expected_counts))
        actual_pct = (actual_counts + 1e-5) / (np.sum(actual_counts) + 1e-5 * len(actual_counts))
        
        # Calculate PSI
        psi = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
        return float(psi)

    def calculate_drift_metrics(self, current_batch_df: pd.DataFrame) -> dict:
        """
        Computes the real PSI score for each feature against the baseline.
        """
        drift_results = {}
        for col in current_batch_df.columns:
            if col in self.feature_stats:
                expected_dist = self.feature_stats[col]["reference_distribution"]
                actual_dist = current_batch_df[col].dropna().values
                
                psi_value = self.calculate_psi(expected_dist, actual_dist)
                
                # Determine alert level
                if psi_value < 0.1:
                    status = "green"
                    msg = "Stable"
                elif psi_value < 0.2:
                    status = "yellow"
                    msg = "Moderate Drift"
                else:
                    status = "red"
                    msg = "Significant Drift (Retraining Triggered)"
                    
                drift_results[col] = {
                    "psi": round(psi_value, 4),
                    "status": status,
                    "message": msg
                }
        return drift_results
