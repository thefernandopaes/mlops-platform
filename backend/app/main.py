from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, organizations, projects, models, experiments, deployments
from app.core.config import settings
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
from sqlalchemy import text
from app.core.database import SessionLocal
import redis as redis_lib
import time
import logging
import json

app = FastAPI(
    title="MLOps Platform API",
    description="A comprehensive MLOps platform for managing machine learning models, experiments, and deployments",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["experiments"])
app.include_router(deployments.router, prefix="/api/v1/deployments", tags=["deployments"])

# Configure logging level from settings
for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
    logging.getLogger(logger_name).setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

# Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5)
)

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    path = request.url.path
    # Normalize path: collapse ids
    norm_path = path
    for seg in path.split('/'):
        if len(seg) > 0 and (seg.count('-') >= 1 or seg.replace('-', '').isalnum()) and len(seg) > 20:
            norm_path = path.replace(seg, ":id")
    REQUEST_COUNT.labels(request.method, norm_path, str(response.status_code)).inc()
    REQUEST_LATENCY.observe(duration)
    return response

@app.get("/metrics")
async def metrics(request: Request):
    # Optional protection via METRICS_TOKEN header when configured
    metrics_token = settings.METRICS_TOKEN.strip() if settings.METRICS_TOKEN else ""
    if metrics_token:
        provided = request.headers.get("x-metrics-token", "")
        if provided != metrics_token:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/ready")
async def readiness_probe():
    # Check DB connectivity
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
    except Exception:
        return {"ready": False, "dependencies": {"database": False, "redis": None}}
    finally:
        try:
            db.close()
        except Exception:
            pass

    # Check Redis connectivity (optional)
    redis_ok = None
    try:
        if settings.REDIS_URL:
            client = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)
            redis_ok = client.ping()
    except Exception:
        redis_ok = False

    return {"ready": True, "dependencies": {"database": True, "redis": redis_ok}}

# Structured logging
root_logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = logging.Formatter(json.dumps({
    "time": "%(asctime)s",
    "level": "%(levelname)s",
    "logger": "%(name)s",
    "message": "%(message)s"
}))
handler.setFormatter(formatter)
if not root_logger.handlers:
    root_logger.addHandler(handler)
root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

@app.get("/")
async def root():
    return {"message": "MLOps Platform API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "MLOps Platform API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)