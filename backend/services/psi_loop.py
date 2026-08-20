import asyncio
import random
import datetime
import pandas as pd
from dataclasses import dataclass
from typing import Optional, Any, Dict

from backend.core.logger import get_logger

logger = get_logger(__name__)

@dataclass 
class LoopState:
    iteration: int = 0
    last_psi: float = 0.0
    status: str = "GREEN"
    consecutive_amber: int = 0
    stop_requested: bool = False

@dataclass
class PSIComputeResult:
    score: float
    feature_drifts: Dict[str, Any]
    data_source: str

class PSIMonitorLoop:
    """
    Self-running PSI drift monitoring loop.
    Loop design:
        Trigger:  every 60 seconds
        Generator: compute PSI on latest 200 sales events vs. training reference
        Verifier:  PSI < 0.10 → GREEN, < 0.20 → AMBER, >= 0.20 → RED + retrain signal
        Stop rule: stop_requested flag or 3 consecutive RED readings
    """
    INTERVAL_SECONDS = 60
    MAX_CONSECUTIVE_RED = 3

    def __init__(self, db_session_factory, safeguards, retrain_orchestrator=None, event_bus=None):
        self.db_factory = db_session_factory
        self.safeguards = safeguards
        self.retrain_orchestrator = retrain_orchestrator
        self.event_bus = event_bus
        self.state = LoopState()

    async def run(self):
        logger.info("[PSI Loop] Starting autonomous PSI monitoring loop...")
        while not self.state.stop_requested:
            try:
                # Generator: Compute PSI
                psi_result = await self._compute_psi()
                
                # Verifier: Determine status
                status = self._verify(psi_result)
                self.state.status = status
                self.state.last_psi = psi_result.score
                
                # Side effect & Stop rule evaluation
                if status == "RED":
                    self.state.consecutive_amber += 1
                    logger.warning(f"[PSI Loop] High drift detected (PSI={psi_result.score:.4f}, RED status #{self.state.consecutive_amber})")
                    if self.state.consecutive_amber >= self.MAX_CONSECUTIVE_RED:
                        logger.warning("[PSI Loop] Triggering retrain execution due to 3 consecutive RED readings.")
                        if self.retrain_orchestrator:
                            retrain_res = await self.retrain_orchestrator.trigger(
                                psi_score=psi_result.score,
                                drift_features=psi_result.feature_drifts
                            )
                            logger.info(f"[PSI Loop] Autonomous retrain result: {retrain_res}")
                        elif self.event_bus:
                            await self.event_bus.publish("retrain_requested", {
                                "reason": "3 consecutive RED PSI readings",
                                "psi": psi_result.score,
                            })
                        self.state.consecutive_amber = 0
                else:
                    self.state.consecutive_amber = 0

                self.state.iteration += 1
            except Exception as e:
                logger.error(f"[PSI Loop] Error in monitor loop: {e}")

            await asyncio.sleep(self.INTERVAL_SECONDS)

    async def _compute_psi(self) -> PSIComputeResult:
        if not self.db_factory:
            return PSIComputeResult(score=0.0, feature_drifts={}, data_source="uninitialized")

        db = self.db_factory()
        try:
            from backend.db.models import SalesEvent
            sales_events = db.query(SalesEvent)\
                .filter(SalesEvent.weather_temp.isnot(None))\
                .order_by(SalesEvent.created_at.desc())\
                .limit(200)\
                .all()
            
            if len(sales_events) < 30:
                logger.info(f"[PSI Loop] Insufficient empirical events for drift check ({len(sales_events)}/30 records). Skipping drift computation.")
                return PSIComputeResult(
                    score=0.0,
                    feature_drifts={},
                    data_source="insufficient_real_events"
                )

            prod_df = pd.DataFrame([{
                'weather_temp': e.weather_temp,
                'weather_rain': e.weather_rain,
                'time_elapsed_sec': e.time_elapsed_sec
            } for e in sales_events])

            drift_metrics = self.safeguards.calculate_drift_metrics(prod_df)
            psi_values = [v.get("psi", 0.0) for v in drift_metrics.values() if isinstance(v, dict) and "psi" in v]
            overall_psi = float(max(psi_values)) if psi_values else 0.0
            
            return PSIComputeResult(score=overall_psi, feature_drifts=drift_metrics, data_source="postgresql_sales_events")
        finally:
            db.close()

    def _verify(self, result: PSIComputeResult) -> str:
        if result.data_source == "insufficient_real_events" or result.score == 0.0:
            return "GREEN"
        if result.score < 0.10:
            return "GREEN"
        elif result.score < 0.20:
            return "AMBER"
        else:
            return "RED"
