"""Add security and notifications tables

Revision ID: 004_security_notifications
Revises: 003_deployments_monitoring
Create Date: 2024-01-01 00:03:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_security_notifications'
down_revision = '003_deployments_monitoring'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create api_keys table
    op.create_table('api_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('key_hash', sa.String(length=255), nullable=False),
        sa.Column('key_prefix', sa.String(length=20), nullable=False),
        sa.Column('permissions', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key_hash')
    )
    
    # Create audit_logs table
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('api_key_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('resource_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['api_key_id'], ['api_keys.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create notification_channels table
    op.create_table('notification_channels',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('channel_type', sa.String(length=50), nullable=False),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create notification_rules table
    op.create_table('notification_rules',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notification_channel_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('trigger_type', sa.String(length=50), nullable=False),
        sa.Column('conditions', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['notification_channel_id'], ['notification_channels.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for performance
    op.create_index('idx_audit_logs_org_time', 'audit_logs', ['organization_id', 'created_at'])
    op.create_index('idx_audit_logs_user_time', 'audit_logs', ['user_id', 'created_at'])
    op.create_index('idx_audit_logs_resource', 'audit_logs', ['resource_type', 'resource_id'])


def downgrade() -> None:
    op.drop_index('idx_audit_logs_resource', table_name='audit_logs')
    op.drop_index('idx_audit_logs_user_time', table_name='audit_logs')
    op.drop_index('idx_audit_logs_org_time', table_name='audit_logs')
    op.drop_table('notification_rules')
    op.drop_table('notification_channels')
    op.drop_table('audit_logs')
    op.drop_table('api_keys')