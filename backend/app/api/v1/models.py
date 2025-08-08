from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_active_user
from app.models.user import User
from app.services.model_service import ModelService
from app.schemas.model import (
    ModelCreate,
    ModelUpdate,
    ModelResponse,
    ModelListResponse,
    ModelVersionCreate,
    ModelVersionResponse,
    ModelVersionListResponse,
)

router = APIRouter()

@router.get("/", response_model=ModelListResponse)
async def list_models(
    organization_id: str = Query(...),
    project_id: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    service = ModelService(db)
    try:
        org_uuid = uuid.UUID(organization_id)
        proj_uuid = uuid.UUID(project_id) if project_id else None
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid UUID in parameters")
    items, total = service.list_models(org_uuid, proj_uuid, current_user.id, skip, limit)
    return ModelListResponse(
        models=[ModelResponse.from_orm(m) for m in items],
        total=total,
        page=skip // limit + 1,
        size=len(items),
    )

@router.post("/", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(data: ModelCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ModelService(db)
    model = service.create_model(current_user.id, data)
    return ModelResponse.from_orm(model)

@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(model_id: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ModelService(db)
    try:
        model_uuid = uuid.UUID(model_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid model_id")
    model = service.get_model(model_uuid, current_user.id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
    return ModelResponse.from_orm(model)

@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(model_id: str, data: ModelUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ModelService(db)
    try:
        model_uuid = uuid.UUID(model_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid model_id")
    model = service.update_model(model_uuid, current_user.id, data)
    return ModelResponse.from_orm(model)

@router.get("/{model_id}/versions", response_model=ModelVersionListResponse)
async def list_versions(
    model_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    service = ModelService(db)
    try:
        model_uuid = uuid.UUID(model_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid model_id")
    items, total = service.list_versions(model_uuid, current_user.id, skip, limit)
    return ModelVersionListResponse(
        versions=[ModelVersionResponse.from_orm(v) for v in items],
        total=total,
        page=skip // limit + 1,
        size=len(items),
    )

@router.post("/{model_id}/versions", response_model=ModelVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_version(
    model_id: str,
    data: ModelVersionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    service = ModelService(db)
    try:
        model_uuid = uuid.UUID(model_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid model_id")
    version = service.create_version(model_uuid, current_user.id, data)
    return ModelVersionResponse.from_orm(version)