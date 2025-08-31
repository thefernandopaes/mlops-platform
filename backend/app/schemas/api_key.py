"""
API Key Schemas.
Pydantic models for API key management requests and responses.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, validator


class ApiKeyBase(BaseModel):
    """Base schema for API key."""
    
    name: str = Field(..., min_length=1, max_length=255, description="API key name")
    permissions: Optional[Dict[str, Any]] = Field(
        default_factory=dict, 
        description="Scoped permissions for this API key"
    )


class ApiKeyCreate(ApiKeyBase):
    """Schema for creating API key."""
    
    expires_in_days: Optional[int] = Field(
        None, 
        ge=1, 
        le=365, 
        description="Number of days until expiration (optional)"
    )
    
    @validator('permissions')
    def validate_permissions(cls, v):
        """Validate permissions structure."""
        if not isinstance(v, dict):
            return {}
        
        # Define allowed permission scopes
        allowed_scopes = {
            'inference:predict',
            'inference:batch',
            'inference:health',
            'models:read',
            'deployments:read',
            'monitoring:read',
            'experiments:read',
            'projects:read'
        }
        
        # Filter to only allowed permissions
        filtered = {}
        for scope, value in v.items():
            if scope in allowed_scopes and isinstance(value, bool):
                filtered[scope] = value
        
        return filtered


class ApiKeyUpdate(BaseModel):
    """Schema for updating API key."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    permissions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    expires_in_days: Optional[int] = Field(None, ge=1, le=365)
    
    @validator('permissions')
    def validate_permissions(cls, v):
        """Validate permissions structure."""
        if v is None:
            return v
        
        if not isinstance(v, dict):
            return {}
        
        # Define allowed permission scopes
        allowed_scopes = {
            'inference:predict',
            'inference:batch', 
            'inference:health',
            'models:read',
            'deployments:read',
            'monitoring:read',
            'experiments:read',
            'projects:read'
        }
        
        # Filter to only allowed permissions
        filtered = {}
        for scope, value in v.items():
            if scope in allowed_scopes and isinstance(value, bool):
                filtered[scope] = value
        
        return filtered


class ApiKeyResponse(BaseModel):
    """Schema for API key response."""
    
    id: str
    name: str
    key_prefix: str
    permissions: Dict[str, Any]
    is_active: bool
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Only included when creating/regenerating
    key: Optional[str] = Field(None, description="Full API key (only shown once)")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ApiKeyListResponse(BaseModel):
    """Schema for paginated API key list."""
    
    api_keys: List[ApiKeyResponse]
    total: int
    skip: int
    limit: int


class ApiKeyUsageResponse(BaseModel):
    """Schema for API key usage statistics."""
    
    api_key_id: str
    period_days: int
    total_requests: int
    successful_requests: int
    failed_requests: int
    last_used_at: Optional[datetime]
    usage_by_endpoint: Dict[str, int] = Field(default_factory=dict)
    usage_by_day: Dict[str, int] = Field(default_factory=dict)
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate percentage."""
        if self.total_requests == 0:
            return 0.0
        return (self.successful_requests / self.total_requests) * 100
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ApiKeyValidationResponse(BaseModel):
    """Schema for API key validation response."""
    
    valid: bool
    api_key_id: Optional[str] = None
    organization_id: Optional[str] = None
    user_id: Optional[str] = None
    permissions: Dict[str, Any] = Field(default_factory=dict)
    expires_at: Optional[datetime] = None
    error: Optional[str] = None


class ApiKeyPermission(BaseModel):
    """Schema for individual permission definition."""
    
    scope: str = Field(..., description="Permission scope (e.g., 'inference:predict')")
    description: str = Field(..., description="Human-readable description")
    category: str = Field(..., description="Permission category")
    risk_level: str = Field(..., description="Risk level: low, medium, high")


class ApiKeyPermissionsTemplate(BaseModel):
    """Schema for API key permission templates."""
    
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    permissions: Dict[str, bool] = Field(..., description="Default permissions")
    
    @validator('permissions')
    def validate_template_permissions(cls, v):
        """Validate template permissions."""
        allowed_scopes = {
            'inference:predict',
            'inference:batch',
            'inference:health', 
            'models:read',
            'deployments:read',
            'monitoring:read',
            'experiments:read',
            'projects:read'
        }
        
        filtered = {}
        for scope, value in v.items():
            if scope in allowed_scopes and isinstance(value, bool):
                filtered[scope] = value
        
        return filtered


class ApiKeySecurityEvent(BaseModel):
    """Schema for API key security events."""
    
    api_key_id: str
    event_type: str = Field(..., description="Event type: usage, violation, etc.")
    severity: str = Field(..., description="Severity: low, medium, high, critical")
    message: str
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime
    source_ip: Optional[str] = None
    user_agent: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# Permission templates for common use cases
API_KEY_PERMISSION_TEMPLATES = {
    "read_only": {
        "name": "Read Only",
        "description": "Basic read access to models and deployments",
        "permissions": {
            "models:read": True,
            "deployments:read": True,
            "experiments:read": True,
            "projects:read": True,
            "monitoring:read": True
        }
    },
    "inference_basic": {
        "name": "Basic Inference",
        "description": "Make predictions and check health",
        "permissions": {
            "inference:predict": True,
            "inference:health": True,
            "deployments:read": True
        }
    },
    "inference_full": {
        "name": "Full Inference",
        "description": "All inference operations including batch",
        "permissions": {
            "inference:predict": True,
            "inference:batch": True,
            "inference:health": True,
            "deployments:read": True,
            "monitoring:read": True
        }
    },
    "monitoring": {
        "name": "Monitoring",
        "description": "Access to monitoring and metrics data",
        "permissions": {
            "monitoring:read": True,
            "deployments:read": True,
            "models:read": True
        }
    }
}


# Available permissions with metadata
API_KEY_PERMISSIONS = [
    ApiKeyPermission(
        scope="inference:predict",
        description="Make single predictions via inference API",
        category="Inference",
        risk_level="medium"
    ),
    ApiKeyPermission(
        scope="inference:batch",
        description="Make batch predictions via inference API",
        category="Inference", 
        risk_level="high"
    ),
    ApiKeyPermission(
        scope="inference:health",
        description="Check deployment health status",
        category="Inference",
        risk_level="low"
    ),
    ApiKeyPermission(
        scope="models:read",
        description="Read model information and metadata",
        category="Models",
        risk_level="low"
    ),
    ApiKeyPermission(
        scope="deployments:read", 
        description="Read deployment information and status",
        category="Deployments",
        risk_level="low"
    ),
    ApiKeyPermission(
        scope="monitoring:read",
        description="Access monitoring data and metrics",
        category="Monitoring",
        risk_level="low"
    ),
    ApiKeyPermission(
        scope="experiments:read",
        description="Read experiment data and results",
        category="Experiments",
        risk_level="low"
    ),
    ApiKeyPermission(
        scope="projects:read",
        description="Read project information",
        category="Projects",
        risk_level="low"
    )
]