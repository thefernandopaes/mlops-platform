from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # NULL for SSO users
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    settings = Column(JSONB, default=dict, nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization_memberships = relationship("OrganizationMembership", back_populates="user")
    project_memberships = relationship("ProjectMember", back_populates="user")
    created_projects = relationship("Project", foreign_keys="Project.created_by")
    created_models = relationship("Model", foreign_keys="Model.created_by")
    created_experiments = relationship("Experiment", foreign_keys="Experiment.created_by")
    api_keys = relationship("ApiKey", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"