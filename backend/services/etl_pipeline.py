import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.logger import get_logger
from backend.db.models import SalesEvent, DarkStore, Inventory
from backend.db.warehouse import DimDate, DimStore, DimSku, FactSalesAgg, WarehouseBase

logger = get_logger(__name__)


class HyperFlowETL:
    """
    ETL Pipeline: SalesEvent (operational OLTP) -> fact_sales_agg (analytical OLAP)
    Idempotent incremental load executing every hour or on-demand.
    """

    def __init__(self, op_session_factory, dw_session_factory=None):
        self.op_factory = op_session_factory
        self.dw_factory = dw_session_factory or op_session_factory

    def run_incremental(self, since: Optional[datetime.datetime] = None) -> Dict[str, Any]:
        """Loads events since last watermark into star schema idempotently."""
        op_db = self.op_factory()
        dw_db = self.dw_factory()

        try:
            # Ensure warehouse tables exist
            WarehouseBase.metadata.create_all(bind=dw_db.get_bind())

            if since is None:
                last_load = dw_db.query(func.max(FactSalesAgg.etl_loaded_at)).scalar()
                since = last_load or datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc)

            # Fetch operational sales events
            events = op_db.query(SalesEvent)\
                .filter(SalesEvent.created_at >= since)\
                .order_by(SalesEvent.created_at.asc())\
                .all()

            if not events:
                logger.info(f"[HyperFlowETL] No new events since {since}")
                return {"loaded": 0, "watermark": since.isoformat() if hasattr(since, 'isoformat') else str(since)}

            # Upsert Dimension Tables
            self._upsert_dimensions(dw_db, events, op_db)

            # Build and load fact records
            loaded_count = self._load_facts(dw_db, events)
            dw_db.commit()

            watermark = datetime.datetime.now(datetime.timezone.utc).isoformat()
            logger.info(f"[HyperFlowETL] Incremental ETL loaded {loaded_count} aggregated fact records.")
            return {"loaded": loaded_count, "watermark": watermark}

        except Exception as e:
            logger.error(f"[HyperFlowETL] Error during ETL execution: {e}")
            dw_db.rollback()
            raise e
        finally:
            op_db.close()
            dw_db.close()

    def _upsert_dimensions(self, dw_db: Session, events: List[SalesEvent], op_db: Session):
        """Ensure all date, store, and SKU dimensions exist."""
        # 1. DimStore
        store_ids = set(e.store_id for e in events if e.store_id)
        for s_id in store_ids:
            existing = dw_db.query(DimStore).filter(DimStore.store_id == s_id).first()
            if not existing:
                op_store = op_db.query(DarkStore).filter(DarkStore.id == s_id).first()
                dw_db.add(DimStore(
                    store_id=s_id,
                    store_name=op_store.name if op_store else f"Store-{s_id}",
                    city=op_store.city if op_store else "Bengaluru",
                    lat=op_store.lat if op_store else 12.9716,
                    lng=op_store.lng if op_store else 77.5946
                ))

        # 2. DimSku
        sku_ids = set(e.sku_id for e in events if e.sku_id)
        for sku_id in sku_ids:
            existing = dw_db.query(DimSku).filter(DimSku.sku_id == sku_id).first()
            if not existing:
                op_inv = op_db.query(Inventory).filter(Inventory.sku_id == sku_id).first()
                dw_db.add(DimSku(
                    sku_id=sku_id,
                    sku_name=op_inv.sku_name if op_inv else f"SKU-{sku_id}",
                    category="groceries",
                    is_perishable=True
                ))

        # 3. DimDate
        for e in events:
            date_obj = e.event_date if hasattr(e, 'event_date') and e.event_date else e.created_at.date()
            hour = int(getattr(e, 'hour_bucket', 12) or 12)
            date_key = int(f"{date_obj.strftime('%Y%m%d')}{hour:02d}")

            existing_date = dw_db.query(DimDate).filter(DimDate.date_key == date_key).first()
            if not existing_date:
                dw_db.add(DimDate(
                    date_key=date_key,
                    calendar_date=date_obj,
                    hour_bucket=hour,
                    day_of_week=date_obj.weekday(),
                    is_weekend=date_obj.weekday() >= 5,
                    month=date_obj.month,
                    quarter=(date_obj.month - 1) // 3 + 1,
                    year=date_obj.year
                ))
        dw_db.flush()

    def _load_facts(self, dw_db: Session, events: List[SalesEvent]) -> int:
        """Aggregates events by (date_key, store_key, sku_key) and upserts FactSalesAgg."""
        store_map = {s.store_id: s.store_key for s in dw_db.query(DimStore).all()}
        sku_map = {s.sku_id: s.sku_key for s in dw_db.query(DimSku).all()}

        # Group events by (date_key, store_key, sku_key)
        groups = {}
        for e in events:
            date_obj = e.event_date if hasattr(e, 'event_date') and e.event_date else e.created_at.date()
            hour = int(getattr(e, 'hour_bucket', 12) or 12)
            date_key = int(f"{date_obj.strftime('%Y%m%d')}{hour:02d}")

            s_key = store_map.get(e.store_id)
            sk_key = sku_map.get(e.sku_id)

            if not s_key or not sk_key:
                continue

            group_key = (date_key, s_key, sk_key)
            if group_key not in groups:
                groups[group_key] = []
            groups[group_key].append(e)

        now = datetime.datetime.now(datetime.timezone.utc)
        loaded_count = 0

        for (d_key, st_key, sk_key), grp_events in groups.items():
            obs_sales = sum(float(ev.observed_sales or 0.0) for ev in grp_events)
            cens_events = sum(1 for ev in grp_events if bool(ev.censored))
            c_rate = float(cens_events / len(grp_events))

            temps = [ev.weather_temp for ev in grp_events if ev.weather_temp is not None]
            rains = [ev.weather_rain for ev in grp_events if ev.weather_rain is not None]

            avg_temp = float(sum(temps) / len(temps)) if temps else None
            avg_rain = float(sum(rains) / len(rains)) if rains else None

            existing_fact = dw_db.query(FactSalesAgg).filter(
                FactSalesAgg.date_key == d_key,
                FactSalesAgg.store_key == st_key,
                FactSalesAgg.sku_key == sk_key
            ).first()

            if existing_fact:
                existing_fact.total_observed_sales = obs_sales
                existing_fact.total_censored_events = cens_events
                existing_fact.censoring_rate = c_rate
                existing_fact.avg_weather_temp = avg_temp
                existing_fact.avg_weather_rain = avg_rain
                existing_fact.etl_loaded_at = now
            else:
                dw_db.add(FactSalesAgg(
                    date_key=d_key,
                    store_key=st_key,
                    sku_key=sk_key,
                    total_observed_sales=obs_sales,
                    total_censored_events=cens_events,
                    censoring_rate=c_rate,
                    avg_weather_temp=avg_temp,
                    avg_weather_rain=avg_rain,
                    psi_score_at_load=0.042,
                    active_model_version="v2.4.0",
                    etl_loaded_at=now
                ))
            loaded_count += 1

        return loaded_count
