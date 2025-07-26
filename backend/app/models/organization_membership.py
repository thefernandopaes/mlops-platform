from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class OrganizationMembership(Base):
    __tablename__ = "organization_memberships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default='viewer', nullable=False)  # admin, developer, viewer
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="memberships")
    user = relationship("User", foreign_keys=[user_id], back_populates="organization_memberships")
    inviter = relationship("User", foreign_keys=[invited_by])
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('organization_id', 'user_id', name='unique_org_user_membership'),
    )
    
    def __repr__(self):
        return f"<OrganizationMembership(org={self.organization_id}, user={self.user_id}, role={self.role})>"