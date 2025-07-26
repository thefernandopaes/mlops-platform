from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class ProjectMember(Base):
    __tablename__ = "project_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default='contributor', nullable=False)  # owner, contributor, viewer
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", foreign_keys=[user_id], back_populates="project_memberships")
    adder = relationship("User", foreign_keys=[added_by])
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='unique_project_user_membership'),
    )
    
    def __repr__(self):
        return f"<ProjectMember(project={self.project_id}, user={self.user_id}, role={self.role})>"