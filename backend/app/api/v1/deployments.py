from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_active_user
from app.models.user import User
from app.services.deployment_service import DeploymentService
from app.schemas.deployment import (
    DeploymentCreate,
    DeploymentUpdate,
    DeploymentResponse,
    DeploymentListResponse,
    DeploymentHistoryListResponse,
    DeploymentHistoryResponse,
)

router = APIRouter()

@router.get("/", response_model=DeploymentListResponse)
async def list_deployments(
    organization_id: str = Query(...),
    project_id: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    service = DeploymentService(db)
    try:
        org_uuid = uuid.UUID(organization_id)
        proj_uuid = uuid.UUID(project_id) if project_id else None
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid UUID in parameters")
    items, total = service.list_deployments(org_uuid, proj_uuid, current_user.id, skip, limit)
    return DeploymentListResponse(
        deployments=[DeploymentResponse.from_orm(d) for d in items],
        total=total,
        page=skip // limit + 1,
        size=len(items),
    )

@router.post("/", response_model=DeploymentResponse, status_code=status.HTTP_201_CREATED)
async def create_deployment(data: DeploymentCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = DeploymentService(db)
    dep = service.create_deployment(current_user.id, data)
    return DeploymentResponse.from_orm(dep)

@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(deployment_id: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = DeploymentService(db)
    try:
        dep_uuid = uuid.UUID(deployment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid deployment_id")
    dep = service.get_deployment(dep_uuid, current_user.id)
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    return DeploymentResponse.from_orm(dep)

@router.put("/{deployment_id}", response_model=DeploymentResponse)
async def update_deployment(deployment_id: str, data: DeploymentUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = DeploymentService(db)
    try:
        dep_uuid = uuid.UUID(deployment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid deployment_id")
    dep = service.update_deployment(dep_uuid, current_user.id, data)
    return DeploymentResponse.from_orm(dep)

@router.get("/{deployment_id}/history", response_model=DeploymentHistoryListResponse)
async def list_history(deployment_id: str, skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = DeploymentService(db)
    try:
        dep_uuid = uuid.UUID(deployment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid deployment_id")
    items, total = service.list_history(dep_uuid, current_user.id, skip, limit)
    return DeploymentHistoryListResponse(
        history=[DeploymentHistoryResponse.from_orm(h) for h in items],
        total=total,
        page=skip // limit + 1,
        size=len(items),
    )