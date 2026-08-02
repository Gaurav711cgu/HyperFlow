from __future__ import annotations

from dataclasses import asdict, dataclass
import math
from typing import Dict, List, Tuple


@dataclass(frozen=True)
class SiteProfile:
    """Candidate catchment signals for a new Instamart dark store."""

    pincode: str
    latitude: float
    longitude: float
    city: str
    avg_daily_food_orders_zone: float
    avg_order_value_food: float
    cancellation_rate_food: float
    peak_hour_concentration: float
    zone_type: str = "mixed_use"
    existing_blinkit_stores_radius: int = 0
    existing_zepto_stores_radius: int = 0
    existing_swiggy_dark_stores_radius: int = 0
    real_estate_cost_monthly: float = 120000.0
    median_household_income_index: float = 1.0
    college_or_office_density_index: float = 1.0


@dataclass(frozen=True)
class SiteSelectionDecision:
    pincode: str
    city: str
    recommendation: str
    composite_score: float
    demand_density_score: float
    unit_economics_score: float
    projected_daily_orders_d0: float
    projected_daily_orders_d90: float
    projected_breakeven_months: float
    breakeven_ci_lower: float
    breakeven_ci_upper: float
    projected_monthly_contribution: float
    cannibalization_risk: str
    competition_pressure: str
    ttp_risk_flag: bool
    recommended_initial_sku_count: int
    priority_categories: List[str]
    confidence_level: str
    reasoning: List[str]

    def model_dump(self) -> Dict[str, object]:
        return asdict(self)


