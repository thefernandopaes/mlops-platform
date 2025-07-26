from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String(100), nullable=False)
    visibility = Column(String(20), default='private', nullable=False)  # private, organization, public
    settings = Column(JSONB, default=dict, nullable=False)
    
    # Multi-tenant
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="projects")
    creator = relationship("User", foreign_keys=[created_by])
    members = relationship("ProjectMember", back_populates="project")
    models = relationship("Model", back_populates="project")
    experiments = relationship("Experiment", back_populates="project")
    deployments = relationship("Deployment", back_populates="project")
    notification_rules = relationship("NotificationRule", back_populates="project")
    
    def __repr__(self):
        return f"<Project(id={self.id}, name={self.name})>"