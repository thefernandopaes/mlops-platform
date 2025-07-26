from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    billing_email = Column(String(255), nullable=False)
    subscription_plan = Column(String(50), default='starter', nullable=False)  # starter, professional, enterprise
    subscription_status = Column(String(50), default='active', nullable=False)  # active, inactive, suspended
    max_users = Column(Integer, default=1, nullable=False)
    max_models = Column(Integer, default=2, nullable=False)
    settings = Column(JSONB, default=dict, nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    memberships = relationship("OrganizationMembership", back_populates="organization")
    projects = relationship("Project", back_populates="organization")
    models = relationship("Model", back_populates="organization")
    experiments = relationship("Experiment", back_populates="organization")
    deployments = relationship("Deployment", back_populates="organization")
    api_keys = relationship("ApiKey", back_populates="organization")
    alerts = relationship("Alert", back_populates="organization")
    notification_channels = relationship("NotificationChannel", back_populates="organization")
    notification_rules = relationship("NotificationRule", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")
    
    def __repr__(self):
        return f"<Organization(id={self.id}, name={self.name})>"