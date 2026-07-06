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

