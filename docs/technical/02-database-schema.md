# MLOps Platform - Database Schema Design

## Overview

This document defines the complete database schema for the MLOps platform using PostgreSQL as the primary database. The schema is designed to support multi-tenancy, RBAC, and comprehensive MLOps workflows.

## Schema Principles

- **Multi-tenancy**: All entities are scoped to organizations
- **Audit Trail**: Created/updated timestamps and user tracking
- **Soft Deletes**: Use `deleted_at` instead of hard deletes
- **Normalization**: 3NF with strategic denormalization for performance
- **Indexing**: Strategic indexes for query performance
- **Constraints**: Foreign keys and check constraints for data integrity

## Core Tables

### 1. Users & Organizations

```sql
-- Organizations table (Multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    billing_email VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
    max_users INTEGER DEFAULT 1,
    max_models INTEGER DEFAULT 2,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- NULL for SSO users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Organization memberships (Many-to-many)
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'developer', 'viewer')),
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
```

### 2. Projects & Workspaces

```sql
-- Projects (Workspace for organizing models and experiments)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'organization', 'public')),
    settings JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(organization_id, slug)
);

-- Project members (who can access the project)
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'contributor' CHECK (role IN ('owner', 'contributor', 'viewer')),
    added_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);
```

### 3. Models & Registry

```sql
-- Model registry
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(100) NOT NULL, -- 'classification', 'regression', 'llm', 'custom'
    framework VARCHAR(100) NOT NULL, -- 'scikit-learn', 'tensorflow', 'pytorch', 'xgboost'
    task_type VARCHAR(100), -- 'binary_classification', 'multiclass', 'regression', 'text_generation'
    tags TEXT[], -- Array of tags
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(organization_id, project_id, name)
);

-- Model versions
CREATE TABLE model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL, -- '1.0.0', '1.0.1', etc.
    stage VARCHAR(50) DEFAULT 'development' CHECK (stage IN ('development', 'staging', 'production', 'archived')),
    model_file_path VARCHAR(500) NOT NULL, -- S3/MinIO path
    model_size_bytes BIGINT,
    requirements TEXT, -- pip freeze output
    performance_metrics JSONB DEFAULT '{}', -- accuracy, precision, recall, etc.
    training_metrics JSONB DEFAULT '{}', -- loss, epochs, etc.
    model_schema JSONB DEFAULT '{}', -- input/output schema
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(model_id, version)
);
```

### 4. Experiments & Tracking

```sql
-- Experiments
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE SET NULL, -- Can be null for exploratory experiments
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    config JSONB DEFAULT '{}', -- Hyperparameters and configuration
    created_by UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Experiment runs (individual training runs within an experiment)
CREATE TABLE experiment_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    run_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    parameters JSONB DEFAULT '{}', -- Hyperparameters for this run
    metrics JSONB DEFAULT '{}', -- Final metrics (accuracy, loss, etc.)
    artifacts JSONB DEFAULT '{}', -- Paths to artifacts (plots, models, etc.)
    logs TEXT, -- Training logs
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time-series metrics for runs (for plotting training curves)
CREATE TABLE run_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES experiment_runs(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- 'loss', 'accuracy', 'val_loss'
    value DOUBLE PRECISION NOT NULL,
    step INTEGER NOT NULL DEFAULT 0, -- Epoch or iteration
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX(run_id, metric_name, step)
);
```

### 5. Deployments & Serving

```sql
-- Model deployments
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    model_version_id UUID NOT NULL REFERENCES model_versions(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    environment VARCHAR(50) NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
    endpoint_url VARCHAR(500), -- Generated API endpoint
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'active', 'inactive', 'failed', 'terminating')),
    instance_type VARCHAR(100) DEFAULT 'small', -- 'small', 'medium', 'large', 'gpu'
    min_instances INTEGER DEFAULT 1,
    max_instances INTEGER DEFAULT 10,
    auto_scaling BOOLEAN DEFAULT true,
    deployment_config JSONB DEFAULT '{}', -- Environment variables, resource limits, etc.
    health_check_path VARCHAR(255) DEFAULT '/health',
    created_by UUID NOT NULL REFERENCES users(id),
    deployed_at TIMESTAMP WITH TIME ZONE,
    terminated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(organization_id, project_id, name, environment)
);

-- Deployment history (for rollbacks)
CREATE TABLE deployment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    model_version_id UUID NOT NULL REFERENCES model_versions(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('deploy', 'update', 'rollback', 'terminate')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message TEXT,
    performed_by UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Monitoring & Observability

```sql
-- Model performance monitoring
CREATE TABLE model_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- 'accuracy', 'latency', 'throughput'
    value DOUBLE PRECISION NOT NULL,
    threshold_min DOUBLE PRECISION,
    threshold_max DOUBLE PRECISION,
    is_anomaly BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX(deployment_id, metric_name, recorded_at)
);

