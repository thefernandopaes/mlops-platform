from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Tuple, Optional
import uuid
from datetime import datetime

from app.models.deployment import Deployment
from app.models.deployment_history import DeploymentHistory
from app.models.organization_membership import OrganizationMembership
from app.schemas.deployment import (
    DeploymentCreate,
    DeploymentUpdate,
)


class DeploymentService:
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

    def list_deployments(self, organization_id: uuid.UUID, project_id: Optional[uuid.UUID], user_id: uuid.UUID, skip: int, limit: int) -> Tuple[List[Deployment], int]:
        self._ensure_org_role(organization_id, user_id, "viewer")
        query = self.db.query(Deployment).filter(Deployment.organization_id == organization_id, Deployment.deleted_at.is_(None))
        if project_id:
            query = query.filter(Deployment.project_id == project_id)
        total = query.count()
        items = query.order_by(Deployment.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create_deployment(self, creator_user_id: uuid.UUID, data: DeploymentCreate) -> Deployment:
        self._ensure_org_role(data.organization_id, creator_user_id, "developer")
        dep = Deployment(
            id=uuid.uuid4(),
            organization_id=data.organization_id,
            project_id=data.project_id,
            model_version_id=data.model_version_id,
            name=data.name,
            environment=data.environment,
            endpoint_url=data.endpoint_url,
            status="pending",
            instance_type=data.instance_type or "small",
            min_instances=data.min_instances or 1,
            max_instances=data.max_instances or 1,
            auto_scaling=data.auto_scaling if data.auto_scaling is not None else True,
            deployment_config=data.deployment_config or {},
            health_check_path=data.health_check_path or "/health",
            created_by=creator_user_id,
        )
        try:
            self.db.add(dep)
            self.db.flush()
            history = DeploymentHistory(
                id=uuid.uuid4(),
                deployment_id=dep.id,
                model_version_id=data.model_version_id,
                action="deploy",
                status="completed",
                performed_by=creator_user_id,
                started_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
            )
            self.db.add(history)
            self.db.commit()
            self.db.refresh(dep)
            return dep
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Deployment creation conflict")

    def get_deployment(self, deployment_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Deployment]:
        dep = self.db.query(Deployment).filter(Deployment.id == deployment_id, Deployment.deleted_at.is_(None)).first()
        if not dep:
            return None
        self._ensure_org_role(dep.organization_id, user_id, "viewer")
        return dep

    def update_deployment(self, deployment_id: uuid.UUID, user_id: uuid.UUID, data: DeploymentUpdate) -> Deployment:
        dep = self.get_deployment(deployment_id, user_id)
        if not dep:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
        self._ensure_org_role(dep.organization_id, user_id, "developer")
        for field in ["name", "environment", "endpoint_url", "instance_type", "min_instances", "max_instances", "auto_scaling", "deployment_config", "health_check_path", "status"]:
            value = getattr(data, field, None)
            if value is not None:
                setattr(dep, field, value)
        self.db.commit()
        self.db.refresh(dep)
        return dep

    def list_history(self, deployment_id: uuid.UUID, user_id: uuid.UUID, skip: int, limit: int) -> Tuple[List[DeploymentHistory], int]:
        dep = self.get_deployment(deployment_id, user_id)
        if not dep:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
        query = self.db.query(DeploymentHistory).filter(DeploymentHistory.deployment_id == deployment_id)
        total = query.count()
        items = query.order_by(DeploymentHistory.started_at.desc()).offset(skip).limit(limit).all()
        return items, total


