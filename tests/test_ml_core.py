import unittest
import numpy as np

# Import our ML core modules
from ml_core.demand_forecaster import TobitRegressor
from ml_core.eta_smoother import LearnedETASmoother
from ml_core.rescue_optimizer import RescueOptimizer
from ml_core.fraud_guard import FraudGuard
from ml_core.dispatch_batcher import DispatchBatcher

class TestTobitRegressor(unittest.TestCase):
    def test_tobit_imputation_bounds(self):
        """
        Asserts that imputed demand is always greater than or equal to observed sales
        for right-censored observations (stockouts).
        """
        tobit = TobitRegressor()
        X = np.array([[1.0, 0.0], [2.0, 1.0], [1.5, 0.0], [3.0, 1.0]])
        y_obs = np.array([40.0, 60.0, 45.0, 90.0])
        censored = np.array([False, False, False, True]) # stockout on last day
        
        tobit.fit(X, y_obs, censored)
        y_imputed = tobit.impute_demand(X, y_obs, censored)
        
        # Censored value must be imputed upwards
        self.assertGreaterEqual(y_imputed[3], y_obs[3])
        # Uncensored values must remain unchanged
        self.assertEqual(y_imputed[0], y_obs[0])
        self.assertEqual(y_imputed[1], y_obs[1])


class TestETASmoother(unittest.TestCase):
    def test_jitter_suppression(self):
        """
        Asserts that a transient GPS noise spike (jump in ETA with high velocity)
        is smoothed using a low alpha filter, while a real delay (low velocity) is passed.
        """
        smoother = LearnedETASmoother()
        
        # Fit with a stable dataset (15 samples each, differing only in velocity to force split on column 6)
        X_train_real = np.tile([5.0, 0.0, 0.0, 5.0, 300, 1000, 0.1], (15, 1))
        X_train_noise = np.tile([5.0, 0.0, 0.0, 5.0, 300, 1000, 1.2], (15, 1))
        X_train = np.vstack([X_train_real, X_train_noise])
        y_train = np.array([1]*15 + [0]*15)
        smoother.fit(X_train, y_train)
        
        # Test case A: Transient noise bump (large jump but rider moving fast)
        prev_raw = [0, 0, 10.0]
        curr_raw = [0, 0, 15.0]
        prev_smooth = 10.0
        
        smooth_noise, is_real_noise, _ = smoother.smooth_eta(
            prev_smoothed_eta=prev_smooth,
            prev_raw_eta_legs=prev_raw,
            curr_raw_eta_legs=curr_raw,
            time_elapsed_sec=300.0,
            distance_left_m=1200.0,
            velocity_mps=9.6, # 9.6 / 8.0 = 1.2 normalized velocity
            zone_avg_velocity_mps=8.0
        )
        # Should be suppressed (closer to prev_smooth than curr_raw)
        self.assertFalse(is_real_noise)
        self.assertLess(smooth_noise, 14.0)

        # Test case B: Real delay (large jump, rider stopped)
        smooth_real, is_real_delay, _ = smoother.smooth_eta(
            prev_smoothed_eta=prev_smooth,
            prev_raw_eta_legs=prev_raw,
            curr_raw_eta_legs=curr_raw,
            time_elapsed_sec=300.0,
            distance_left_m=1200.0,
            velocity_mps=0.8, # 0.8 / 8.0 = 0.1 normalized velocity (stopped)
            zone_avg_velocity_mps=8.0
        )
        # Should be accepted as real delay
        self.assertTrue(is_real_delay)
        self.assertGreater(smooth_real, 13.5)