-- Data drift detection
CREATE TABLE data_drift_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    drift_score DOUBLE PRECISION NOT NULL, -- Overall drift score 0-1
    drift_threshold DOUBLE PRECISION DEFAULT 0.1,
    is_drift_detected BOOLEAN NOT NULL,
    feature_drift JSONB DEFAULT '{}', -- Per-feature drift scores
    report_data JSONB DEFAULT '{}', -- Full drift analysis
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX(deployment_id, period_end)
);

-- Alerts and notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('performance_degradation', 'data_drift', 'high_latency', 'error_rate', 'custom')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. API Keys & Security

```sql
-- API keys for programmatic access
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE, -- Hashed API key
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for display
    permissions JSONB DEFAULT '{}', -- Scoped permissions
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Audit log for security and compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'model.create', 'deployment.update', etc.
    resource_type VARCHAR(50) NOT NULL, -- 'model', 'deployment', 'user'
    resource_id UUID,
    details JSONB DEFAULT '{}', -- Action-specific details
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX(organization_id, created_at),
    INDEX(user_id, created_at),
    INDEX(resource_type, resource_id)
);
```

### 8. Notifications & Integrations

```sql
-- Notification channels (Slack, email, webhooks)
CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'slack', 'teams', 'webhook')),
    configuration JSONB NOT NULL, -- Channel-specific config (webhook URL, Slack token, etc.)
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Notification rules (when to send notifications)
CREATE TABLE notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL = organization-wide
    deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE, -- NULL = project-wide
    channel_id UUID NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('alert', 'deployment', 'model_update', 'experiment_complete')),
    conditions JSONB DEFAULT '{}', -- When to trigger
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_models_org_project ON models(organization_id, project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_model_versions_stage ON model_versions(model_id, stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_deployments_org_status ON deployments(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_experiments_project ON experiments(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_run_metrics_lookup ON run_metrics(run_id, metric_name, step);
CREATE INDEX idx_monitoring_deployment_time ON model_monitoring(deployment_id, recorded_at);
CREATE INDEX idx_audit_logs_org_time ON audit_logs(organization_id, created_at);
CREATE INDEX idx_alerts_org_status ON alerts(organization_id, status);

-- Full-text search indexes
CREATE INDEX idx_models_search ON models USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_experiments_search ON experiments USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

## Sample Data Relationships

```sql
-- Example: Organization → Project → Model → Versions → Deployment
Organization "Acme Corp" 
  └── Project "Fraud Detection"
      └── Model "Credit Card Fraud Model"
          ├── Version "1.0.0" (Production)
          ├── Version "1.1.0" (Staging)
          └── Version "1.2.0" (Development)
              └── Deployment "fraud-api-prod"
                  ├── Monitoring Data
                  ├── Alerts
                  └── Performance Metrics
```

## Database Migration Strategy

1. **Version Control**: Use Alembic for schema migrations
2. **Backward Compatibility**: Always maintain backward compatibility
3. **Zero Downtime**: Design migrations to run without downtime
4. **Rollback Plan**: Every migration must have a rollback strategy

## Data Retention Policies

- **Audit Logs**: Retain for 2 years, then archive
- **Metrics**: Keep detailed metrics for 90 days, aggregated for 1 year
- **Experiments**: Keep indefinitely unless explicitly deleted
- **Model Artifacts**: Retain for 1 year after model retirement

## Security Considerations

- **Encryption**: Sensitive fields encrypted at application level
- **Row Level Security**: Consider RLS for additional isolation
- **Connection Pooling**: Use PgBouncer for connection management
- **Backup Strategy**: Daily backups with point-in-time recovery

This schema provides a solid foundation for the MLOps platform with proper normalization, performance optimization, and audit capabilities.