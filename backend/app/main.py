from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, organizations, projects, models, experiments, deployments
from app.core.config import settings

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