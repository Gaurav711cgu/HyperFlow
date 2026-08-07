from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List
import datetime

from backend.db.session import get_db
from backend.db.warehouse import DimDate, DimStore, DimSku, FactSalesAgg, WarehouseBase
from backend.db.models import OutboxEvent

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics-dw"])


@router.get("/demand-summary")
def get_demand_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    OLAP Analytics Endpoint: Returns dimensional aggregations from fact_sales_agg.
    - Censoring rate trends by store and SKU
    - Top stockout-prone SKUs
    - Retrain history from Outbox log
    """
    try:
        # Create DB and DW tables if missing
        from backend.db.models import Base
        Base.metadata.create_all(bind=db.get_bind())
        WarehouseBase.metadata.create_all(bind=db.get_bind())

        # 1. Censoring rate by store
        store_stats = db.query(
            DimStore.store_id,
            DimStore.store_name,
            func.avg(FactSalesAgg.censoring_rate).label("avg_censoring_rate"),
            func.sum(FactSalesAgg.total_observed_sales).label("total_sales"),
            func.sum(FactSalesAgg.total_censored_events).label("total_stockout_events")
        ).join(FactSalesAgg, DimStore.store_key == FactSalesAgg.store_key)\
         .group_by(DimStore.store_id, DimStore.store_name)\
         .all()

        store_summary = [{
            "store_id": r.store_id,
            "store_name": r.store_name,
            "avg_censoring_rate": round(float(r.avg_censoring_rate or 0.0), 4),
            "total_observed_sales": round(float(r.total_sales or 0.0), 2),
            "total_stockouts": int(r.total_stockout_events or 0)
        } for r in store_stats]

        # 2. Top OOS-prone SKUs
        sku_stats = db.query(
            DimSku.sku_id,
            DimSku.sku_name,
            DimSku.category,
            func.sum(FactSalesAgg.total_censored_events).label("total_stockouts"),
            func.avg(FactSalesAgg.censoring_rate).label("avg_censoring_rate")
        ).join(FactSalesAgg, DimSku.sku_key == FactSalesAgg.sku_key)\
         .group_by(DimSku.sku_id, DimSku.sku_name, DimSku.category)\
         .order_by(desc("total_stockouts"))\
         .limit(5)\
         .all()

        top_stockout_skus = [{
            "sku_id": r.sku_id,
            "sku_name": r.sku_name,
            "category": r.category,
            "total_stockouts": int(r.total_stockouts or 0),
            "avg_censoring_rate": round(float(r.avg_censoring_rate or 0.0), 4)
        } for r in sku_stats]

        # 3. Model Retrain History from OutboxEvent
        retrain_events = db.query(OutboxEvent)\
            .filter(OutboxEvent.event_type == "model_retrained")\
            .order_by(desc(OutboxEvent.timestamp))\
            .limit(10)\
            .all()

        retrain_history = [{
            "id": ev.id,
            "event_type": ev.event_type,
            "payload": ev.payload,
            "timestamp": ev.timestamp.isoformat() if hasattr(ev.timestamp, 'isoformat') else str(ev.timestamp)
        } for ev in retrain_events]

        return {
            "status": "success",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "data": {
                "store_demand_summary": store_summary,
                "top_stockout_skus": top_stockout_skus,
                "retrain_history": retrain_history,
                "total_fact_rows": db.query(FactSalesAgg).count()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying OLAP analytics warehouse: {str(e)}")
