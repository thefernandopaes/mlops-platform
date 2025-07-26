from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class DeploymentHistory(Base):
    __tablename__ = "deployment_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    model_version_id = Column(UUID(as_uuid=True), ForeignKey("model_versions.id"), nullable=False)
    action = Column(String(50), nullable=False)  # deploy, update, rollback, terminate
    status = Column(String(50), nullable=False)  # pending, in_progress, completed, failed
    error_message = Column(Text, nullable=True)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    deployment = relationship("Deployment", back_populates="deployment_history")
    model_version = relationship("ModelVersion", back_populates="deployment_history")
    performer = relationship("User", foreign_keys=[performed_by])
    
    def __repr__(self):
        return f"<DeploymentHistory(id={self.id}, deployment={self.deployment_id}, action={self.action}, status={self.status})>"