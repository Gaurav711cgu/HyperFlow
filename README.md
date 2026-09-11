# HyperFlow 3.0: Hyperlocal Commerce Intelligence Platform

Production-grade ML strategy engine built for Instamart dark-store expansion, quick-commerce demand forecasting, and real-time dispatch stability. It integrates directly with Swiggy MCP APIs. Powered by FastAPI, React, Gemini 2.0 Flash, Tobit demand modeling, and Cox PH breakeven analysis.

> **"Not a Swiggy clone. A platform that solves the problems Swiggy's own engineering blog says are unsolved."**

## Key Features
- **AI Commerce Agent:** LangGraph multi-agent chat integrating Swiggy Food, Instamart, and Dineout MCP tools.
- **Dark Store Intel:** Tobit-LGBM pipeline for stockout-censored demand forecasting and Cox Proportional Hazards for expansion profitability scoring.
- **Route Intelligence & Dispatch:** Real-time optimization with ETA jitter suppression.
- **ML Guardrails:** LLM semantic fraud detection, real-time feature drift (PSI) monitoring, and safe API clipping.
- **Zero-Trust Auth:** Enterprise-grade asymmetric RS256 JWTs with JWKS discovery and Redis-backed JTI revocation blacklists.

## Tech Stack

- **Backend Framework:** FastAPI (Python 3.10+)
- **Frontend:** React 19 + Vite (Framer Motion, Tailwind CSS / UI Components)
- **Database:** PostgreSQL 15, SQLAlchemy 2.0
- **Cache/Locks:** Redis 7 (In-memory failover supported)
- **Machine Learning:** Scikit-learn, LightGBM, SciPy, Pandas
- **AI/LLM:** LangGraph, Google Gemini 2.0 Flash SDK
- **Security:** RS256 JWT via Cryptography, PyJWT
- **Deployment:** Docker (multi-stage), Docker Compose, Vercel (frontend)

---

## Prerequisites

- **Python:** 3.10 or higher
- **Node.js:** 20 or higher (for frontend)
- **Docker & Docker Compose:** (Optional, but recommended for Redis/Postgres)
- **Gemini API Key:** from Google AI Studio (Free Tier)
- **Swiggy MCP Token:** `SWIGGY_ACCESS_TOKEN` from Swiggy Builders Club OAuth flow

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Gaurav711cgu/HyperFlow.git
cd HyperFlow
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Configure your `.env` variables:

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `GEMINI_API_KEY` | Your Google Gemini API Key | `AIzaSy...` |
| `SWIGGY_ACCESS_TOKEN` | OAuth token for Swiggy MCP | `ey...` |
| `POSTGRES_URL` | PostgreSQL connection string | `postgresql://hyperflow_admin:hyperflow_secure_pass@localhost:5432/hyperflow_db` |
| `REDIS_URL` | Redis connection for lock manager | `redis://localhost:6379` |
| `PORT` | API Server port | `7860` |

### 3. Start Database & Redis (Docker)
Start the required external services using Docker Compose:
```bash
docker-compose up -d postgres redis
```

### 4. Install Backend Dependencies
It's recommended to use a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Install Frontend Dependencies
```bash
cd frontend
npm install  # or yarn install / pnpm install
cd ..
```

### 6. Run the Application

**Terminal 1: FastAPI Backend Server**
```bash
# In the root directory with virtual environment activated
uvicorn backend.api.main:app --reload --port 7860
```

