import logging
from contextlib import contextmanager

logger = logging.getLogger("hyperflow.telemetry")

class DummySpan:
    def set_attribute(self, key: str, value: Any) -> None:
        pass
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

class DummyTracer:
    def start_as_current_span(self, name: str):
        return DummySpan()

try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

    def setup_telemetry(service_name: str = "hyperflow-ml"):
        try:
            provider = TracerProvider()
            exporter = OTLPSpanExporter(endpoint="http://localhost:4318/v1/traces")
            provider.add_span_processor(BatchSpanProcessor(exporter))
            trace.set_tracer_provider(provider)
            logger.info("OpenTelemetry exporter configured for endpoint http://localhost:4318/v1/traces")
        except Exception as e:
            logger.warning(f"OpenTelemetry initialization notice: {e}")

    tracer = trace.get_tracer("hyperflow")
except Exception:
    def setup_telemetry(service_name: str = "hyperflow-ml"):
        logger.info("Telemetry provider initialized in fallback mode.")
    tracer = DummyTracer()
