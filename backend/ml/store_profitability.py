import numpy as np
import pandas as pd
from scipy.optimize import minimize

try:
    from lifelines import CoxPHFitter
    HAS_LIFELINES = True
except ImportError:
    HAS_LIFELINES = False

def expit(x):
    return 1 / (1 + np.exp(-np.clip(x, -20, 20)))


class CustomCoxPHFitter:
    """
    Self-contained Cox Proportional Hazards fitter using BFGS optimization
    of Cox's partial log-likelihood to avoid mandatory lifelines compiler dependencies.
    """
    def __init__(self):
        self.coefficients = None
        self.feature_names = None
        self.fitted = False
        self.baseline_hazard_ = {}

    def _neg_partial_log_likelihood(self, beta, X, durations, events):
        # Sort observations by duration ascending
        sort_idx = np.argsort(durations)
        X_sorted = X[sort_idx]
        events_sorted = events[sort_idx]
        
        scores = np.dot(X_sorted, beta)
        exp_scores = np.exp(scores)
        
        log_like = 0.0
        n_samples = X.shape[0]
        
        for i in range(n_samples):
            if events_sorted[i] == 1:
                # Risk set: all individuals with duration >= current duration
                risk_sum = np.sum(exp_scores[i:])
                log_like += scores[i] - np.log(risk_sum + 1e-9)
                
        return -log_like

    def fit(self, df, duration_col, event_col):
        self.feature_names = [col for col in df.columns if col not in [duration_col, event_col]]
        X = df[self.feature_names].values
        durations = df[duration_col].values
        events = df[event_col].values
        
        init_beta = np.zeros(X.shape[1])
        res = minimize(
            self._neg_partial_log_likelihood, 
            init_beta, 
            args=(X, durations, events), 
            method='BFGS'
        )
        
        self.coefficients = res.x
        self.fitted = True
        
        # Estimate baseline cumulative hazard H_0(t) using Nelson-Aalen estimator style
        # H_0(t) = sum_{t_j <= t} ( d_j / sum_{k in R(t_j)} exp(X_k * beta) )
        sort_idx = np.argsort(durations)
        X_sorted = X[sort_idx]
        durations_sorted = durations[sort_idx]
        events_sorted = events[sort_idx]
        exp_scores = np.exp(np.dot(X_sorted, self.coefficients))
        
        unique_times = np.unique(durations_sorted)
        cumulative_hazard = 0.0
        
        for t in unique_times:
            # Events at time t
            at_t = (durations_sorted == t)
            events_at_t = np.sum(events_sorted[at_t])
            
            # Risk set sum
            at_risk = (durations_sorted >= t)
            risk_sum = np.sum(exp_scores[at_risk])
            
            if risk_sum > 0:
                cumulative_hazard += events_at_t / risk_sum
            
            self.baseline_hazard_[t] = cumulative_hazard
            
        return self

    def predict_partial_hazard(self, X):
        if not self.fitted:
            raise ValueError("Model not fitted.")
        return np.exp(np.dot(X, self.coefficients))

    def predict_survival_probability(self, X, months):
        """
        S(t | X) = exp( - H_0(t) * exp(X * beta) )
        """
        if not self.fitted:
            raise ValueError("Model not fitted.")
        
        partial_hazard = self.predict_partial_hazard(X)
        
        # Find closest baseline time <= months
        times = sorted(self.baseline_hazard_.keys())
        if not times:
            return np.ones(X.shape[0])
            
        closest_t = times[0]
        for t in times:
            if t <= months:
                closest_t = t
            else:
                break
                
        h0 = self.baseline_hazard_[closest_t]
        # Survival prob = exp(-H_0(t) * exp(X * beta))
        return np.exp(-h0 * partial_hazard)


