from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class DataDriftReport(Base):
    __tablename__ = "data_drift_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    drift_score = Column(Float, nullable=False)  # Overall drift score 0-1
    drift_threshold = Column(Float, default=0.1, nullable=False)
    is_drift_detected = Column(Boolean, nullable=False)
    feature_drift = Column(JSONB, default=dict, nullable=False)  # Per-feature drift scores
    report_data = Column(JSONB, default=dict, nullable=False)  # Full drift analysis
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    deployment = relationship("Deployment", back_populates="data_drift_reports")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_drift_deployment_period', 'deployment_id', 'period_end'),
    )
    
    def __repr__(self):
        return f"<DataDriftReport(deployment={self.deployment_id}, drift_score={self.drift_score}, detected={self.is_drift_detected})>"