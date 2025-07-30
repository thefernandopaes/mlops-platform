from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Model(Base):
    __tablename__ = "models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    model_type = Column(String(100), nullable=False)  # classification, regression, llm, custom
    framework = Column(String(100), nullable=False)  # scikit-learn, tensorflow, pytorch, xgboost
    task_type = Column(String(100), nullable=True)  # binary_classification, multiclass, regression, text_generation
    tags = Column(ARRAY(Text), default=list, nullable=False)
    model_metadata = Column(JSONB, default=dict, nullable=False)
    
    # Multi-tenant
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="models")
    project = relationship("Project", back_populates="models")
    creator = relationship("User", foreign_keys=[created_by])
    versions = relationship("ModelVersion", back_populates="model")
    experiments = relationship("Experiment", back_populates="model")
    
    def __repr__(self):
        return f"<Model(id={self.id}, name={self.name})>"