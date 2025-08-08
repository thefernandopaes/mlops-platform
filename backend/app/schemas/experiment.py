from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
import uuid


class ExperimentBase(BaseModel):
  name: str = Field(..., min_length=1, max_length=255)
  description: Optional[str] = Field(None, max_length=5000)
  status: Literal["running", "completed", "failed", "cancelled"] = "running"
  config: Dict[str, Any] = Field(default_factory=dict)


class ExperimentCreate(ExperimentBase):
  organization_id: uuid.UUID
  project_id: uuid.UUID
  model_id: Optional[uuid.UUID] = None


class ExperimentUpdate(BaseModel):
  name: Optional[str] = None
  description: Optional[str] = None
  status: Optional[Literal["running", "completed", "failed", "cancelled"]] = None
  config: Optional[Dict[str, Any]] = None


class ExperimentResponse(BaseModel):
  id: uuid.UUID
  organization_id: uuid.UUID
  project_id: uuid.UUID
  model_id: Optional[uuid.UUID]
  name: str
  description: Optional[str]
  status: str
  config: Dict[str, Any]
  created_by: uuid.UUID
  started_at: datetime
  completed_at: Optional[datetime]
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


class ExperimentListResponse(BaseModel):
  experiments: List[ExperimentResponse]
  total: int
  page: int
  size: int


class ExperimentRunBase(BaseModel):
  run_name: Optional[str] = None
  status: Literal["running", "completed", "failed", "cancelled"] = "running"
  parameters: Dict[str, Any] = Field(default_factory=dict)
  metrics: Dict[str, Any] = Field(default_factory=dict)
  artifacts: Dict[str, Any] = Field(default_factory=dict)
  logs: Optional[str] = None


class ExperimentRunCreate(ExperimentRunBase):
  pass


class ExperimentRunResponse(BaseModel):
  id: uuid.UUID
  experiment_id: uuid.UUID
  run_name: Optional[str]
  status: str
  parameters: Dict[str, Any]
  metrics: Dict[str, Any]
  artifacts: Dict[str, Any]
  logs: Optional[str]
  started_at: datetime
  completed_at: Optional[datetime]
  duration_seconds: Optional[int]
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


class ExperimentRunListResponse(BaseModel):
  runs: List[ExperimentRunResponse]
  total: int
  page: int
  size: int


