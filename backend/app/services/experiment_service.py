from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Tuple, Optional
import uuid
from datetime import datetime

from app.models.experiment import Experiment
from app.models.experiment_run import ExperimentRun
from app.models.organization_membership import OrganizationMembership
from app.schemas.experiment import ExperimentCreate, ExperimentUpdate, ExperimentRunCreate


class ExperimentService:
    def __init__(self, db: Session):
        self.db = db

    def _ensure_org_role(self, organization_id: uuid.UUID, user_id: uuid.UUID, min_role: str) -> None:
        role_hierarchy = {"viewer": 1, "developer": 2, "admin": 3}
        membership: Optional[OrganizationMembership] = (
            self.db.query(OrganizationMembership)
            .filter(
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.user_id == user_id,
            )
            .first()
        )
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to organization")
        if role_hierarchy.get(membership.role, 0) < role_hierarchy.get(min_role, 0):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role for action")

    def list_experiments(self, organization_id: uuid.UUID, project_id: Optional[uuid.UUID], user_id: uuid.UUID, skip: int, limit: int) -> Tuple[List[Experiment], int]:
        self._ensure_org_role(organization_id, user_id, "viewer")
        query = self.db.query(Experiment).filter(Experiment.organization_id == organization_id, Experiment.deleted_at.is_(None))
        if project_id:
            query = query.filter(Experiment.project_id == project_id)
        total = query.count()
        items = query.order_by(Experiment.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create_experiment(self, creator_user_id: uuid.UUID, data: ExperimentCreate) -> Experiment:
        self._ensure_org_role(data.organization_id, creator_user_id, "developer")
        exp = Experiment(
            id=uuid.uuid4(),
            organization_id=data.organization_id,
            project_id=data.project_id,
            model_id=data.model_id,
            name=data.name,
            description=data.description,
            status=data.status,
            config=data.config or {},
            created_by=creator_user_id,
        )
        try:
            self.db.add(exp)
            self.db.commit()
            self.db.refresh(exp)
            return exp
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Experiment creation conflict")

    def get_experiment(self, experiment_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Experiment]:
        exp = self.db.query(Experiment).filter(Experiment.id == experiment_id, Experiment.deleted_at.is_(None)).first()
        if not exp:
            return None
        self._ensure_org_role(exp.organization_id, user_id, "viewer")
        return exp

    def update_experiment(self, experiment_id: uuid.UUID, user_id: uuid.UUID, data: ExperimentUpdate) -> Experiment:
        exp = self.get_experiment(experiment_id, user_id)
        if not exp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
        self._ensure_org_role(exp.organization_id, user_id, "developer")
        if data.name is not None:
            exp.name = data.name
        if data.description is not None:
            exp.description = data.description
        if data.status is not None:
            exp.status = data.status
            if data.status in ("completed", "failed", "cancelled"):
                exp.completed_at = datetime.utcnow()
        if data.config is not None:
            exp.config = data.config
        self.db.commit()
        self.db.refresh(exp)
        return exp

    def create_run(self, experiment_id: uuid.UUID, user_id: uuid.UUID, data: ExperimentRunCreate) -> ExperimentRun:
        exp = self.get_experiment(experiment_id, user_id)
        if not exp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
        self._ensure_org_role(exp.organization_id, user_id, "developer")
        run = ExperimentRun(
            id=uuid.uuid4(),
            experiment_id=experiment_id,
            run_name=data.run_name,
            status=data.status,
            parameters=data.parameters or {},
            metrics=data.metrics or {},
            artifacts=data.artifacts or {},
            logs=data.logs,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def list_runs(self, experiment_id: uuid.UUID, user_id: uuid.UUID, skip: int, limit: int) -> Tuple[List[ExperimentRun], int]:
        exp = self.get_experiment(experiment_id, user_id)
        if not exp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
        query = self.db.query(ExperimentRun).filter(ExperimentRun.experiment_id == experiment_id)
        total = query.count()
        items = query.order_by(ExperimentRun.created_at.desc()).offset(skip).limit(limit).all()
        return items, total


