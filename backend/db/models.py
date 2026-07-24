from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Date, ForeignKey, CheckConstraint, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class ReservationOutcome(str, enum.Enum):
    SUCCESS = "success"
    LOCK_TIMEOUT = "lock_timeout"
    INSUFFICIENT_STOCK = "insufficient_stock"

class DarkStore(Base):
    __tablename__ = 'dark_stores'
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

class Inventory(Base):
    __tablename__ = 'inventory'
    
    store_id = Column(String(50), ForeignKey('dark_stores.id'), primary_key=True)
    sku_id = Column(String(50), primary_key=True)
    sku_name = Column(String(100), nullable=False)
    qty_available = Column(Integer, nullable=False)
    
    __table_args__ = (
        CheckConstraint('qty_available >= 0', name='check_qty_positive'),
    )

class SalesEvent(Base):
    __tablename__ = 'sales_events'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String(50), ForeignKey('dark_stores.id'), nullable=False)
    sku_id = Column(String(50), nullable=False)
    observed_sales = Column(Float, nullable=False)
    censored = Column(Boolean, default=False, nullable=False)
    oos_time = Column(DateTime(timezone=True), nullable=True)
    event_date = Column(Date, nullable=False)
    hour_bucket = Column(Integer, nullable=False)
    weather_temp = Column(Float, nullable=True)
    weather_rain = Column(Float, nullable=True)
    time_elapsed_sec = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class ForecastResult(Base):
    __tablename__ = 'forecast_results'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String(50), ForeignKey('dark_stores.id'), nullable=False)
    sku_id = Column(String(50), nullable=False)
    horizon_hours = Column(Integer, nullable=False)
    point_forecast = Column(Float, nullable=False)
    ci_lower = Column(Float, nullable=False)
    ci_upper = Column(Float, nullable=False)
    safety_stock_units = Column(Float, nullable=False)
    restock_recommended = Column(Boolean, nullable=False)
    model_version = Column(String(50), nullable=False)

class InventoryReservation(Base):
    __tablename__ = 'inventory_reservations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(100), nullable=False)
    store_id = Column(String(50), ForeignKey('dark_stores.id'), nullable=False)
    sku_id = Column(String(50), nullable=False)
    qty_requested = Column(Integer, nullable=False)
    outcome = Column(Enum(ReservationOutcome), nullable=False)
    latency_ms = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class OutboxEvent(Base):
    __tablename__ = 'outbox_events'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(50), nullable=False)
    payload = Column(String(1000), nullable=False)
    processed = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Restaurant(Base):
    __tablename__ = 'restaurants'
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    cuisine = Column(String(100), nullable=False)
    rating = Column(Float, nullable=False)
    distance = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    slaConfidence = Column(Integer, default=95)
    isAIPick = Column(Boolean, default=False)
    isExclusive = Column(Boolean, default=False)
    image = Column(String(500), nullable=True)


class Coupon(Base):
    __tablename__ = 'coupons'
    
    code = Column(String(50), primary_key=True)
    discount_percentage = Column(Integer, nullable=False)
    min_cart_value = Column(Float, nullable=False)
    active = Column(Boolean, default=True)


class DineoutReservation(Base):
    __tablename__ = 'dineout_reservations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_name = Column(String(100), nullable=False)
    restaurant_id = Column(String(50), nullable=False)
    time_slot = Column(String(50), nullable=False)
    guests = Column(Integer, nullable=False)


class ExpenseLog(Base):
    __tablename__ = 'expense_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(500), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SystemSetting(Base):
    __tablename__ = 'system_settings'
    
    key = Column(String(100), primary_key=True)
    value = Column(String(500), nullable=False)


class PriceHistory(Base):
    __tablename__ = 'price_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(String(100), nullable=False)
    product_name = Column(String(200), nullable=False)
    price_inr = Column(Float, nullable=False)
    source = Column(String(50), default="instamart")
    captured_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    hour_of_day = Column(Integer, nullable=False)


class RefundPrediction(Base):
    __tablename__ = 'refund_predictions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(100), nullable=False)
    complaint_type = Column(String(100), nullable=False)
    predicted_outcome = Column(String(50), nullable=False)
    fraud_probability = Column(Float, nullable=False)
    actual_outcome = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ETAEvent(Base):
    __tablename__ = 'eta_events'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(100), nullable=False)
    raw_eta_min = Column(Integer, nullable=False)
    smoothed_eta_min = Column(Integer, nullable=True)
    is_jitter = Column(Boolean, nullable=True)
    captured_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)



