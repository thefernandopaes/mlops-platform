"""Add deployments and monitoring tables

Revision ID: 003_deployments_monitoring
Revises: 002_models_experiments
Create Date: 2024-01-01 00:02:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_deployments_monitoring'
down_revision = '002_models_experiments'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create deployments table
    op.create_table('deployments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('model_version_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('environment', sa.String(length=50), nullable=False),
        sa.Column('endpoint_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('instance_type', sa.String(length=100), nullable=False),
        sa.Column('min_instances', sa.Integer(), nullable=False),
        sa.Column('max_instances', sa.Integer(), nullable=False),
        sa.Column('auto_scaling', sa.Boolean(), nullable=False),
        sa.Column('deployment_config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('health_check_path', sa.String(length=255), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('terminated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['model_version_id'], ['model_versions.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'project_id', 'name', 'environment', name='unique_deployment_name_env')
    )
    
    # Create deployment_history table
    op.create_table('deployment_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('model_version_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('performed_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['deployment_id'], ['deployments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['model_version_id'], ['model_versions.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['performed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create model_monitoring table
    op.create_table('model_monitoring',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('threshold_min', sa.Float(), nullable=True),
        sa.Column('threshold_max', sa.Float(), nullable=True),
        sa.Column('is_anomaly', sa.Boolean(), nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['deployment_id'], ['deployments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create data_drift_reports table
    op.create_table('data_drift_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('drift_score', sa.Float(), nullable=False),
        sa.Column('drift_threshold', sa.Float(), nullable=False),
        sa.Column('is_drift_detected', sa.Boolean(), nullable=False),
        sa.Column('feature_drift', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('report_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['deployment_id'], ['deployments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create alerts table
    op.create_table('alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployment_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('alert_type', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('triggered_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('acknowledged_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['acknowledged_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['deployment_id'], ['deployments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for performance
    op.create_index('idx_monitoring_deployment_time', 'model_monitoring', ['deployment_id', 'recorded_at'])
    op.create_index('idx_monitoring_deployment_metric', 'model_monitoring', ['deployment_id', 'metric_name'])
    op.create_index('idx_drift_deployment_period', 'data_drift_reports', ['deployment_id', 'period_end'])
    op.create_index('idx_alerts_org_status', 'alerts', ['organization_id', 'status'])
    op.create_index('idx_alerts_deployment', 'alerts', ['deployment_id'])


def downgrade() -> None:
    op.drop_index('idx_alerts_deployment', table_name='alerts')
    op.drop_index('idx_alerts_org_status', table_name='alerts')
    op.drop_index('idx_drift_deployment_period', table_name='data_drift_reports')
    op.drop_index('idx_monitoring_deployment_metric', table_name='model_monitoring')
    op.drop_index('idx_monitoring_deployment_time', table_name='model_monitoring')
    op.drop_table('alerts')
    op.drop_table('data_drift_reports')
    op.drop_table('model_monitoring')
    op.drop_table('deployment_history')
    op.drop_table('deployments')