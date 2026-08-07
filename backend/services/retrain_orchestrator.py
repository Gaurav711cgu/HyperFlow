import datetime
import json
import numpy as np
import pandas as pd

from backend.core.logger import get_logger
from backend.db.models import SalesEvent, OutboxEvent
from backend.ml.censored_demand import CensoredDemandForecaster

logger = get_logger(__name__)

try:
    import mlflow
    import mlflow.sklearn
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False


class RetrainOrchestrator:
    """
    Triggered by PSI loop after 3 consecutive RED readings.
    Fetches fresh SalesEvents, retrains CensoredDemandForecaster,
    registers new version in MLflow Model Registry, logs OutboxEvent.
    """
    MODEL_NAME = "hyperflow-demand-forecaster"
    MIN_SAMPLES = 50  # Lower bound threshold for dev/test execution

    def __init__(self, db_session_factory, mlflow_uri: str = "sqlite:///mlflow.db"):
        self.db_factory = db_session_factory
        self.mlflow_uri = mlflow_uri
        if HAS_MLFLOW:
            try:
                mlflow.set_tracking_uri(self.mlflow_uri)
                mlflow.set_experiment("hyperflow-demand-drift-retrain")
            except Exception as e:
                logger.warning(f"[RetrainOrchestrator] MLflow URI setup warning: {e}")

    async def trigger(self, psi_score: float, drift_features: dict) -> dict:
        if not self.db_factory:
            return {"status": "skipped", "reason": "No db_session_factory provided"}

        db = self.db_factory()
        try:
            events = db.query(SalesEvent)\
                .order_by(SalesEvent.created_at.desc())\
                .limit(2000).all()

            if len(events) < self.MIN_SAMPLES:
                logger.info(f"[RetrainOrchestrator] Retrain skipped: {len(events)} samples < {self.MIN_SAMPLES}")
                return {"status": "skipped", "reason": f"only {len(events)} samples < {self.MIN_SAMPLES}"}

            X, y_obs, censored = self._build_features(events)

            new_version = f"v{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}"
            run_id = None

            if HAS_MLFLOW:
                try:
                    with mlflow.start_run(run_name=f"retrain_psi_{psi_score:.4f}") as run:
                        run_id = run.info.run_id
                        model = CensoredDemandForecaster()
                        model.fit(X, y_obs, censored)
                        mlflow.log_params({
                            "psi_trigger_score": psi_score,
                            "n_samples": len(events),
                            "model_name": self.MODEL_NAME
                        })
                        
                        try:
                            model_uri = f"runs:/{run_id}/model"
                            mlflow.register_model(model_uri, self.MODEL_NAME)
                            latest_versions = mlflow.MlflowClient().get_latest_versions(
                                self.MODEL_NAME, stages=["None"]
                            )
                            if latest_versions:
                                new_version = f"v{latest_versions[0].version}"
                        except Exception as reg_err:
                            logger.warning(f"[RetrainOrchestrator] Model registration fallback: {reg_err}")
                except Exception as mlf_err:
                    logger.warning(f"[RetrainOrchestrator] MLflow tracking warning: {mlf_err}")
                    model = CensoredDemandForecaster()
                    model.fit(X, y_obs, censored)
            else:
                model = CensoredDemandForecaster()
                model.fit(X, y_obs, censored)

            # Audit trail via OutboxEvent
            outbox_payload = {
                "trigger": "psi_red_3x",
                "psi_score": float(psi_score),
                "drift_features": drift_features,
                "new_version": new_version,
                "run_id": run_id,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "training_samples": len(events)
            }

            outbox_event = OutboxEvent(
                event_type="model_retrained",
                payload=json.dumps(outbox_payload),
                processed=False
            )
            db.add(outbox_event)
            db.commit()

            logger.info(f"[RetrainOrchestrator] Retraining completed. New version: {new_version}, samples: {len(events)}")
            return {"status": "success", "version": new_version, "samples": len(events), "run_id": run_id}

        except Exception as e:
            logger.error(f"[RetrainOrchestrator] Error during retraining execution: {e}")
            db.rollback()
            return {"status": "error", "error": str(e)}
        finally:
            db.close()

    def _build_features(self, events):
        """Convert SalesEvent ORM rows -> numpy feature arrays."""
        data = []
        for e in events:
            data.append({
                "weather_temp": float(getattr(e, 'weather_temp', 0.0) or 0.0),
                "weather_rain": float(getattr(e, 'weather_rain', 0.0) or 0.0),
                "time_elapsed_sec": float(getattr(e, 'time_elapsed_sec', 0.0) or 0.0),
                "hour_bucket": float(getattr(e, 'hour_bucket', 12) or 12),
                "observed_sales": float(getattr(e, 'observed_sales', 0.0) or 0.0),
                "censored": bool(getattr(e, 'censored', False))
            })
        df = pd.DataFrame(data)

        feature_cols = ["weather_temp", "weather_rain", "time_elapsed_sec", "hour_bucket"]
        X = df[feature_cols].values
        y_obs = df["observed_sales"].values
        censored = df["censored"].values.astype(bool)
        return X, y_obs, censored
