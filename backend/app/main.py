from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, organizations, projects, models, experiments, deployments
from app.core.config import settings
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
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
    allow_origins=["http://localhost:3000"],  # Frontend URL
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
async def metrics():
    return app.responses.Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Structured logging
logger = logging.getLogger("uvicorn.access")
handler = logging.StreamHandler()
formatter = logging.Formatter(json.dumps({
    "time": "%(asctime)s",
    "level": "%(levelname)s",
    "message": "%(message)s"
}))
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

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