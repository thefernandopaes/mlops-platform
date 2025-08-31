"""
Inference API Schemas.
Pydantic models for inference requests and responses.
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime


class InferenceRequest(BaseModel):
    """Request schema for single model inference."""
    
    instances: List[Dict[str, Any]] = Field(
        ..., 
        description="List of input instances for prediction",
        min_items=1,
        max_items=1000
    )
    use_cache: bool = Field(
        True,
        description="Whether to use cached predictions for identical requests"
    )
    return_probabilities: bool = Field(
        False,
        description="Whether to return prediction probabilities (if supported)"
    )
    explain: bool = Field(
        False,
        description="Whether to return model explanations (if supported)"
    )
    
    @validator('instances')
    def validate_instances(cls, v):
        if not v:
            raise ValueError("At least one instance must be provided")
        return v


class BatchInferenceRequest(BaseModel):
    """Request schema for batch model inference."""
    
    instances: List[Dict[str, Any]] = Field(
        ...,
        description="List of input instances for batch prediction",
        min_items=1,
        max_items=10000
    )
    batch_size: Optional[int] = Field(
        None,
        description="Batch size for processing (defaults to system default)",
        ge=1,
        le=1000
    )
    return_probabilities: bool = Field(
        False,
        description="Whether to return prediction probabilities"
    )
    fail_on_error: bool = Field(
        False,
        description="Whether to fail entire batch on any error"
    )
    
    @validator('instances')
    def validate_batch_instances(cls, v):
        if len(v) > 10000:
            raise ValueError("Batch size cannot exceed 10,000 instances")
        return v


class ModelInfo(BaseModel):
    """Model information in response."""
    
    model_id: str
    model_name: str
    version: str
    deployment_id: str
    prediction_id: Optional[str] = None
    batch_id: Optional[str] = None


class InferenceMetadata(BaseModel):
    """Metadata for inference response."""
    
    latency_ms: float
    timestamp: str
    cached: bool = False
    model_version: Optional[str] = None
    prediction_count: Optional[int] = None


class BatchInferenceMetadata(BaseModel):
    """Metadata for batch inference response."""
    
    total_instances: int
    successful_predictions: int
    failed_predictions: int
    batch_size: int
    total_latency_ms: float
    avg_latency_per_instance: float
    timestamp: str
    success_rate: Optional[float] = None
    
    @validator('success_rate', always=True)
    def calculate_success_rate(cls, v, values):
        if 'total_instances' in values and values['total_instances'] > 0:
            return values.get('successful_predictions', 0) / values['total_instances']
        return 0.0


class PredictionResult(BaseModel):
    """Individual prediction result."""
    
    prediction: Union[float, int, str, List[Any], Dict[str, Any]]
    probabilities: Optional[Dict[str, float]] = None
    explanation: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    index: Optional[int] = None
    error: Optional[str] = None


class InferenceResponse(BaseModel):
    """Response schema for single inference."""
    
    predictions: List[Union[Any, PredictionResult]]
    model_info: ModelInfo
    metadata: InferenceMetadata


class BatchInferenceResponse(BaseModel):
    """Response schema for batch inference."""
    
    predictions: List[Union[Any, PredictionResult]]
    model_info: ModelInfo
    metadata: BatchInferenceMetadata


class HealthResponse(BaseModel):
    """Health check response schema."""
    
    status: str = Field(..., description="Health status: healthy, unhealthy, degraded")
    deployment_id: str
    model_version_id: str
    model_loaded: bool
    last_prediction_at: Optional[datetime] = None
    health_details: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['healthy', 'unhealthy', 'degraded']
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {valid_statuses}")
        return v


class ModelSchemaResponse(BaseModel):
    """Model schema response."""
    
    deployment_id: str
    model_id: str
    model_name: str
    version: str
    schema: Dict[str, Any]
    examples: Dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None


class InferenceError(BaseModel):
    """Error response schema."""
    
    error: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: str
    request_id: Optional[str] = None


class RateLimitInfo(BaseModel):
    """Rate limit information."""
    
    limit: int
    remaining: int
    reset_time: datetime
    retry_after: Optional[int] = None


class InferenceStats(BaseModel):
    """Inference statistics."""
    
    deployment_id: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_latency_ms: float
    requests_per_minute: float
    cache_hit_rate: float
    last_24h: Dict[str, int]
    period_start: datetime
    period_end: datetime