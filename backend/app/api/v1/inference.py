"""
Model Inference API endpoints.
Provides REST API for model predictions with validation, caching, and rate limiting.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import select
import numpy as np
import pandas as pd
import json
import time
import uuid
from datetime import datetime, timedelta
import asyncio
import redis.asyncio as redis

from app.core.deps import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.deployment import Deployment
from app.models.model_monitoring import ModelMonitoring
from app.models.api_key import APIKey
from app.schemas.inference import (
    InferenceRequest,
    BatchInferenceRequest,
    InferenceResponse,
    BatchInferenceResponse,
    ModelSchemaResponse,
    HealthResponse
)
from app.services.inference_service import InferenceService
from app.services.model_loader import ModelLoader
from app.core.rate_limiter import RateLimiter

router = APIRouter()
security = HTTPBearer()

# Initialize services
inference_service = InferenceService()
model_loader = ModelLoader()
rate_limiter = RateLimiter()

# Redis client for caching
redis_client = redis.from_url(settings.REDIS_URL)


@router.post("/inference/{deployment_name}", response_model=InferenceResponse)
async def predict(
    deployment_name: str,
    request: InferenceRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    api_key: Optional[str] = Depends(security)
):
    """
    Make predictions using a deployed model.
    
    Args:
        deployment_name: Name of the deployment
        request: Inference request with input data
        background_tasks: For async logging
        db: Database session
        api_key: Optional API key for authentication
    
    Returns:
        InferenceResponse with predictions and metadata
    """
    start_time = time.time()
    
    # Get deployment info
    deployment = await get_deployment_by_name(db, deployment_name)
    if not deployment or deployment.status != 'active':
        raise HTTPException(status_code=404, detail="Deployment not found or inactive")
    
    # Rate limiting check
    client_id = api_key or "anonymous"
    if not await rate_limiter.check_rate_limit(client_id, deployment.id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Check cache for identical requests
    cache_key = f"inference:{deployment.id}:{hash(json.dumps(request.instances, sort_keys=True))}"
    cached_result = await redis_client.get(cache_key)
    
    if cached_result and request.use_cache:
        cached_response = json.loads(cached_result)
        cached_response["cached"] = True
        return InferenceResponse(**cached_response)
    
    try:
        # Load model if not already loaded
        model = await model_loader.get_model(deployment.model_version_id)
        
        # Validate input schema
        validated_instances = await inference_service.validate_input(
            request.instances, 
            deployment.model_version.model_schema
        )
        
        # Make predictions
        predictions = await inference_service.predict(
            model=model,
            instances=validated_instances,
            deployment=deployment
        )
        
        # Create response
        response = InferenceResponse(
            predictions=predictions,
            model_info={
                "model_id": deployment.model_version.model_id,
                "model_name": deployment.model_version.model.name,
                "version": deployment.model_version.version,
                "deployment_id": deployment.id,
                "prediction_id": str(uuid.uuid4())
            },
            metadata={
                "latency_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": datetime.utcnow().isoformat(),
                "cached": False
            }
        )
        
        # Cache response if enabled
        if request.use_cache:
            await redis_client.setex(
                cache_key, 
                settings.INFERENCE_CACHE_TTL, 
                json.dumps(response.dict())
            )
        
        # Log request/response in background
        background_tasks.add_task(
            log_inference_request,
            deployment.id,
            len(request.instances),
            response.metadata["latency_ms"],
            api_key
        )
        
        return response
        
    except Exception as e:
        # Log error
        background_tasks.add_task(
            log_inference_error,
            deployment.id,
            str(e),
            api_key
        )
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/inference/{deployment_name}/batch", response_model=BatchInferenceResponse)
async def predict_batch(
    deployment_name: str,
    request: BatchInferenceRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    api_key: Optional[str] = Depends(security)
):
    """
    Make batch predictions for multiple instances.
    Optimized for large datasets with parallel processing.
    """
    start_time = time.time()
    
    # Get deployment
    deployment = await get_deployment_by_name(db, deployment_name)
    if not deployment or deployment.status != 'active':
        raise HTTPException(status_code=404, detail="Deployment not found or inactive")
    
    # Rate limiting for batch requests (stricter limits)
    client_id = api_key or "anonymous"
    if not await rate_limiter.check_batch_rate_limit(client_id, len(request.instances)):
        raise HTTPException(status_code=429, detail="Batch rate limit exceeded")
    
    try:
        # Load model
        model = await model_loader.get_model(deployment.model_version_id)
        
        # Validate input schema
        validated_instances = await inference_service.validate_input(
            request.instances,
            deployment.model_version.model_schema
        )
        
        # Process in batches for memory efficiency
        batch_size = request.batch_size or settings.DEFAULT_BATCH_SIZE
        all_predictions = []
        failed_indices = []
        
        for i in range(0, len(validated_instances), batch_size):
            batch = validated_instances[i:i + batch_size]
            
            try:
                batch_predictions = await inference_service.predict(
                    model=model,
                    instances=batch,
                    deployment=deployment
                )
                all_predictions.extend(batch_predictions)
            except Exception as e:
                # Mark failed batch indices
                for j in range(len(batch)):
                    failed_indices.append(i + j)
                    all_predictions.append({
                        "error": str(e),
                        "index": i + j
                    })
        
        # Create response
        response = BatchInferenceResponse(
            predictions=all_predictions,
            model_info={
                "model_id": deployment.model_version.model_id,
                "model_name": deployment.model_version.model.name,
                "version": deployment.model_version.version,
                "deployment_id": deployment.id,
                "batch_id": str(uuid.uuid4())
            },
            metadata={
                "total_instances": len(request.instances),
                "successful_predictions": len(all_predictions) - len(failed_indices),
                "failed_predictions": len(failed_indices),
                "batch_size": batch_size,
                "total_latency_ms": round((time.time() - start_time) * 1000, 2),
                "avg_latency_per_instance": round(((time.time() - start_time) * 1000) / len(request.instances), 2),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        # Log batch request
        background_tasks.add_task(
            log_batch_inference_request,
            deployment.id,
            len(request.instances),
            len(failed_indices),
            response.metadata["total_latency_ms"],
            api_key
        )
        
        return response
        
    except Exception as e:
        background_tasks.add_task(
            log_inference_error,
            deployment.id,
            f"Batch prediction failed: {str(e)}",
            api_key
        )
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@router.get("/inference/{deployment_name}/health", response_model=HealthResponse)
async def health_check(
    deployment_name: str,
    db: Session = Depends(get_db)
):
    """
    Health check endpoint for deployment.
    """
    deployment = await get_deployment_by_name(db, deployment_name)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    # Check model loading status
    try:
        model_loaded = await model_loader.is_model_loaded(deployment.model_version_id)
        model_health = await model_loader.check_model_health(deployment.model_version_id)
        
        return HealthResponse(
            status="healthy" if model_loaded and model_health else "unhealthy",
            deployment_id=deployment.id,
            model_version_id=deployment.model_version_id,
            model_loaded=model_loaded,
            last_prediction_at=deployment.last_request_at,
            health_details={
                "model_health": model_health,
                "memory_usage": await model_loader.get_memory_usage(deployment.model_version_id),
                "uptime_seconds": (datetime.utcnow() - deployment.deployed_at).total_seconds() if deployment.deployed_at else 0
            }
        )
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            deployment_id=deployment.id,
            model_version_id=deployment.model_version_id,
            model_loaded=False,
            health_details={
                "error": str(e)
            }
        )


@router.get("/inference/{deployment_name}/schema", response_model=ModelSchemaResponse)
async def get_model_schema(
    deployment_name: str,
    db: Session = Depends(get_db)
):
    """
    Get model input/output schema for validation.
    """
    deployment = await get_deployment_by_name(db, deployment_name)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    model_version = deployment.model_version
    if not model_version.model_schema:
        raise HTTPException(status_code=404, detail="Model schema not available")
    
    return ModelSchemaResponse(
        deployment_id=deployment.id,
        model_id=model_version.model_id,
        model_name=model_version.model.name,
        version=model_version.version,
        schema=model_version.model_schema,
        examples=model_version.model_schema.get("examples", {}),
        description=model_version.description
    )


# Helper functions

async def get_deployment_by_name(db: Session, deployment_name: str) -> Optional[Deployment]:
    """Get deployment by name with related models."""
    query = (
        select(Deployment)
        .where(Deployment.name == deployment_name)
        .where(Deployment.deleted_at.is_(None))
    )
    result = db.execute(query)
    return result.scalar_one_or_none()


async def log_inference_request(
    deployment_id: str,
    instance_count: int,
    latency_ms: float,
    api_key: Optional[str]
):
    """Log inference request for monitoring."""
    try:
        # This would integrate with your monitoring system
        # For now, we'll store basic metrics
        monitoring_data = {
            "deployment_id": deployment_id,
            "timestamp": datetime.utcnow(),
            "request_count": 1,
            "instance_count": instance_count,
            "latency_ms": latency_ms,
            "api_key_used": api_key is not None
        }
        
        # Store in Redis for real-time metrics
        await redis_client.lpush(
            f"inference_logs:{deployment_id}",
            json.dumps(monitoring_data, default=str)
        )
        
        # Keep only last 1000 logs per deployment
        await redis_client.ltrim(f"inference_logs:{deployment_id}", 0, 999)
        
    except Exception as e:
        print(f"Failed to log inference request: {e}")


async def log_batch_inference_request(
    deployment_id: str,
    total_instances: int,
    failed_count: int,
    latency_ms: float,
    api_key: Optional[str]
):
    """Log batch inference request for monitoring."""
    try:
        monitoring_data = {
            "deployment_id": deployment_id,
            "timestamp": datetime.utcnow(),
            "request_type": "batch",
            "total_instances": total_instances,
            "failed_instances": failed_count,
            "success_rate": (total_instances - failed_count) / total_instances if total_instances > 0 else 0,
            "total_latency_ms": latency_ms,
            "api_key_used": api_key is not None
        }
        
        await redis_client.lpush(
            f"inference_logs:{deployment_id}",
            json.dumps(monitoring_data, default=str)
        )
        
        await redis_client.ltrim(f"inference_logs:{deployment_id}", 0, 999)
        
    except Exception as e:
        print(f"Failed to log batch inference request: {e}")


async def log_inference_error(
    deployment_id: str,
    error_message: str,
    api_key: Optional[str]
):
    """Log inference errors for monitoring."""
    try:
        error_data = {
            "deployment_id": deployment_id,
            "timestamp": datetime.utcnow(),
            "error_message": error_message,
            "api_key_used": api_key is not None
        }
        
        await redis_client.lpush(
            f"inference_errors:{deployment_id}",
            json.dumps(error_data, default=str)
        )
        
        await redis_client.ltrim(f"inference_errors:{deployment_id}", 0, 999)
        
    except Exception as e:
        print(f"Failed to log inference error: {e}")