from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class ModelMonitoring(Base):
    __tablename__ = "model_monitoring"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String(100), nullable=False)  # accuracy, latency, throughput
    value = Column(Float, nullable=False)
    threshold_min = Column(Float, nullable=True)
    threshold_max = Column(Float, nullable=True)
    is_anomaly = Column(Boolean, default=False, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    deployment = relationship("Deployment", back_populates="model_monitoring")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_monitoring_deployment_time', 'deployment_id', 'recorded_at'),
        Index('idx_monitoring_deployment_metric', 'deployment_id', 'metric_name'),
    )
    
    def __repr__(self):
        return f"<ModelMonitoring(deployment={self.deployment_id}, metric={self.metric_name}, value={self.value})>"