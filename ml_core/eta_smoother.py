import numpy as np
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestClassifier

class MIMOEtaPredictor:
    """
    Multi-Input Multi-Output (MIMO) ETA Predictor.
    """
    def __init__(self):
        self.model = MultiOutputRegressor(
            HistGradientBoostingRegressor(loss='absolute_error', max_iter=50)
        )
        self.fitted = False

    def fit(self, X, Y):
        self.model.fit(X, Y)
        self.fitted = True
        return self

    def predict(self, X):
        if not self.fitted:
            raise ValueError("MIMO Model not fitted yet.")
        return self.model.predict(X)


class LearnedETASmoother:
    """
    Intelligent ETA Smoothing Gate.
    Updates:
      1. Features are normalized by `zone_avg_velocity_mps` to prevent out-of-distribution drift
         during seasonal storms or gridlock.
      2. Designed to be trained on self-supervised labels (Residual Convergence) from database logs.
    """
    def __init__(self, probability_threshold=0.45, base_alpha_noise=0.15, base_alpha_real=0.80):
        self.classifier = RandomForestClassifier(n_estimators=50, random_state=42)
        self.prob_threshold = probability_threshold
        self.alpha_noise = base_alpha_noise
        self.alpha_real = base_alpha_real
        self.fitted = False

    def extract_delta_features(self, prev_raw_eta_legs, curr_raw_eta_legs, time_elapsed_sec, distance_left_m, velocity_mps, zone_avg_velocity_mps=8.0):
        """
        Extracts delta features between sequential pings.
        Includes velocity normalization: normalized_velocity = velocity_mps / zone_avg_velocity_mps.
        """
        prev_sum = np.sum(prev_raw_eta_legs)
        curr_sum = np.sum(curr_raw_eta_legs)
        
        raw_eta_delta = curr_sum - prev_sum
        prep_delta = curr_raw_eta_legs[0] - prev_raw_eta_legs[0]
        first_mile_delta = curr_raw_eta_legs[1] - prev_raw_eta_legs[1]
        last_mile_delta = curr_raw_eta_legs[2] - prev_raw_eta_legs[2]
        
        # Velocity normalization to shield from global weather/traffic drift
        normalized_velocity = velocity_mps / (zone_avg_velocity_mps + 1e-3)
        
        features = [
            raw_eta_delta,
            prep_delta,
            first_mile_delta,
            last_mile_delta,
            time_elapsed_sec,
            distance_left_m,
            normalized_velocity
        ]
        return np.array(features)

    def fit(self, X_deltas, y_real_delay):
        self.classifier.fit(X_deltas, y_real_delay)
        self.fitted = True
        return self

    def smooth_eta(self, prev_smoothed_eta, prev_raw_eta_legs, curr_raw_eta_legs, time_elapsed_sec, distance_left_m, velocity_mps, zone_avg_velocity_mps=8.0):
        """
        Smooths the ETA using our normalized classification gate.
        """
        curr_raw_eta = np.sum(curr_raw_eta_legs)
        
        if prev_smoothed_eta is None:
            return curr_raw_eta, False, 0.0
            
        if curr_raw_eta <= np.sum(prev_raw_eta_legs):
            return curr_raw_eta, False, 0.0
            
        if not self.fitted:
            alpha = 0.3
            smoothed = alpha * curr_raw_eta + (1 - alpha) * prev_smoothed_eta
            return smoothed, False, 0.5
            
        # Extract normalized delta features
        feats = self.extract_delta_features(
            prev_raw_eta_legs, curr_raw_eta_legs, time_elapsed_sec, distance_left_m, velocity_mps, zone_avg_velocity_mps
        ).reshape(1, -1)
        
        prob_real = self.classifier.predict_proba(feats)[0][1]
        is_real_delay = prob_real > self.prob_threshold
        
        alpha = self.alpha_real if is_real_delay else self.alpha_noise
        smoothed = alpha * curr_raw_eta + (1 - alpha) * prev_smoothed_eta
        return smoothed, is_real_delay, prob_real
