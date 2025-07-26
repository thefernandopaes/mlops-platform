from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False)  # Hashed API key
    key_prefix = Column(String(20), nullable=False)  # First few chars for display
    permissions = Column(JSONB, default=dict, nullable=False)  # Scoped permissions
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="api_keys")
    user = relationship("User", back_populates="api_keys")
    audit_logs = relationship("AuditLog", back_populates="api_key")
    
    def __repr__(self):
        return f"<ApiKey(id={self.id}, name={self.name}, prefix={self.key_prefix})>"