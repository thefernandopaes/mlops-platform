from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("models.id", ondelete="SET NULL"), nullable=True)  # Can be null for exploratory experiments
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default='running', nullable=False)  # running, completed, failed, cancelled
    config = Column(JSONB, default=dict, nullable=False)  # Hyperparameters and configuration
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="experiments")
    project = relationship("Project", back_populates="experiments")
    model = relationship("Model", back_populates="experiments")
    creator = relationship("User", foreign_keys=[created_by])
    runs = relationship("ExperimentRun", back_populates="experiment")
    
    def __repr__(self):
        return f"<Experiment(id={self.id}, name={self.name}, status={self.status})>"