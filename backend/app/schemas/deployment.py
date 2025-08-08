from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
import uuid


class DeploymentCreate(BaseModel):
    organization_id: uuid.UUID
    project_id: uuid.UUID
    model_version_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255)
    environment: Literal["development", "staging", "production"]
    endpoint_url: Optional[str] = None
    instance_type: Optional[str] = None
    min_instances: Optional[int] = None
    max_instances: Optional[int] = None
    auto_scaling: Optional[bool] = None
    deployment_config: Optional[Dict[str, Any]] = None
    health_check_path: Optional[str] = None


class DeploymentUpdate(BaseModel):
    name: Optional[str] = None
    environment: Optional[str] = None
    endpoint_url: Optional[str] = None
    status: Optional[str] = None
    instance_type: Optional[str] = None
    min_instances: Optional[int] = None
    max_instances: Optional[int] = None
    auto_scaling: Optional[bool] = None
    deployment_config: Optional[Dict[str, Any]] = None
    health_check_path: Optional[str] = None


class DeploymentResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    project_id: uuid.UUID
    model_version_id: uuid.UUID
    name: str
    environment: str
    endpoint_url: Optional[str]
    status: str
    instance_type: str
    min_instances: int
    max_instances: int
    auto_scaling: bool
    deployment_config: Dict[str, Any]
    health_check_path: str
    created_by: uuid.UUID
    deployed_at: Optional[datetime]
    terminated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeploymentListResponse(BaseModel):
    deployments: List[DeploymentResponse]
    total: int
    page: int
    size: int


class DeploymentHistoryResponse(BaseModel):
    id: uuid.UUID
    deployment_id: uuid.UUID
    model_version_id: uuid.UUID
    action: str
    status: str
    error_message: Optional[str]
    performed_by: uuid.UUID
    started_at: datetime
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class DeploymentHistoryListResponse(BaseModel):
    history: List[DeploymentHistoryResponse]
    total: int
    page: int
    size: int


