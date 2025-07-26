from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # model.create, deployment.update, etc.
    resource_type = Column(String(50), nullable=False)  # model, deployment, user
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSONB, default=dict, nullable=False)  # Action-specific details
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    user = relationship("User", foreign_keys=[user_id])
    api_key = relationship("ApiKey", back_populates="audit_logs")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_audit_logs_org_time', 'organization_id', 'created_at'),
        Index('idx_audit_logs_user_time', 'user_id', 'created_at'),
        Index('idx_audit_logs_resource', 'resource_type', 'resource_id'),
    )
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, resource={self.resource_type})>"