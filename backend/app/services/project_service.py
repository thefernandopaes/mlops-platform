from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List, Tuple, Optional
import uuid
import re

from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.organization_membership import OrganizationMembership
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def _slugify_unique(self, organization_id: uuid.UUID, name: str) -> str:
        slug = re.sub(r"[^a-z0-9\-]", "", name.lower().replace(" ", "-"))
        base = slug or "project"
        candidate = base
        i = 1
        while (
            self.db.query(Project)
            .filter(Project.organization_id == organization_id, Project.slug == candidate)
            .first()
        ) is not None:
            candidate = f"{base}-{i}"
            i += 1
        return candidate

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

    def list_projects(self, organization_id: uuid.UUID, user_id: uuid.UUID, skip: int, limit: int) -> Tuple[List[Project], int]:
        # Ensure user has at least viewer access
        self._ensure_org_role(organization_id, user_id, "viewer")

        query = self.db.query(Project).filter(
            Project.organization_id == organization_id,
            Project.deleted_at.is_(None),
        )
        total = query.count()
        items = query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create_project(self, creator_user_id: uuid.UUID, data: ProjectCreate) -> Project:
        # Must be developer or admin to create
        self._ensure_org_role(data.organization_id, creator_user_id, "developer")

        slug = self._slugify_unique(data.organization_id, data.name)
        project = Project(
            id=uuid.uuid4(),
            name=data.name,
            description=data.description,
            slug=slug,
            visibility=data.visibility,
            settings=data.settings or {},
            organization_id=data.organization_id,
            created_by=creator_user_id,
        )
        try:
            self.db.add(project)
            self.db.flush()
            # Creator becomes owner member
            member = ProjectMember(
                id=uuid.uuid4(),
                project_id=project.id,
                user_id=creator_user_id,
                role="owner",
                added_by=creator_user_id,
            )
            self.db.add(member)
            self.db.commit()
            return project
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Project creation conflict")

    def get_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Project]:
        project = (
            self.db.query(Project)
            .filter(Project.id == project_id, Project.deleted_at.is_(None))
            .first()
        )
        if not project:
            return None
        # Ensure user has access to the organization
        self._ensure_org_role(project.organization_id, user_id, "viewer")
        return project

    def update_project(self, project_id: uuid.UUID, user_id: uuid.UUID, data: ProjectUpdate) -> Project:
        project = self.get_project(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # Must be owner or developer/admin in org to update
        self._ensure_org_role(project.organization_id, user_id, "developer")

        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        if data.visibility is not None:
            project.visibility = data.visibility
        if data.settings is not None:
            project.settings = data.settings

        self.db.commit()
        self.db.refresh(project)
        return project

    def delete_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> None:
        project = self.get_project(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        # Must be owner or admin/developer to delete (chamando developer para simplificar)
        self._ensure_org_role(project.organization_id, user_id, "developer")
        project.deleted_at = __import__("datetime").datetime.utcnow()
        self.db.commit()


