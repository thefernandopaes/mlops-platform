# Database Schema Implementation

This directory contains the complete database schema implementation for the MLOps platform using SQLAlchemy and Alembic migrations.

## Overview

The database schema is designed with the following principles:
- **Multi-tenancy**: Organization-based isolation
- **Audit trails**: Created/updated/deleted timestamps and user tracking
- **Soft deletes**: Records are marked as deleted rather than physically removed
- **Normalization**: Proper relationships and foreign key constraints
- **Indexing**: Performance-optimized indexes for common queries
- **Constraints**: Data integrity through unique constraints and validations

## Database Tables

### Core Tables

1. **Organizations** - Multi-tenant organization management
2. **Users** - User accounts and authentication
3. **Organization Memberships** - User-organization relationships
4. **Projects** - Project management within organizations
5. **Project Members** - User-project relationships

### Model Registry

6. **Models** - ML model metadata and versioning
7. **Model Versions** - Specific versions of models with artifacts

### Experiment Tracking

8. **Experiments** - Experiment management and configuration
9. **Experiment Runs** - Individual experiment executions
10. **Run Metrics** - Time-series metrics for experiment runs

### Deployments & Serving

11. **Deployments** - Model deployment configurations
12. **Deployment History** - Deployment action history

### Monitoring & Observability

13. **Model Monitoring** - Real-time model performance metrics
14. **Data Drift Reports** - Data drift detection results
15. **Alerts** - System alerts and notifications

### Security & Audit

16. **API Keys** - API authentication and authorization
17. **Audit Logs** - Complete audit trail of system actions

### Notifications

18. **Notification Channels** - Communication channels (Slack, email, etc.)
19. **Notification Rules** - Automated notification triggers

## Migration Files

The database schema is implemented through Alembic migrations:

- `001_initial_schema.py` - Core tables (organizations, users, projects)
- `002_models_experiments.py` - Model registry and experiment tracking
- `003_deployments_monitoring.py` - Deployments and monitoring
- `004_security_notifications.py` - Security and notification features

## Setup Instructions

### Prerequisites

1. PostgreSQL database running
2. Python environment with required dependencies
3. Database connection configured in `alembic.ini`

### Running Migrations

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run all migrations
alembic upgrade head

# Check migration status
alembic current

# View migration history
alembic history
```

### Creating Sample Data

For development and testing, you can populate the database with sample data:

```bash
# Run the seed data script
python scripts/seed_data.py
```

This creates:
- Sample organization "Acme ML Corp"
- 3 users (admin, data scientist, ML engineer)
- 2 projects (Fraud Detection, Product Recommendations)
- 2 models with versions
- Sample experiments and deployments
- API keys and notification channels

### Sample Data Details

**Organization**: Acme ML Corp
- Admin user: `admin@acme-ml.com` / `admin123`
- Data Scientist: `scientist@acme-ml.com` / `scientist123`
- ML Engineer: `engineer@acme-ml.com` / `engineer123`

**Projects**:
- Fraud Detection (XGBoost classification model)
- Product Recommendations (TensorFlow collaborative filtering)

## Database Configuration

Update your database connection in `alembic.ini`:

```ini
sqlalchemy.url = postgresql://username:password@localhost:5432/mlops_platform
```

Or use environment variables:
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/mlops_platform"
```

## Model Relationships

The schema implements comprehensive relationships:

- Organizations contain Users, Projects, Models, Deployments
- Projects belong to Organizations and contain Models, Experiments
- Models have Versions and belong to Projects
- Experiments track model training and belong to Projects
- Deployments serve Model Versions and belong to Projects
- All entities have proper audit trails and soft delete support

## Indexes and Performance

Key indexes are created for:
- Organization and project lookups
- User authentication and authorization
- Model and experiment queries
- Monitoring and metrics time-series data
- Audit log searches

## Security Features

- Password hashing for user authentication
- API key management with scoped permissions
- Comprehensive audit logging
- IP address and user agent tracking
- Soft deletes for data retention

## Next Steps

After running the migrations:

1. **Authentication System** - Implement JWT-based authentication
2. **API Endpoints** - Create REST API for all entities
3. **Model Registry** - Build model upload and versioning system
4. **Experiment Tracking** - Implement MLflow-compatible tracking
5. **Deployment Pipeline** - Create automated deployment workflows
6. **Monitoring Dashboard** - Build real-time monitoring interface

## Troubleshooting

### Common Issues

1. **Migration Conflicts**: If you encounter migration conflicts, check the revision chain
2. **Database Permissions**: Ensure your database user has CREATE/ALTER permissions
3. **Connection Issues**: Verify your database connection string and credentials

### Rollback Migrations

```bash
# Rollback to specific revision
alembic downgrade <revision_id>

# Rollback one migration
alembic downgrade -1

# Rollback all migrations
alembic downgrade base
```

### Reset Database

```bash
# Drop all tables and re-run migrations
alembic downgrade base
alembic upgrade head
python scripts/seed_data.py
```