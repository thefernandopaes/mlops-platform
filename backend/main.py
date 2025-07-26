from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, organizations, projects, models, experiments, deployments

app = FastAPI(
    title="MLOps Platform API",
    description="A comprehensive MLOps platform for model lifecycle management",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["experiments"])
app.include_router(deployments.router, prefix="/api/v1/deployments", tags=["deployments"])

@app.get("/")
async def root():
    return {"message": "MLOps Platform API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mlops-platform-api"}