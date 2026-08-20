# Multi-stage build for lean, secure production image
FROM python:3.10-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final minimal runner stage
FROM python:3.10-slim AS runner

WORKDIR /app

# Create non-root system user
RUN useradd -m -u 1000 appuser

# Copy installed dependencies from builder
COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser . .

ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

USER appuser

EXPOSE 7860

CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "7860"]
