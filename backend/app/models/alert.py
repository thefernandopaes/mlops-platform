from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=True)
    alert_type = Column(String(50), nullable=False)  # performance_degradation, data_drift, high_latency, error_rate, custom
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default='open', nullable=False)  # open, acknowledged, resolved
    triggered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="alerts")
    deployment = relationship("Deployment", back_populates="alerts")
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    resolver = relationship("User", foreign_keys=[resolved_by])
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_alerts_org_status', 'organization_id', 'status'),
        Index('idx_alerts_deployment', 'deployment_id'),
    )
    
    def __repr__(self):
        return f"<Alert(id={self.id}, type={self.alert_type}, severity={self.severity}, status={self.status})>"