import pytest
from backend.ml.coupon_arbitrage import coupon_arbitrage_engine

def test_coupon_arbitrage_threshold_expansion():
    base_items = [
        {"id": "item_1", "name": "Chicken Biryani", "price": 270.0, "quantity": 1}
    ]
    coupons = [
        {"code": "SWIGGY100", "min_order_value": 300.0, "discount_flat": 100.0}
    ]
    add_ons = [
        {"id": "addon_bev_1", "name": "Fresh Lime Soda", "price": 35.0}
    ]

    result = coupon_arbitrage_engine.evaluate_arbitrage(base_items, coupons, add_ons)
    
    assert result["arbitrage_applied"] is True
    assert result["best_coupon"] == "SWIGGY100"
    assert result["net_savings_inr"] == 65.0  # 100 discount - 35 add-on = 65 net savings
    assert result["net_payable"] == 205.0     # 270 + 35 - 100 = 205

def test_coupon_direct_application():
    base_items = [
        {"id": "item_1", "name": "Mutton Biryani", "price": 450.0, "quantity": 1}
    ]
    coupons = [
        {"code": "SWIGGY100", "min_order_value": 300.0, "discount_flat": 100.0}
    ]

    result = coupon_arbitrage_engine.evaluate_arbitrage(base_items, coupons)
    
    assert result["arbitrage_applied"] is False
    assert result["best_coupon"] == "SWIGGY100"
    assert result["net_savings_inr"] == 100.0
    assert result["net_payable"] == 350.0
