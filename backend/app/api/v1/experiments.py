from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_active_user
from app.models.user import User
from app.services.experiment_service import ExperimentService
from app.schemas.experiment import (
    ExperimentCreate,
    ExperimentUpdate,
    ExperimentResponse,
    ExperimentListResponse,
    ExperimentRunCreate,
    ExperimentRunResponse,
    ExperimentRunListResponse,
)

router = APIRouter()

@router.get("/", response_model=ExperimentListResponse)
async def list_experiments(
    organization_id: str = Query(...),
    project_id: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    service = ExperimentService(db)
    try:
        org_uuid = uuid.UUID(organization_id)
        proj_uuid = uuid.UUID(project_id) if project_id else None
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid UUID in parameters")
    items, total = service.list_experiments(org_uuid, proj_uuid, current_user.id, skip, limit)
    return ExperimentListResponse(
        experiments=[ExperimentResponse.from_orm(e) for e in items],
        total=total,
        page=skip // limit + 1,
        size=len(items),
    )

@router.post("/", response_model=ExperimentResponse, status_code=status.HTTP_201_CREATED)
async def create_experiment(data: ExperimentCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ExperimentService(db)
    exp = service.create_experiment(current_user.id, data)
    return ExperimentResponse.from_orm(exp)

@router.get("/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(experiment_id: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        exp_uuid = uuid.UUID(experiment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid experiment_id")
    exp = service.get_experiment(exp_uuid, current_user.id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    return ExperimentResponse.from_orm(exp)

@router.put("/{experiment_id}", response_model=ExperimentResponse)
async def update_experiment(experiment_id: str, data: ExperimentUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        exp_uuid = uuid.UUID(experiment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid experiment_id")
    exp = service.update_experiment(exp_uuid, current_user.id, data)
    return ExperimentResponse.from_orm(exp)

@router.get("/{experiment_id}/runs", response_model=ExperimentRunListResponse)
async def list_runs(experiment_id: str, skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        exp_uuid = uuid.UUID(experiment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid experiment_id")
    items, total = service.list_runs(exp_uuid, current_user.id, skip, limit)
    return ExperimentRunListResponse(
        runs=[ExperimentRunResponse.from_orm(r) for r in items],
        total=total,
        page=skip // limit + 1,
        size=len(items),
    )

@router.post("/{experiment_id}/runs", response_model=ExperimentRunResponse, status_code=status.HTTP_201_CREATED)
async def create_run(experiment_id: str, data: ExperimentRunCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        exp_uuid = uuid.UUID(experiment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid experiment_id")
    run = service.create_run(exp_uuid, current_user.id, data)
    return ExperimentRunResponse.from_orm(run)