class TestRescueOptimizer(unittest.TestCase):
    def test_arbitrage_shield(self):
        """
        Asserts that the rescue optimizer successfully flags co-located
        or matching IP buyers as arbitrage risks.
        """
        opt = RescueOptimizer()
        
        # Scenario A: Arbitrage attempt (matching IP address)
        is_risk_ip, _ = opt.check_arbitrage_risk(
            buyer_lat=12.9716, buyer_lng=77.5946, buyer_ip="192.168.1.5",
            cancelling_lat=12.9718, cancelling_lng=77.5948, cancelling_ip="192.168.1.5"
        )
        self.assertTrue(is_risk_ip)

        # Scenario B: Arbitrage attempt (proximity under 100 meters)
        is_risk_prox, _ = opt.check_arbitrage_risk(
            buyer_lat=12.9716, buyer_lng=77.5946, buyer_ip="192.168.1.10",
            cancelling_lat=12.97162, cancelling_lng=77.59462, cancelling_ip="192.168.1.20" # ~3 meters apart
        )
        self.assertTrue(is_risk_prox)

        # Scenario C: Genuine buyer (distant, separate IP)
        is_risk_gen, _ = opt.check_arbitrage_risk(
            buyer_lat=12.9850, buyer_lng=77.6100, buyer_ip="192.168.1.10",
            cancelling_lat=12.9716, cancelling_lng=77.5946, cancelling_ip="192.168.1.20" # ~2 km apart
        )
        self.assertFalse(is_risk_gen)

    def test_weather_aware_decay(self):
        """
        Asserts that warm meals decay faster in cold outdoor temperatures,
        and cold desserts melt faster in hot outdoor temperatures.
        """
        opt = RescueOptimizer()
        
        # Warm meal cooling: 12C (cold) vs 25C (normal)
        sqi_cold_day = opt.get_sensory_quality("warm_meal", 15.0, ambient_temp_c=12.0)
        sqi_normal_day = opt.get_sensory_quality("warm_meal", 15.0, ambient_temp_c=25.0)
        self.assertLess(sqi_cold_day, sqi_normal_day)

        # Ice cream melting: 38C (hot summer) vs 25C (normal)
        sqi_hot_day = opt.get_sensory_quality("cold_dessert", 5.0, ambient_temp_c=38.0)
        sqi_normal_dessert = opt.get_sensory_quality("cold_dessert", 5.0, ambient_temp_c=25.0)
        self.assertLess(sqi_hot_day, sqi_normal_dessert)


class TestFraudGuard(unittest.TestCase):
    def test_semantic_mismatch_blocks(self):
        """
        Asserts that filed complaints with semantic mismatches are instantly flagged
        for human takeover.
        """
        guard = FraudGuard()
        
        # Cold food complaint filed on ice cream
        is_valid_cold, _ = guard.check_semantic_plausibility("Ice cream was cold", ["ice_cream"])
        self.assertFalse(is_valid_cold)

        # Spill complaint filed on dry items (chips/oreo)
        is_valid_spill, _ = guard.check_semantic_plausibility("Gravy spilled completely", ["lays_chips", "oreo_biscuits"])
        self.assertFalse(is_valid_spill)

    def test_user_auto_refund_cap(self):
        """
        Asserts that users who exceed the monthly auto-refund limit under High Alert stores
        are blocked from auto-refund and forced to undergo verification.
        """
        guard = FraudGuard()
        
        # Put merchant_1 on alert
        for _ in range(12):
            guard.record_complaint("merchant_1", "cold_food", 250.0)
            
        # First claim (user_auto_refunds_30d = 0) -> Approved
        outcome_1, _, _ = guard.triage_refund_request(
            merchant_id="merchant_1", user_refund_ratio=0.02, user_tenure_days=100, user_historical_orders=20,
            user_auto_refunds_30d=0, delivery_duration_min=22.0, refund_amount_ratio=0.5, has_duplicate_hash=False,
            complaint_type="cold_food", complaint_text="Fries were cold", items_list=["fries", "burger"]
        )
        self.assertEqual(outcome_1, "AUTO_REFUND")

        # Second claim (user_auto_refunds_30d = 1) -> Forced to verification
        outcome_2, _, _ = guard.triage_refund_request(
            merchant_id="merchant_1", user_refund_ratio=0.02, user_tenure_days=100, user_historical_orders=20,
            user_auto_refunds_30d=1, delivery_duration_min=22.0, refund_amount_ratio=0.5, has_duplicate_hash=False,
            complaint_type="cold_food", complaint_text="Pizza was cold", items_list=["pizza", "fries"]
        )
        self.assertEqual(outcome_2, "VERIFICATION_REQUIRED")


class TestDispatchBatcher(unittest.TestCase):
    def test_batching_sla_pruning(self):
        """
        Asserts that orders separated by distances violating the 15-minute SLA
        are pruned and not batched together.
        """
        batcher = DispatchBatcher(max_batch_size=3, max_radius_km=5.0, sla_limit_min=15.0)
        
        # Dark store at center
        store_lat, store_lng = 12.9716, 77.5946
        
        # Order 1 is close, Order 2 is far away (10 km, travel time ~24 mins alone)
        orders = [
            {"order_id": "O_1", "lat": 12.9730, "lng": 77.5960, "t_prep": 5},
            {"order_id": "O_2", "lat": 13.0600, "lng": 77.5946, "t_prep": 5}
        ]
        
        batches = batcher.optimize_batches(store_lat, store_lng, orders)
        
        # Should not cluster them together (should result in 2 separate batches)
        self.assertEqual(len(batches), 2)
        self.assertEqual(batches[0][0]["order_id"], "O_1")
        self.assertEqual(batches[1][0]["order_id"], "O_2")


if __name__ == '__main__':
    unittest.main()
