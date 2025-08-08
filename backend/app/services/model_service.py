from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Tuple, Optional
import uuid
import re

from app.models.model import Model
from app.models.model_version import ModelVersion
from app.models.organization_membership import OrganizationMembership
from app.schemas.model import (
    ModelCreate,
    ModelUpdate,
    ModelVersionCreate,
)


class ModelService:
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

    def list_models(
        self, organization_id: uuid.UUID, project_id: Optional[uuid.UUID], user_id: uuid.UUID, skip: int, limit: int
    ) -> Tuple[List[Model], int]:
        self._ensure_org_role(organization_id, user_id, "viewer")
        query = self.db.query(Model).filter(
            Model.organization_id == organization_id,
            Model.deleted_at.is_(None),
        )
        if project_id:
            query = query.filter(Model.project_id == project_id)
        total = query.count()
        items = query.order_by(Model.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create_model(self, creator_user_id: uuid.UUID, data: ModelCreate) -> Model:
        self._ensure_org_role(data.organization_id, creator_user_id, "developer")
        model = Model(
            id=uuid.uuid4(),
            name=data.name,
            description=data.description,
            model_type=data.model_type,
            framework=data.framework,
            task_type=data.task_type,
            tags=data.tags or [],
            model_metadata=data.model_metadata or {},
            organization_id=data.organization_id,
            project_id=data.project_id,
            created_by=creator_user_id,
        )
        try:
            self.db.add(model)
            self.db.commit()
            self.db.refresh(model)
            return model
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Model creation conflict")

    def get_model(self, model_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Model]:
        model = self.db.query(Model).filter(Model.id == model_id, Model.deleted_at.is_(None)).first()
        if not model:
            return None
        self._ensure_org_role(model.organization_id, user_id, "viewer")
        return model

    def update_model(self, model_id: uuid.UUID, user_id: uuid.UUID, data: ModelUpdate) -> Model:
        model = self.get_model(model_id, user_id)
        if not model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        self._ensure_org_role(model.organization_id, user_id, "developer")
        if data.name is not None:
            model.name = data.name
        if data.description is not None:
            model.description = data.description
        if data.tags is not None:
            model.tags = data.tags
        if data.model_metadata is not None:
            model.model_metadata = data.model_metadata
        self.db.commit()
        self.db.refresh(model)
        return model

    def list_versions(self, model_id: uuid.UUID, user_id: uuid.UUID, skip: int, limit: int) -> Tuple[List[ModelVersion], int]:
        model = self.db.query(Model).filter(Model.id == model_id, Model.deleted_at.is_(None)).first()
        if not model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        self._ensure_org_role(model.organization_id, user_id, "viewer")
        query = self.db.query(ModelVersion).filter(ModelVersion.model_id == model_id, ModelVersion.deleted_at.is_(None))
        total = query.count()
        items = query.order_by(ModelVersion.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create_version(self, model_id: uuid.UUID, creator_user_id: uuid.UUID, data: ModelVersionCreate) -> ModelVersion:
        model = self.db.query(Model).filter(Model.id == model_id, Model.deleted_at.is_(None)).first()
        if not model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        self._ensure_org_role(model.organization_id, creator_user_id, "developer")
        version = ModelVersion(
            id=uuid.uuid4(),
            model_id=model_id,
            version=data.version,
            stage=data.stage,
            model_file_path=data.model_file_path,
            model_size_bytes=data.model_size_bytes,
            requirements=data.requirements,
            performance_metrics=data.performance_metrics or {},
            training_metrics=data.training_metrics or {},
            model_schema=data.model_schema or {},
            description=data.description,
            created_by=creator_user_id,
        )
        try:
            self.db.add(version)
            self.db.commit()
            self.db.refresh(version)
            return version
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Version creation conflict")


