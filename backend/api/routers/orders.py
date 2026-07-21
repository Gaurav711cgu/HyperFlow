import os
import time
import random
import datetime
import json
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from backend.db.session import get_db
from backend.db.models import Inventory, InventoryReservation, ReservationOutcome, OutboxEvent
from backend.core.logger import get_logger
from backend.core.state import lock_manager, GLOBAL_STATS

logger = get_logger(__name__)

router = APIRouter()

class ReserveRequest(BaseModel):
    order_id: str
    store_id: str
    sku_id: str
    qty_requested: int

@router.post("/reserve")
def reserve_inventory(req: ReserveRequest, db: Session = Depends(get_db)):
    t0 = time.time()
    lock_key = f"lock:inv:{req.store_id}:{req.sku_id}"
    owner_id = f"worker_{os.getpid()}_{random.randint(1000, 9999)}"
    lock_backend = os.getenv("LOCK_BACKEND", "redis").lower()
    
    # 1. Acquire Lock
    acquired = False
    if lock_backend == "postgres" and db:
        # PostgreSQL SELECT FOR UPDATE locking with NOWAIT to fail fast
        try:
            inventory_row = db.query(Inventory).filter(
                Inventory.store_id == req.store_id,
                Inventory.sku_id == req.sku_id
            ).with_for_update(nowait=True).first()
            acquired = True
        except OperationalError:
            # If the row is locked by another transaction, fail fast immediately to preserve DB pool
            latency = (time.time() - t0) * 1000
            res_entry = InventoryReservation(
                order_id=req.order_id, store_id=req.store_id, sku_id=req.sku_id,
                qty_requested=req.qty_requested, outcome=ReservationOutcome.LOCK_TIMEOUT, latency_ms=latency
            )
            db.add(res_entry)
            db.commit()
            raise HTTPException(status_code=409, detail="Database row is locked by another active checkout transaction (NOWAIT lock bypass).")
        except Exception as e:
            logger.error(f"PostgreSQL SELECT FOR UPDATE failed: {e}")
            raise HTTPException(status_code=500, detail="Database lock acquisition timeout.")
    else:
        # Default to Redis lock manager
        acquired = lock_manager.acquire_lock(lock_key, owner_id, ttl_ms=1000)

    if not acquired:
        # Log timeout reservation entry
        GLOBAL_STATS["reservations_total"] += 1
        latency = (time.time() - t0) * 1000
        res_entry = InventoryReservation(
            order_id=req.order_id, store_id=req.store_id, sku_id=req.sku_id,
            qty_requested=req.qty_requested, outcome=ReservationOutcome.LOCK_TIMEOUT, latency_ms=latency
        )
        db.add(res_entry)
        db.commit()
        raise HTTPException(status_code=409, detail="Lock acquisition timeout. Another transaction is active.")

    # 2. Check and Update Inventory
    try:
        latency = (time.time() - t0) * 1000
        # Postgres flow
        if lock_backend != "postgres":
            inventory_row = db.query(Inventory).filter(
                Inventory.store_id == req.store_id,
                Inventory.sku_id == req.sku_id
            ).first()
            
        if not inventory_row:
            raise HTTPException(status_code=404, detail="SKU inventory not found.")
            
        if inventory_row.qty_available < req.qty_requested:
            GLOBAL_STATS["reservations_total"] += 1
            res_entry = InventoryReservation(
                order_id=req.order_id, store_id=req.store_id, sku_id=req.sku_id,
                qty_requested=req.qty_requested, outcome=ReservationOutcome.INSUFFICIENT_STOCK, latency_ms=latency
            )
            db.add(res_entry)
            db.commit()
            raise HTTPException(status_code=400, detail="Insufficient stock available.")
            
        # Perform decrement
        inventory_row.qty_available -= req.qty_requested
        GLOBAL_STATS["reservations_total"] += 1
        GLOBAL_STATS["reservations_success"] += 1
        res_entry = InventoryReservation(
            order_id=req.order_id, store_id=req.store_id, sku_id=req.sku_id,
            qty_requested=req.qty_requested, outcome=ReservationOutcome.SUCCESS, latency_ms=latency
        )
        db.add(res_entry)
        
        # --- Transactional Outbox Pattern ---
        # Construct event payload and write to outbox within the same database transaction
        event_payload = {
            "order_id": req.order_id,
            "store_id": req.store_id,
            "sku_id": req.sku_id,
            "qty_requested": req.qty_requested,
            "timestamp": datetime.datetime.now().isoformat()
        }
        outbox_entry = OutboxEvent(
            event_type="inventory_reserved",
            payload=json.dumps(event_payload)
        )
        db.add(outbox_entry)
        db.commit()
        logger.info(f"TRANSACTIONAL OUTBOX: Recorded 'inventory_reserved' outbox event for order {req.order_id}")

        return {"status": "success", "message": "Inventory reserved.", "latency_ms": round(latency, 2)}
    finally:
        # 3. Release Lock if using Redis
        if lock_backend != "postgres":
            lock_manager.release_lock(lock_key, owner_id)
