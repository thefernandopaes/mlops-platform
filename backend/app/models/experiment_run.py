from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class ExperimentRun(Base):
    __tablename__ = "experiment_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_id = Column(UUID(as_uuid=True), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    run_name = Column(String(255), nullable=True)
    status = Column(String(50), default='running', nullable=False)  # running, completed, failed, cancelled
    parameters = Column(JSONB, default=dict, nullable=False)  # Hyperparameters for this run
    metrics = Column(JSONB, default=dict, nullable=False)  # Final metrics (accuracy, loss, etc.)
    artifacts = Column(JSONB, default=dict, nullable=False)  # Paths to artifacts (plots, models, etc.)
    logs = Column(Text, nullable=True)  # Training logs
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    experiment = relationship("Experiment", back_populates="runs")
    run_metrics = relationship("RunMetric", back_populates="run")
    
    def __repr__(self):
        return f"<ExperimentRun(id={self.id}, experiment={self.experiment_id}, status={self.status})>"