class DarkStoreProfitabilityScorer:
    """
    Predicts time-to-profitability (months) for new dark stores.
    Uses Cox Proportional Hazards for time-to-event survival models.
    """
    def __init__(self):
        if HAS_LIFELINES:
            self.model = CoxPHFitter()
        else:
            self.model = CustomCoxPHFitter()
        self.fitted = False
        self.feature_names = [
            'pop_density',          # Population density (10k/km2)
            'competitor_density',   # Competitor dark stores in 2km
            'dist_to_profitable',   # Distance to nearest profitable store (km)
            'initial_sku_count',    # Launch SKU list size (in 1000s)
            'avg_aov_in_zone',       # Average Area Order Value (INR / 100)
            'non_grocery_share'     # Electronics/pharmacy GMV share (0.0 to 1.0)
        ]

    def fit(self, df: pd.DataFrame, duration_col='months_to_profit', event_col='profitable'):
        # Keep only required columns
        fit_df = df[self.feature_names + [duration_col, event_col]].copy()
        
        if HAS_LIFELINES:
            self.model.fit(fit_df, duration_col=duration_col, event_col=event_col)
        else:
            self.model.fit(fit_df, duration_col=duration_col, event_col=event_col)
            
        self.fitted = True
        return self

    def predict_survival_curve(self, X_input: np.ndarray, months_horizon=12) -> dict:
        """
        Predict survival probability (i.e. probability of NOT reaching profitability yet)
        at each month up to months_horizon.
        """
        if not self.fitted:
            # Seed default coefficients if called before fit
            self._fit_mock()
            
        probs = []
        for m in range(1, months_horizon + 1):
            if HAS_LIFELINES:
                # lifelines returns a DataFrame of survival curves
                pred_df = self.model.predict_survival_function(pd.DataFrame(X_input, columns=self.feature_names), times=[m])
                prob = float(pred_df.iloc[0].values[0])
            else:
                prob = float(self.model.predict_survival_probability(X_input, m)[0])
            # Probability of reaching profitability is 1 - S(t)
            probs.append({"month": m, "prob_profitable": round((1 - prob) * 100, 1)})
            
        return probs

    def predict_time_to_profit(self, X_input: np.ndarray) -> float:
        """
        Calculates median expected time to reach store-level profitability.
        """
        if not self.fitted:
            self._fit_mock()
            
        # Median time is when survival probability S(t) <= 0.5
        for m in range(1, 24):
            if HAS_LIFELINES:
                pred = self.model.predict_survival_function(pd.DataFrame(X_input, columns=self.feature_names), times=[m])
                s_t = float(pred.iloc[0].values[0])
            else:
                s_t = float(self.model.predict_survival_probability(X_input, m)[0])
            if s_t <= 0.5:
                return float(m)
        return 12.0 # default fallback

    def _fit_mock(self):
        # Create synthetic data to fit the model dynamically if database isn't fully loaded
        np.random.seed(42)
        n_samples = 100
        
        pop = np.random.uniform(1.0, 10.0, n_samples)
        comp = np.random.randint(0, 5, n_samples)
        dist = np.random.uniform(0.5, 8.0, n_samples)
        skus = np.random.uniform(1.0, 5.0, n_samples)
        aov = np.random.uniform(2.5, 7.5, n_samples)
        non_g = np.random.uniform(0.05, 0.40, n_samples)
        
        # Months to profit is smaller for high pop, high skus, high AOV, and larger for high competitors
        hazard = 0.3 * pop - 0.4 * comp - 0.2 * dist + 0.3 * skus + 0.2 * aov + 0.5 * non_g
        months = np.clip(np.random.geometric(p=expit(hazard), size=n_samples), 1, 18)
        profitable = np.random.choice([0, 1], p=[0.1, 0.9], size=n_samples) # mostly completed events
        
        df_mock = pd.DataFrame({
            'pop_density': pop,
            'competitor_density': comp.astype(float),
            'dist_to_profitable': dist,
            'initial_sku_count': skus,
            'avg_aov_in_zone': aov,
            'non_grocery_share': non_g,
            'months_to_profit': months,
            'profitable': profitable
        })
        self.fit(df_mock)
