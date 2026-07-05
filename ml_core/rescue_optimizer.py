import numpy as np

class RescueOptimizer:
    """
    Cancelled Order Rescue Optimizer (CORO) - Upgraded.
    Includes:
      1. Dynamic weather-aware thermal decay modeling.
      2. Anti-arbitrage Sybil checks to prevent customer discount exploitation.
    """
    DECAY_RATES_BASE = {
        "fried_food": 0.12,
        "hot_beverage": 0.08,
        "warm_meal": 0.04,
        "cold_dessert": 0.25,
        "standard_bakery": 0.02
    }

    def __init__(self, quality_threshold=60.0, markdown_buffer=0.15):
        self.quality_threshold = quality_threshold
        self.markdown_buffer = markdown_buffer

    def get_sensory_quality(self, food_category, transit_time_min, ambient_temp_c=25.0):
        """
        Calculates the SQI adjusted for ambient weather conditions.
        """
        lambda_base = self.DECAY_RATES_BASE.get(food_category, 0.05)
        
        # Weather adjustments
        if food_category in ["hot_beverage", "warm_meal", "fried_food"]:
            # Colder outdoor temperatures accelerate cooling
            weather_multiplier = 1.0 + 0.04 * max(0.0, 20.0 - ambient_temp_c)
        elif food_category == "cold_dessert":
            # Hotter outdoor temperatures accelerate melting
            weather_multiplier = 1.0 + 0.08 * max(0.0, ambient_temp_c - 20.0)
        else:
            weather_multiplier = 1.0
            
        lambda_adjusted = lambda_base * weather_multiplier
        sqi = 100.0 * np.exp(-lambda_adjusted * transit_time_min)
        return float(sqi)

    def is_rescuable(self, food_category, transit_time_min, ambient_temp_c=25.0):
        sqi = self.get_sensory_quality(food_category, transit_time_min, ambient_temp_c)
        return sqi >= self.quality_threshold

    def calculate_rescue_price(self, base_price, customer_active_coupons):
        flat_disc = customer_active_coupons.get("flat_discount", 0.0)
        pct_disc = customer_active_coupons.get("discount_pct", 0.0)
        max_pct_disc = customer_active_coupons.get("max_discount", 999.0)
        
        best_disc = max(flat_disc, min(base_price * pct_disc, max_pct_disc))
        fresh_price = max(0.0, base_price - best_disc)
        
        target_rescue_price = fresh_price * (1.0 - self.markdown_buffer)
        max_rescue_price = base_price * 0.50
        
        final_rescue_price = min(target_rescue_price, max_rescue_price)
        floor_price = base_price * 0.20
        
        return float(np.maximum(floor_price, final_rescue_price))

    def check_arbitrage_risk(self, buyer_lat, buyer_lng, buyer_ip, cancelling_lat, cancelling_lng, cancelling_ip, buyer_cancellation_history_30m=False):
        """
        Detects if a nearby customer is trying to play order-flipping arbitrage:
          - Co-location: buyer is < 100m from the cancel site.
          - Sybil: buyer shares the same IP address subnet.
          - History: buyer has cancellation flags in the last 30 minutes.
        """
        # Distance calculation
        R = 6371000.0 # Earth radius in meters
        dlat = np.radians(cancelling_lat - buyer_lat)
        dlng = np.radians(cancelling_lng - buyer_lng)
        a = np.sin(dlat / 2)**2 + np.cos(np.radians(buyer_lat)) * np.cos(np.radians(cancelling_lat)) * np.sin(dlng / 2)**2
        dist_m = 2 * R * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        
        is_co_located = dist_m < 100.0
        is_same_ip = (buyer_ip == cancelling_ip)
        has_recent_cancellation = buyer_cancellation_history_30m
        
        is_arbitrage = is_co_located or is_same_ip or has_recent_cancellation
        
        reasons = []
        if is_co_located: reasons.append("CO_LOCATION_PROXIMITY_ALERT")
        if is_same_ip: reasons.append("SHARED_IP_SUBNET_ALERT")
        if has_recent_cancellation: reasons.append("RECENT_CANCEL_HISTORY_ALERT")
        
        return is_arbitrage, reasons

    def score_rescue_candidate(self, buyer_distance_km, rider_heading_alignment, buyer_affinity_score):
        dist_score = 1.0 / (1.0 + buyer_distance_km**2)
        route_utility = max(0.0, rider_heading_alignment)
        match_score = 0.5 * dist_score + 0.3 * route_utility + 0.2 * buyer_affinity_score
        return float(match_score)
