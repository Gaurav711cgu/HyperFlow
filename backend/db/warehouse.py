from sqlalchemy import Column, String, Float, Integer, Boolean, Date, DateTime, BigInteger, ForeignKey, Index
from sqlalchemy.orm import declarative_base

WarehouseBase = declarative_base()

class DimDate(WarehouseBase):
    __tablename__ = 'dim_date'
    
    date_key = Column(Integer, primary_key=True)  # YYYYMMDDHH format
    calendar_date = Column(Date, nullable=False, index=True)
    hour_bucket = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Mon, 6=Sun
    is_weekend = Column(Boolean, nullable=False)
    month = Column(Integer, nullable=False)
    quarter = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

class DimStore(WarehouseBase):
    __tablename__ = 'dim_store'
    
    store_key = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String(50), nullable=False, unique=True)
    store_name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

class DimSku(WarehouseBase):
    __tablename__ = 'dim_sku'
    
    sku_key = Column(Integer, primary_key=True, autoincrement=True)
    sku_id = Column(String(50), nullable=False, unique=True)
    sku_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=True)  # e.g. dairy, produce, bakery
    is_perishable = Column(Boolean, default=True)

class FactSalesAgg(WarehouseBase):
    __tablename__ = 'fact_sales_agg'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    date_key = Column(Integer, ForeignKey('dim_date.date_key'), nullable=False, index=True)
    store_key = Column(Integer, ForeignKey('dim_store.store_key'), nullable=False, index=True)
    sku_key = Column(Integer, ForeignKey('dim_sku.sku_key'), nullable=False, index=True)

    # Measures
    total_observed_sales = Column(Float, nullable=False)
    total_censored_events = Column(Integer, nullable=False, default=0)
    censoring_rate = Column(Float, nullable=False, default=0.0)
    avg_weather_temp = Column(Float, nullable=True)
    avg_weather_rain = Column(Float, nullable=True)
    psi_score_at_load = Column(Float, nullable=True)
    active_model_version = Column(String(50), nullable=True)
    etl_loaded_at = Column(DateTime, nullable=False)

    __table_args__ = (
        Index('idx_fact_store_sku_date', 'store_key', 'sku_key', 'date_key', unique=False),
    )
