from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime
import uuid


class ModelBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    model_type: str = Field(..., min_length=1, max_length=100)
    framework: str = Field(..., min_length=1, max_length=100)
    task_type: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)
    model_metadata: Dict[str, Any] = Field(default_factory=dict)


class ModelCreate(ModelBase):
    organization_id: uuid.UUID
    project_id: uuid.UUID


class ModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    model_metadata: Optional[Dict[str, Any]] = None


class ModelResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    model_type: str
    framework: str
    task_type: Optional[str]
    tags: List[str]
    model_metadata: Dict[str, Any]
    organization_id: uuid.UUID
    project_id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelListResponse(BaseModel):
    models: List[ModelResponse]
    total: int
    page: int
    size: int


class ModelVersionBase(BaseModel):
    version: str = Field(..., min_length=1, max_length=50)
    stage: Literal["development", "staging", "production", "archived"] = "development"
    model_file_path: str = Field(..., max_length=500)
    model_size_bytes: Optional[int] = None
    requirements: Optional[str] = None
    performance_metrics: Dict[str, Any] = Field(default_factory=dict)
    training_metrics: Dict[str, Any] = Field(default_factory=dict)
    model_schema: Dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None


class ModelVersionCreate(ModelVersionBase):
    pass


class ModelVersionResponse(BaseModel):
    id: uuid.UUID
    model_id: uuid.UUID
    version: str
    stage: str
    model_file_path: str
    model_size_bytes: Optional[int]
    requirements: Optional[str]
    performance_metrics: Dict[str, Any]
    training_metrics: Dict[str, Any]
    model_schema: Dict[str, Any]
    description: Optional[str]
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelVersionListResponse(BaseModel):
    versions: List[ModelVersionResponse]
    total: int
    page: int
    size: int


