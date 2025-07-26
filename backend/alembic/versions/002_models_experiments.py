"""Add models and experiments tables

Revision ID: 002_models_experiments
Revises: 001_initial_schema
Create Date: 2024-01-01 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_models_experiments'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create models table
    op.create_table('models',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('model_type', sa.String(length=100), nullable=False),
        sa.Column('task_type', sa.String(length=100), nullable=False),
        sa.Column('framework', sa.String(length=100), nullable=False),
        sa.Column('tags', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create model_versions table
    op.create_table('model_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('model_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('stage', sa.String(length=50), nullable=False),
        sa.Column('model_file_path', sa.String(length=500), nullable=True),
        sa.Column('model_size_bytes', sa.BigInteger(), nullable=True),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('performance_metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('training_metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('model_schema', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['model_id'], ['models.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('model_id', 'version', name='unique_model_version')
    )
    
    # Create experiments table
    op.create_table('experiments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('model_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['model_id'], ['models.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create experiment_runs table
    op.create_table('experiment_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('experiment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_name', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('parameters', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('artifacts', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('logs', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['experiment_id'], ['experiments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create run_metrics table
    op.create_table('run_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('step', sa.Integer(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['experiment_runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_run_metrics_run_name', 'run_metrics', ['run_id', 'metric_name'])


def downgrade() -> None:
    op.drop_index('idx_run_metrics_run_name', table_name='run_metrics')
    op.drop_table('run_metrics')
    op.drop_table('experiment_runs')
    op.drop_table('experiments')
    op.drop_table('model_versions')
    op.drop_table('models')