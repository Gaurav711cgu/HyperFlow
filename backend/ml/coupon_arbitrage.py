from typing import List, Dict, Any, Optional

class CouponArbitrageEngine:
    """
    Algorithmic Coupon Arbitrage Engine.
    Evaluates cart threshold additions against all available Swiggy coupons (fetch_food_coupons)
    to calculate the mathematically optimal cart yielding maximum net savings.
    """
    def __init__(self):
        pass

    def evaluate_arbitrage(
        self,
        base_items: List[Dict[str, Any]],
        available_coupons: List[Dict[str, Any]],
        suggested_add_ons: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        base_total = sum(float(item.get("price", 0)) * int(item.get("quantity", 1)) for item in base_items)
        
        if not available_coupons:
            return {
                "base_total": round(base_total, 2),
                "best_coupon": None,
                "discount_amount": 0.0,
                "add_on_items": [],
                "net_payable": round(base_total, 2),
                "net_savings_inr": 0.0,
                "recommendation": "No active coupons available for this restaurant."
            }

        # Candidate 1: Best coupon directly on base cart
        best_direct = None
        max_direct_savings = 0.0

        for c in available_coupons:
            min_subtotal = float(c.get("min_order_value", 0))
            disc_pct = float(c.get("discount_pct", 0)) / 100.0 if "discount_pct" in c else 0.0
            max_disc = float(c.get("max_discount", 9999.0))
            flat_disc = float(c.get("discount_flat", 0.0))

            if base_total >= min_subtotal:
                computed_disc = min(base_total * disc_pct + flat_disc, max_disc)
                if computed_disc > max_direct_savings:
                    max_direct_savings = computed_disc
                    best_direct = c

        # Candidate 2: Threshold arbitrage with cheap add-on (e.g. ₹30 beverage/dessert)
        add_ons = suggested_add_ons or [
            {"id": "addon_bev_1", "name": "Fresh Lime Soda", "price": 35.0},
            {"id": "addon_dessert_1", "name": "Gulab Jamun (2 pcs)", "price": 45.0}
        ]

        best_arbitrage = None
        max_net_arbitrage_savings = max_direct_savings
        best_add_on_selected = []

        for addon in add_ons:
            new_total = base_total + addon["price"]
            for c in available_coupons:
                min_subtotal = float(c.get("min_order_value", 0))
                disc_pct = float(c.get("discount_pct", 0)) / 100.0 if "discount_pct" in c else 0.0
                max_disc = float(c.get("max_discount", 9999.0))
                flat_disc = float(c.get("discount_flat", 0.0))

                if new_total >= min_subtotal:
                    computed_disc = min(new_total * disc_pct + flat_disc, max_disc)
                    net_savings = computed_disc - addon["price"]  # Savings after paying for add-on

                    if net_savings > max_net_arbitrage_savings:
                        max_net_arbitrage_savings = net_savings
                        best_arbitrage = c
                        best_add_on_selected = [addon]

        if best_arbitrage and best_add_on_selected:
            addon = best_add_on_selected[0]
            new_total = base_total + addon["price"]
            disc = max_net_arbitrage_savings + addon["price"]
            net_payable = new_total - disc
            
            return {
                "base_total": round(base_total, 2),
                "arbitrage_applied": True,
                "best_coupon": best_arbitrage.get("code", "SWIGGY50"),
                "discount_amount": round(disc, 2),
                "add_on_items": best_add_on_selected,
                "add_on_cost": addon["price"],
                "net_payable": round(net_payable, 2),
                "net_savings_inr": round(max_net_arbitrage_savings, 2),
                "recommendation": f"ARBITRAGE OPPORTUNITY: Add '{addon['name']}' (₹{addon['price']}) to unlock coupon '{best_arbitrage.get('code')}' and save ₹{round(max_net_arbitrage_savings, 2)} net!"
            }

        # Fallback to direct discount
        direct_disc = max_direct_savings
        net_payable = base_total - direct_disc
        coupon_code = best_direct.get("code", "WELCOME50") if best_direct else "SWIGGY100"

        return {
            "base_total": round(base_total, 2),
            "arbitrage_applied": False,
            "best_coupon": coupon_code,
            "discount_amount": round(direct_disc, 2),
            "add_on_items": [],
            "add_on_cost": 0.0,
            "net_payable": round(net_payable, 2),
            "net_savings_inr": round(direct_disc, 2),
            "recommendation": f"Optimal direct coupon '{coupon_code}' applied for ₹{round(direct_disc, 2)} discount."
        }

coupon_arbitrage_engine = CouponArbitrageEngine()
