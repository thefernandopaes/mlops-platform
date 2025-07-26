from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class NotificationChannel(Base):
    __tablename__ = "notification_channels"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    channel_type = Column(String(50), nullable=False)  # email, slack, webhook, sms
    config = Column(JSONB, default=dict, nullable=False)  # Channel-specific configuration
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="notification_channels")
    creator = relationship("User", foreign_keys=[created_by])
    notification_rules = relationship("NotificationRule", back_populates="notification_channel")
    
    def __repr__(self):
        return f"<NotificationChannel(id={self.id}, name={self.name}, type={self.channel_type})>"