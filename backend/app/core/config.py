from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MLOps Platform"
    DEBUG: bool = False
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "postgresql://mlops_user:mlops_password@localhost:5432/mlops_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Object Storage (MinIO/S3)
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "mlops-artifacts"
    MINIO_SECURE: bool = False
    
    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    
    # Email (for notifications)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()