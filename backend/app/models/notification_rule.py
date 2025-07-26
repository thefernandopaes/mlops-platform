from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class NotificationRule(Base):
    __tablename__ = "notification_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    notification_channel_id = Column(UUID(as_uuid=True), ForeignKey("notification_channels.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    trigger_type = Column(String(50), nullable=False)  # alert, deployment_status, experiment_complete
    conditions = Column(JSONB, default=dict, nullable=False)  # Rule conditions
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="notification_rules")
    project = relationship("Project", back_populates="notification_rules")
    notification_channel = relationship("NotificationChannel", back_populates="notification_rules")
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<NotificationRule(id={self.id}, name={self.name}, trigger={self.trigger_type})>"