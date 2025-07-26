from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class RunMetric(Base):
    __tablename__ = "run_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("experiment_runs.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String(100), nullable=False)  # loss, accuracy, val_loss
    value = Column(Float, nullable=False)
    step = Column(Integer, default=0, nullable=False)  # Epoch or iteration
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    run = relationship("ExperimentRun", back_populates="run_metrics")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_run_metrics_lookup', 'run_id', 'metric_name', 'step'),
    )
    
    def __repr__(self):
        return f"<RunMetric(run={self.run_id}, metric={self.metric_name}, value={self.value}, step={self.step})>"