ZONE_MULTIPLIERS = {
    "tech_corridor": 1.22,
    "office": 1.15,
    "college": 1.14,
    "mixed_use": 1.06,
    "residential": 0.98,
    "suburban": 0.88,
}


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two coordinates."""
    radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return radius_km * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _score_competition(blinkit: int, zepto: int) -> Tuple[float, str]:
    competitor_count = max(0, blinkit) + max(0, zepto)
    if competitor_count == 0:
        return 92.0, "LOW"
    if competitor_count <= 2:
        return 76.0 - 8.0 * competitor_count, "MEDIUM"
    return max(32.0, 64.0 - 7.5 * competitor_count), "HIGH"


def _score_cannibalization(existing_swiggy_stores: int) -> Tuple[float, str]:
    if existing_swiggy_stores <= 0:
        return 100.0, "LOW"
    if existing_swiggy_stores == 1:
        return 72.0, "MEDIUM"
    return max(35.0, 72.0 - 17.0 * existing_swiggy_stores), "HIGH"


def _priority_categories(profile: SiteProfile) -> List[str]:
    zone = profile.zone_type.lower()
    categories = ["milk-and-dairy", "fresh-produce", "snacks-and-beverages"]
    if zone in {"tech_corridor", "office"}:
        categories.extend(["ready-to-eat", "personal-care", "electronics-accessories"])
    elif zone == "college":
        categories.extend(["instant-food", "beverages", "stationery"])
    elif zone == "residential":
        categories.extend(["baby-care", "home-cleaning", "staples"])
    else:
        categories.extend(["staples", "home-cleaning", "personal-care"])
    return categories[:6]


def evaluate_site(profile: SiteProfile) -> SiteSelectionDecision:
    """
    Convert Swiggy food-order catchment signals into an Instamart Go/Hold/No-Go call.

    The scoring model is intentionally transparent for interview review: food-order
    density is used as a quick-commerce demand proxy, AOV and rent estimate drive
    unit economics, and competitor/store counts penalize saturation and cannibalization.
    """
    if profile.real_estate_cost_monthly <= 0:
        raise ValueError("real_estate_cost_monthly must be positive")
    if not 0 <= profile.cancellation_rate_food <= 1:
        raise ValueError("cancellation_rate_food must be between 0 and 1")
    if not 0 <= profile.peak_hour_concentration <= 1:
        raise ValueError("peak_hour_concentration must be between 0 and 1")

    zone_multiplier = ZONE_MULTIPLIERS.get(profile.zone_type.lower(), 1.0)
    density_score = _clamp(profile.avg_daily_food_orders_zone / 3.0, 0.0, 100.0)
    aov_score = _clamp((profile.avg_order_value_food - 180.0) / 3.2, 0.0, 100.0)
    spread_score = _clamp((1.0 - profile.peak_hour_concentration) * 120.0, 0.0, 100.0)
    impatience_score = _clamp(profile.cancellation_rate_food * 650.0, 0.0, 100.0)
    competition_score, competition_pressure = _score_competition(
        profile.existing_blinkit_stores_radius,
        profile.existing_zepto_stores_radius,
    )
    cannibalization_score, cannibalization_risk = _score_cannibalization(
        profile.existing_swiggy_dark_stores_radius
    )

    demand_density_score = _clamp(
        (0.58 * density_score + 0.22 * spread_score + 0.20 * impatience_score)
        * zone_multiplier
        * _clamp(profile.college_or_office_density_index, 0.7, 1.35),
        0.0,
        100.0,
    )

    rent_pressure = _clamp(profile.real_estate_cost_monthly / 250000.0, 0.25, 1.8)
    unit_economics_score = _clamp(
        (0.58 * aov_score + 0.42 * demand_density_score)
        * _clamp(profile.median_household_income_index, 0.75, 1.35)
        / rent_pressure,
        0.0,
        100.0,
    )

    composite_score = _clamp(
        0.38 * demand_density_score
        + 0.28 * unit_economics_score
        + 0.18 * competition_score
        + 0.16 * cannibalization_score,
        0.0,
        100.0,
    )

    d0_orders = max(
        12.0,
        profile.avg_daily_food_orders_zone
        * 0.18
        * zone_multiplier
        * _clamp(profile.median_household_income_index, 0.75, 1.35),
    )
    growth_factor = 1.45 + (demand_density_score / 100.0) * 0.55
    d90_orders = d0_orders * growth_factor

    contribution_per_order = max(32.0, profile.avg_order_value_food * 0.18)
    monthly_contribution = (d90_orders * contribution_per_order * 30.0) - profile.real_estate_cost_monthly

    breakeven_months = (
        14.0
        - (composite_score / 100.0) * 7.2
        + (profile.existing_swiggy_dark_stores_radius * 0.9)
        + ((profile.existing_blinkit_stores_radius + profile.existing_zepto_stores_radius) * 0.35)
    )
    breakeven_months = _clamp(breakeven_months, 4.0, 18.0)
    ci_width = 1.2 + (100.0 - composite_score) / 30.0

    if composite_score >= 72.0 and breakeven_months <= 9.5:
        recommendation = "GO"
    elif composite_score >= 55.0 and breakeven_months <= 12.0:
        recommendation = "HOLD"
    else:
        recommendation = "NO-GO"

    sku_count = int(
        _clamp(2200 + d90_orders * 18 + profile.avg_order_value_food * 2.2, 1800, 6500)
    )

    confidence = "HIGH"
    if profile.avg_daily_food_orders_zone < 80 or composite_score < 50:
        confidence = "MEDIUM"
    if profile.avg_daily_food_orders_zone < 35:
        confidence = "LOW"

    reasoning = [
        f"Food-order density proxy scores {demand_density_score:.1f}/100 for q-commerce catchment demand.",
        f"AOV and rent imply unit-economics score of {unit_economics_score:.1f}/100.",
        f"Competition pressure is {competition_pressure.lower()} and cannibalization risk is {cannibalization_risk.lower()}.",
        f"Projected D90 orders are {d90_orders:.0f}/day with estimated breakeven in {breakeven_months:.1f} months.",
    ]
    if recommendation == "GO":
        reasoning.append("Recommend launch because breakeven sits inside the 6-12 month dark-store profitability window.")
    elif recommendation == "HOLD":
        reasoning.append("Recommend hold until rent, SKU mix, or catchment density improves enough to protect contribution margin.")
    else:
        reasoning.append("Recommend no-go because demand or saturation risk does not clear the launch threshold.")

    return SiteSelectionDecision(
        pincode=profile.pincode,
        city=profile.city,
        recommendation=recommendation,
        composite_score=round(composite_score, 1),
        demand_density_score=round(demand_density_score, 1),
        unit_economics_score=round(unit_economics_score, 1),
        projected_daily_orders_d0=round(d0_orders, 1),
        projected_daily_orders_d90=round(d90_orders, 1),
        projected_breakeven_months=round(breakeven_months, 1),
        breakeven_ci_lower=round(max(3.0, breakeven_months - ci_width), 1),
        breakeven_ci_upper=round(breakeven_months + ci_width, 1),
        projected_monthly_contribution=round(monthly_contribution, 0),
        cannibalization_risk=cannibalization_risk,
        competition_pressure=competition_pressure,
        ttp_risk_flag=breakeven_months > 12.0,
        recommended_initial_sku_count=sku_count,
        priority_categories=_priority_categories(profile),
        confidence_level=confidence,
        reasoning=reasoning,
    )