**Terminal 2: React Frontend (Vite)**
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. API docs are available at [http://localhost:7860/docs](http://localhost:7860/docs).

---

## Architecture

### Directory Structure
```
├── backend/
│   ├── api/
│   │   ├── deps/          # FastAPI dependencies (auth guards)
│   │   ├── routers/       # REST API endpoints (v1, v2, auth)
│   │   └── main.py        # FastAPI application entrypoint
│   ├── core/              # Global state and security
│   ├── db/                # SQLAlchemy models and warehouse
│   ├── ml/                # Core ML models (Tobit, Cox PH, PSI)
│   └── services/          # Business logic (LangGraph, Auth, ETL)
├── frontend/
│   ├── src/               # React application source code
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite builder configuration
├── ml_core/               # Shared ML algorithms and safeguards
├── tests/                 # Comprehensive pytest suite
├── scripts/               # Maintenance and seeding scripts
├── Dockerfile             # Multi-stage container build
├── docker-compose.yml     # Local services orchestration
└── requirements.txt       # Python dependencies
```

### Request Lifecycle
1. Request hits FastAPI router (`backend/api/routers/`).
2. Authentication middleware (`get_current_user`) verifies RS256 JWT using JWKS public keys.
3. ML endpoints (`/forecast/demand`, `/profitability/score`) offload Scipy/LightGBM inference to an `asyncio.to_thread` pool to prevent blocking the async event loop.
4. LangGraph agent (`/api/agent/chat`) processes LLM queries via Gemini, applying a strict `history[-5:]` context-pruning strategy to minimize token bloat.
5. ETL batch tasks execute natively on Postgres via SQLAlchemy `func.sum()` groupings for memory-safe OLAP aggregations.

### Key Components

**Zero-Trust Authentication (`backend/services/token_manager.py`)**
- Dynamically generates a 2048-bit RSA Private/Public keypair on startup.
- Serves the Public Key via a standard `/.well-known/jwks.json` endpoint for decoupled downstream verification.
- Enforces O(1) JTI revocation lookups in Redis to immediately ban compromised Refresh Tokens.

**Demand Forecasting & Safeguards (`backend/ml/`)**
- **Tobit-LGBM:** Handles right-censored quick-commerce demand where true demand exceeds historical stockouts.
- **Cox Proportional Hazards:** Calculates dark store breakeven timelines (Survival Probabilities).
- **PSI Drift Monitor:** Tracks Kullback-Leibler divergence on incoming ML feature distributions and falls back to heuristics if drift exceeds 0.2 threshold.

---

## Testing

The project uses `pytest` for the backend testing suite, ensuring all ML logic, token revocation, and safe thread-pooling is completely covered.

```bash
# Run all tests
PYTHONPATH=. python3 -m pytest tests/ -v

# Run only authentication tests
PYTHONPATH=. python3 -m pytest tests/test_dual_token_auth.py -v
```

---

## Deployment

### Docker (Production Image)
The project includes a multi-stage `Dockerfile` creating a hardened, non-root runner environment.

```bash
# Build the production image
docker build -t hyperflow-api .

# Run the container (Ensure .env is provided or passed as -e)
docker run -p 7860:7860 --env-file .env hyperflow-api
```

### Docker Compose
For a full localized production deployment including Postgres and Redis:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (Frontend)
The React application is pre-configured for Vercel deployment. Connect the GitHub repository to Vercel and set the Build command to `npm run build` targeting the `frontend` root directory.

### Render / Hugging Face Spaces (Backend)
The FastAPI backend runs securely on platforms like Hugging Face Spaces or Render. 
1. Expose port `7860`.
2. Provide `GEMINI_API_KEY` and `SWIGGY_ACCESS_TOKEN` as environment secrets.

---

## Troubleshooting

### JWT Auth / Login Failures
**Error:** `401 Unauthorized` or `Signature verification failed`
**Solution:** Check that the application wasn't restarted recently. Because the RSA keypair is generated *in-memory* on startup (for demo purposes), old tokens instantly invalidate when the server restarts. Log in again to get a new token signed by the new key.

### Redis Lock Failures
**Error:** Exceptions from `RedisLockManager`
**Solution:** The system gracefully falls back to an in-memory `threading.Lock()` if Redis is unreachable. However, ensure `REDIS_URL` is correct or run `docker-compose up -d redis` for clustered environments.

### Asyncio Blocking Warnings in Server Logs
**Error:** `Executing <Task...> took 0.XXX seconds`
**Solution:** This implies an ML task is blocking the async event loop. Ensure all heavy endpoints (like `/profitability/score`) correctly utilize `await asyncio.to_thread(...)`. This was patched in recent L5 audits.
