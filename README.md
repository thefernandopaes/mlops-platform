<div align="center">

# MLOps Platform

Production-ready, multi-tenant MLOps SaaS for model development, deployment, monitoring, and governance.

</div>

---

## Table of Contents
- Overview
- Tech Stack & Architecture
- Repository Structure
- Local Development
- Environment Configuration
- Database & Migrations
- Quality (Lint, Format, Tests)
- Production Deployment (Railway-only)
- Security & Hardening
- Roadmap
- License

## Overview
This project demonstrates a scalable, maintainable MLOps platform. It follows clean layering (API → Services → Schemas → Models), strong typing, and production-grade concerns (observability, container hardening, CI/CD, env-based configuration).

## Tech Stack & Architecture
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis, JWT
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, React Query
- Infra: Docker (multi-stage), Gunicorn + Uvicorn workers, Prometheus client
- Auth: JWT access/refresh tokens, RBAC, multi-tenant (organizations)

## Repository Structure
```
mlops-platform/
  backend/        # FastAPI app (prod-ready Dockerfile, Alembic, services)
  frontend/       # Next.js app (security headers, CI-ready)
  docs/           # Architecture, design, and implementation notes
  .github/        # CI/CD workflows
  docker-compose.yml (dev only)
```

## Local Development
Prerequisites: Docker, Python 3.11+, Node.js 18+

Option A – All services via Docker Compose (dev only):
```bash
docker-compose up -d
```

Option B – Run manually:
```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd ../frontend
npm install
npm run dev
```

## Environment Configuration
The application is configured via environment variables (12-factor). For production, do NOT commit secrets. Provide a `.env` to your process manager/platform.

Backend (required):
- `SECRET_KEY`: strong random secret
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `ALLOWED_HOSTS`: JSON array of allowed origins (e.g. ["https://app.example.com"]) 

Backend (optional):
- `LOG_LEVEL` (default: INFO)
- `METRICS_TOKEN` to protect `/metrics`
- `MINIO_*` if using object storage in the future

Frontend:
- `NEXT_PUBLIC_API_URL`: public URL of the backend (HTTPS)

Tip: include a non-sensitive `backend/.env.example` in the repo to document required vars.

## Database & Migrations
- Alembic migration strategy is enabled. On container start, migrations run automatically via entrypoint.
- Manual commands (local dev):
```bash
cd backend
alembic upgrade head     # apply
alembic revision --autogenerate -m "<message>"  # create
```

## Quality (Lint, Format, Tests)
- Backend: `flake8`, `black --check`, `pytest` (see `.github/workflows/backend-ci.yml`)
- Frontend: `npm run type-check`, `npm run lint`, `npm run build` (see `.github/workflows/frontend-ci.yml`)

## Production Deployment (Railway-only)
This repository is configured to deploy both services on Railway (recommended for portfolio/demo):

1) Provision managed plugins on Railway:
- PostgreSQL → copy `DATABASE_URL`
- Redis → copy `REDIS_URL`

2) Backend service (FastAPI):
- Deploy from monorepo path `backend/` (Dockerfile provided)
- Set env vars: `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `ALLOWED_HOSTS` (JSON), optional `LOG_LEVEL`,`METRICS_TOKEN`
- Health endpoints: `/health` (liveness), `/ready` (readiness)

3) Frontend service (Next.js):
- Deploy from monorepo path `frontend/`
- Build: `npm ci && npm run build`, Start: `npm run start`
- Set env var: `NEXT_PUBLIC_API_URL=https://<your-backend>.up.railway.app`

4) Domains & TLS:
- Assign subdomains (e.g., `app.example.com` → frontend, `api.example.com` → backend)
- Update `ALLOWED_HOSTS` and `NEXT_PUBLIC_API_URL` accordingly

## Security & Hardening
- Backend container hardened: non-root user, Gunicorn + Uvicorn workers, healthcheck
- JSON structured logs, configurable `LOG_LEVEL`
- CORS restricted by `ALLOWED_HOSTS`, `/metrics` protected via `METRICS_TOKEN`
- Consider `TrustedHostMiddleware`/edge proxy for additional headers and rate limiting

## Roadmap
- Model Registry (uploads, versions, metadata)
- Experiment Tracking (MLflow integration)
- Deployments & Monitoring (autoscaling, alerts)
- Demo mode (ephemeral users, seeded tenant, periodic reset)

## License
This project is licensed under the MIT License. See `LICENSE` for details.


