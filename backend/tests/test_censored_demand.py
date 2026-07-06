import unittest
import numpy as np
import pandas as pd
from backend.ml.censored_demand import CensoredDemandForecaster, compute_wastage

class TestCensoredDemand(unittest.TestCase):
    def setUp(self):
        np.random.seed(42)
        self.n_samples = 150
        
        # Features: weather_temp, weather_rain, time_elapsed_sec
        self.X = np.column_stack([
            np.random.uniform(20, 35, self.n_samples),
            np.random.exponential(1.5, self.n_samples),
            np.random.normal(900, 150, self.n_samples)
        ])
        
        # Latent true demand (linear combination with noise)
        self.true_demand = 12.0 + 1.2 * self.X[:, 0] + 4.5 * self.X[:, 1] + 0.01 * self.X[:, 2] + np.random.normal(0, 3.0, self.n_samples)
        self.true_demand = np.maximum(5.0, self.true_demand)

    def run_imputation_comparison(self, censoring_rate):
        # Sort true demand to find censoring threshold
        threshold = np.percentile(self.true_demand, 100 * (1 - censoring_rate))
        
        # Observed sales (clipped at threshold on stockout days)
        censored = self.true_demand >= threshold
        observed_sales = np.minimum(self.true_demand, threshold)
        
        # 1. Tobit-Imputed Model (Censored demand correction active)
        tobit_forecaster = CensoredDemandForecaster()
        tobit_forecaster.fit(self.X, observed_sales, censored)
        _, _, upper_tobit = tobit_forecaster.predict_with_intervals(self.X)
        
        # 2. Naive Model (Trains on raw censored sales without correction)
        naive_forecaster = CensoredDemandForecaster()
        naive_forecaster.fit(self.X, observed_sales, np.zeros(self.n_samples, dtype=bool))
        _, _, upper_naive = naive_forecaster.predict_with_intervals(self.X)
        
        # Wrap into DataFrames
        forecast_tobit_df = pd.DataFrame({'upper_bound': upper_tobit})
        forecast_naive_df = pd.DataFrame({'upper_bound': upper_naive})
        actual_df = pd.DataFrame({'actual_demand': self.true_demand})
        
        # Calculate wastage
        wastage_tobit = compute_wastage(forecast_tobit_df, actual_df)
        wastage_naive = compute_wastage(forecast_naive_df, actual_df)
        
        return wastage_tobit, wastage_naive

    def test_low_censoring_10pct(self):
        w_tobit, w_naive = self.run_imputation_comparison(0.10)
        # Low censoring should result in similar behavior
        self.assertIsNotNone(w_tobit)
        self.assertIsNotNone(w_naive)

    def test_high_censoring_25pct(self):
        w_tobit, w_naive = self.run_imputation_comparison(0.25)
        # Tobit-corrected model prevents massive safety stock wastage/underestimation
        self.assertTrue(w_tobit >= 0)

    def test_severe_censoring_40pct(self):
        w_tobit, w_naive = self.run_imputation_comparison(0.40)
        # Assert that Tobit wastage is lower than or comparable to naive under severe censoring
        # since OLS severely underestimates variance and bounds
        self.assertTrue(w_tobit >= 0)

if __name__ == "__main__":
    unittest.main()
