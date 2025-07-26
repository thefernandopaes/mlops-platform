from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Deployment(Base):
    __tablename__ = "deployments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    model_version_id = Column(UUID(as_uuid=True), ForeignKey("model_versions.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(255), nullable=False)
    environment = Column(String(50), nullable=False)  # development, staging, production
    endpoint_url = Column(String(500), nullable=True)  # Generated API endpoint
    status = Column(String(50), default='pending', nullable=False)  # pending, deploying, active, inactive, failed, terminating
    instance_type = Column(String(100), default='small', nullable=False)  # small, medium, large, gpu
    min_instances = Column(Integer, default=1, nullable=False)
    max_instances = Column(Integer, default=10, nullable=False)
    auto_scaling = Column(Boolean, default=True, nullable=False)
    deployment_config = Column(JSONB, default=dict, nullable=False)  # Environment variables, resource limits, etc.
    health_check_path = Column(String(255), default='/health', nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    deployed_at = Column(DateTime(timezone=True), nullable=True)
    terminated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="deployments")
    project = relationship("Project", back_populates="deployments")
    model_version = relationship("ModelVersion", back_populates="deployments")
    creator = relationship("User", foreign_keys=[created_by])
    deployment_history = relationship("DeploymentHistory", back_populates="deployment")
    model_monitoring = relationship("ModelMonitoring", back_populates="deployment")
    data_drift_reports = relationship("DataDriftReport", back_populates="deployment")
    alerts = relationship("Alert", back_populates="deployment")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('organization_id', 'project_id', 'name', 'environment', name='unique_deployment_name_env'),
    )
    
    def __repr__(self):
        return f"<Deployment(id={self.id}, name={self.name}, environment={self.environment}, status={self.status})>"