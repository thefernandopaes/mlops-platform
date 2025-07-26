from sqlalchemy import Column, String, DateTime, ForeignKey, Text, BigInteger, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("models.id", ondelete="CASCADE"), nullable=False)
    version = Column(String(50), nullable=False)  # 1.0.0, 1.0.1, etc.
    stage = Column(String(50), default='development', nullable=False)  # development, staging, production, archived
    model_file_path = Column(String(500), nullable=False)  # S3/MinIO path
    model_size_bytes = Column(BigInteger, nullable=True)
    requirements = Column(Text, nullable=True)  # pip freeze output
    performance_metrics = Column(JSONB, default=dict, nullable=False)  # accuracy, precision, recall, etc.
    training_metrics = Column(JSONB, default=dict, nullable=False)  # loss, epochs, etc.
    model_schema = Column(JSONB, default=dict, nullable=False)  # input/output schema
    description = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    model = relationship("Model", back_populates="versions")
    creator = relationship("User", foreign_keys=[created_by])
    deployments = relationship("Deployment", back_populates="model_version")
    deployment_history = relationship("DeploymentHistory", back_populates="model_version")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('model_id', 'version', name='unique_model_version'),
    )
    
    def __repr__(self):
        return f"<ModelVersion(id={self.id}, model={self.model_id}, version={self.version})>"