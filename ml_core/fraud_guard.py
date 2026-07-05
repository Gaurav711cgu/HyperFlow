import numpy as np

class FraudGuard:
    """
    Hyperlocal Fraud Shield & SLA Penalty Engine - Upgraded.
    Features:
      1. Dynamic COD Risk Gatekeeper.
      2. Rider Theft Sentinel with GPS movement verification.
      3. Merchant SLA Penalty Engine with Cold Food Escrow & Search rank demotion.
      4. Semantic Plausibility Checker to block copy-paste template refund scams.
      5. User Auto-Refund Cap (prevents escrow draining by limiting users to 1 auto-refund/30d).
      6. Cloud-Kitchen Tenure Guard (prevents false positives in multi-tenant kitchen hubs).
    """
    def __init__(self, cod_threshold=0.15, fraud_threshold_high=0.60, fraud_threshold_low=0.20):
        self.cod_threshold = cod_threshold
        self.fraud_threshold_high = fraud_threshold_high
        self.fraud_threshold_low = fraud_threshold_low
        self.merchant_registry = {}

    def get_merchant_metrics(self, merchant_id):
        if merchant_id not in self.merchant_registry:
            self.merchant_registry[merchant_id] = {
                "merchant_id": merchant_id,
                "order_count": 0,
                "cold_food_complaints": 0,
                "escrow_balance": 0.0,
                "search_visibility_factor": 1.0,
                "high_cold_food_alert": False
            }
        return self.merchant_registry[merchant_id]

    # --- 1. Customer-Side COD Gatekeeper ---
    def predict_cod_rejection_risk(self, user_cancellation_rate, user_rating, order_value, hour_of_day):
        score = -2.5 + (5.0 * user_cancellation_rate) - (0.8 * (user_rating - 4.5)) + (0.001 * order_value)
        if hour_of_day >= 22 or hour_of_day <= 4:
            score += 0.5
            
        prob = 1.0 / (1.0 + np.exp(-score))
        is_cod_allowed = prob <= self.cod_threshold
        return float(prob), is_cod_allowed

    # --- 2. Rider-Side Theft Sentinel ---
    def validate_breakdown_claim(self, rider_id, historical_claims_30d, current_velocity_mps):
        is_suspicious_frequency = historical_claims_30d > 3
        is_gps_moving = current_velocity_mps > 2.0
        is_valid_breakdown = not (is_suspicious_frequency or is_gps_moving)
        
        reasons = []
        if is_suspicious_frequency: reasons.append("HIGH_FREQUENCY_CLAIMS")
        if is_gps_moving: reasons.append("GPS_MOVEMENT_DETECTED")
        
        return is_valid_breakdown, reasons

    # --- 3. Merchant SLA Penalty Engine ---
    def record_complaint(self, merchant_id, complaint_type, order_value):
        m = self.get_merchant_metrics(merchant_id)
        m["order_count"] += 1
        
        if complaint_type == "cold_food":
            m["cold_food_complaints"] += 1
            penalty = order_value * 1.10
            m["escrow_balance"] += penalty
            
        complaints = m["cold_food_complaints"]
        if complaints >= 10:
            m["search_visibility_factor"] = 0.20
            m["high_cold_food_alert"] = True
        elif complaints >= 5:
            m["search_visibility_factor"] = 0.70
            m["high_cold_food_alert"] = True
        else:
            m["search_visibility_factor"] = 1.00
            m["high_cold_food_alert"] = False

    def auto_resolve_refund(self, merchant_id, complaint_type, user_auto_refunds_30d=0):
        """
        Decides if a customer complaint for cold food should be automatically resolved
        from merchant escrow pool. Enforces a user-level cap to prevent abuse.
        """
        m = self.get_merchant_metrics(merchant_id)
        
        if complaint_type == "cold_food" and m["high_cold_food_alert"]:
            # Anti-abuse: limit users to a maximum of 1 auto-refund per 30 days
            if user_auto_refunds_30d >= 1:
                return False, "EXCEEDED_USER_AUTO_REFUND_LIMIT"
            return True, "AUTO_REFUND_APPROVED_PEER_SIGNAL"
            
        return False, "STANDARD_PROOF_REQUIRED"

    # --- 4. Semantic Intent & Plausibility Engine ---
    def check_semantic_plausibility(self, complaint_text, items_list):
        text_lower = complaint_text.lower()
        
        # 1. Evaluate "cold food" complaints
        is_cold_complaint = any(word in text_lower for word in ["cold", "soggy", "ice cold", "not hot", "reheat"])
        if is_cold_complaint:
            hot_items = ["fries", "burger", "pizza", "biryani", "chicken", "curry", "roti", "samosa", "momo"]
            has_hot_item = any(item in items_list for item in hot_items)
            if not has_hot_item:
                return False, "COLD_COMPLAINT_ON_DEFAULT_COLD_ITEMS"

        # 2. Evaluate "spilled food" complaints
        is_spill_complaint = any(word in text_lower for word in ["spill", "spilled", "leak", "leaked", "gravy out", "mess"])
        if is_spill_complaint:
            liquid_items = ["dal", "curry", "soup", "gravy", "coke", "pepsi", "shake", "smoothie", "lassi"]
            has_liquid_item = any(item in items_list for item in liquid_items)
            if not has_liquid_item:
                return False, "SPILL_COMPLAINT_ON_DRY_ITEMS"

        return True, "PLAUSIBLE_COMPLAINT"

    # --- 5. Merchant Astroturfing Proximity Guard ---
    def detect_astroturfing_risk(self, distance_m, user_tenure_days, user_historical_orders, shared_ip=False):
        """
        Detects astroturfing (fake ordering) while protecting multi-tenant cloud-kitchen hubs.
        Bypasses fraud alert if user has high tenure and transaction history.
        """
        is_colocated = distance_m < 50.0
        
        # Cloud-kitchen tenure guard bypass
        is_established_customer = (user_tenure_days > 90) and (user_historical_orders > 10)
        
        if is_colocated and not is_established_customer:
            return True, "PROXIMITY_COLLISION_UNESTABLISHED_ACCOUNT"
        if shared_ip and not is_established_customer:
            return True, "SHARED_IP_UNESTABLISHED_ACCOUNT"
            
        return False, "NO_ASTROTURFING_RISK"

    # --- 6. Customer Refund Triager (Fraud Guard) ---
    def triage_refund_request(self, merchant_id, user_refund_ratio, user_tenure_days, user_historical_orders, user_auto_refunds_30d, delivery_duration_min, refund_amount_ratio, has_duplicate_hash, complaint_type, complaint_text, items_list):
        """
        Triages customer refund requests.
        """
        # Step 1: Semantic Plausibility Check
        is_plausible, plausibility_reason = self.check_semantic_plausibility(complaint_text, items_list)
        if not is_plausible:
            return "HUMAN_TAKEOVER", 0.99, f"SEMANTIC_FRAUD_DETECTED: {plausibility_reason}"

        # Step 2: Auto-Resolve check with user refund cap
        auto_approved, reason = self.auto_resolve_refund(merchant_id, complaint_type, user_auto_refunds_30d)
        if auto_approved:
            return "AUTO_REFUND", 0.0, reason
        elif reason == "EXCEEDED_USER_AUTO_REFUND_LIMIT":
            return "VERIFICATION_REQUIRED", 0.35, reason
            
        # Step 3: Run standard context-based fraud probability model
        score = -3.0 + (6.0 * user_refund_ratio) + (4.0 * float(has_duplicate_hash)) + (2.0 * refund_amount_ratio)
        
        # Penalize new/unestablished accounts filing disputes
        if user_tenure_days < 10:
            score += 1.0
            
        if complaint_type == "cold_food":
            if delivery_duration_min < 10.0:
                score += 2.0
            elif delivery_duration_min > 25.0:
                score -= 1.5
                
        prob_fraud = 1.0 / (1.0 + np.exp(-score))
        
        if prob_fraud >= self.fraud_threshold_high:
            outcome = "HUMAN_TAKEOVER"
        elif prob_fraud >= self.fraud_threshold_low:
            outcome = "VERIFICATION_REQUIRED"
        else:
            outcome = "AUTO_REFUND"
            
        return outcome, float(prob_fraud), "CONTEXTUAL_FRAUD_CLASSIFICATION"
