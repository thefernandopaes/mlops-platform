# MLOps Platform - API Design Document

## Overview

This document defines the REST API endpoints for the MLOps platform. All APIs follow RESTful principles, use JSON for data exchange, and implement consistent error handling and authentication patterns.

## API Design Principles

- **RESTful**: Standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Consistent**: Uniform response format and error handling
- **Versioned**: API versioning via URL path (`/api/v1/`)
- **Secure**: JWT-based authentication with RBAC
- **Paginated**: Large result sets use cursor-based pagination
- **Documented**: OpenAPI 3.0 specification

## Base URL & Versioning

```
Base URL: https://api.mlops-platform.com/api/v1/
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

## Common Response Formats

### Success Response Format
```json
{
  "success": true,
  "data": {}, // or []
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Pagination Response Format
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "has_next": true,
    "has_prev": false,
    "next_cursor": "eyJpZCI6IjEyMyJ9"
  }
}
```

## Authentication & Authorization

### Authentication Endpoints

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "current_organization": {
        "id": "org_456",
        "name": "Acme Corp",
        "role": "developer"
      }
    }
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

#### POST /auth/logout
Invalidate current session.

#### GET /auth/me
Get current user information.

## Organization Management

### GET /organizations
List organizations where user is a member.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org_123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "role": "admin",
      "subscription_plan": "professional",
      "member_count": 15,
      "model_count": 42,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /organizations
Create new organization.

### GET /organizations/{org_id}
Get organization details.

### PUT /organizations/{org_id}
Update organization settings.

### DELETE /organizations/{org_id}
Delete organization (admin only).

## User Management

### GET /organizations/{org_id}/users
List organization members.

**Query Parameters:**
- `role`: Filter by role (`admin`, `developer`, `viewer`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "developer",
      "avatar_url": "https://...",
      "last_login_at": "2024-01-15T09:00:00Z",
      "joined_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "has_next": false,
    "has_prev": false
  }
}
```

### POST /organizations/{org_id}/users/invite
Invite user to organization.

### PUT /organizations/{org_id}/users/{user_id}/role
Update user role in organization.

### DELETE /organizations/{org_id}/users/{user_id}
Remove user from organization.

## Project Management

### GET /organizations/{org_id}/projects
List projects in organization.

**Query Parameters:**
- `visibility`: Filter by visibility (`private`, `organization`, `public`)
- `search`: Search in name and description
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "Fraud Detection",
      "description": "Credit card fraud detection models",
      "slug": "fraud-detection",
      "visibility": "private",
      "model_count": 3,
      "experiment_count": 25,
      "deployment_count": 2,
      "created_by": {
        "id": "user_123",
        "name": "John Doe"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /organizations/{org_id}/projects
Create new project.

**Request:**
```json
{
  "name": "Recommendation Engine",
  "description": "Product recommendation models",
  "visibility": "private"
}
```

### GET /projects/{project_id}
Get project details.

### PUT /projects/{project_id}
Update project.

### DELETE /projects/{project_id}
Delete project.

### GET /projects/{project_id}/members
List project members.

### POST /projects/{project_id}/members
Add member to project.

### PUT /projects/{project_id}/members/{user_id}
Update member role in project.

### DELETE /projects/{project_id}/members/{user_id}
Remove member from project.

## Model Registry

### GET /projects/{project_id}/models
List models in project.

**Query Parameters:**
- `model_type`: Filter by type (`classification`, `regression`, `llm`)
- `framework`: Filter by framework (`scikit-learn`, `tensorflow`, `pytorch`)
- `tags[]`: Filter by tags
- `search`: Search in name and description
- `sort`: Sort by (`name`, `created_at`, `updated_at`)
- `order`: Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "model_123",
      "name": "Credit Card Fraud Detector",
      "description": "XGBoost model for fraud detection",
      "model_type": "classification",
      "framework": "xgboost",
      "task_type": "binary_classification",
      "tags": ["fraud", "finance", "production"],
      "version_count": 5,
      "latest_version": {
        "version": "1.2.0",
        "stage": "production",
        "performance_metrics": {
          "accuracy": 0.947,
          "precision": 0.923,
          "recall": 0.889
        }
      },
      "created_by": {
        "id": "user_123",
        "name": "John Doe"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /projects/{project_id}/models
Create new model.

**Request:**
```json
{
  "name": "Churn Prediction Model",
  "description": "Predicts customer churn probability",
  "model_type": "classification",
  "framework": "scikit-learn",
  "task_type": "binary_classification",
  "tags": ["churn", "customer", "retention"]
}
```

### GET /models/{model_id}
Get model details.

### PUT /models/{model_id}
Update model metadata.

### DELETE /models/{model_id}
Delete model and all versions.

## Model Versions

### GET /models/{model_id}/versions
List model versions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "version_123",
      "version": "1.2.0",
      "stage": "production",
      "model_file_path": "s3://models/fraud-detector/1.2.0/model.pkl",
      "model_size_bytes": 2048576,
      "performance_metrics": {
        "accuracy": 0.947,
        "precision": 0.923,
        "recall": 0.889,
        "f1_score": 0.906
      },
      "training_metrics": {
        "training_loss": 0.123,
        "validation_loss": 0.145,
        "epochs": 100
      },
      "model_schema": {
        "inputs": [
          {"name": "amount", "type": "float", "description": "Transaction amount"},
          {"name": "merchant_category", "type": "string", "description": "Merchant category code"}
        ],
        "outputs": [
          {"name": "fraud_probability", "type": "float", "description": "Probability of fraud"}
        ]
      },
      "created_by": {
        "id": "user_123",
        "name": "John Doe"
      },
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /models/{model_id}/versions
Upload new model version.

**Request (multipart/form-data):**
```
model_file: [binary file]
version: "1.3.0"
stage: "development"
description: "Improved feature engineering"
performance_metrics: {"accuracy": 0.951}
requirements: "scikit-learn==1.3.0\npandas==2.0.0"
```

### GET /models/{model_id}/versions/{version}
Get specific model version.

### PUT /models/{model_id}/versions/{version}/stage
Update model version stage.

**Request:**
```json
{
  "stage": "production",
  "description": "Promoting to production after successful testing"
}
```

### DELETE /models/{model_id}/versions/{version}
Delete model version.

## Experiments & Tracking

### GET /projects/{project_id}/experiments
List experiments in project.

**Query Parameters:**
- `status`: Filter by status (`running`, `completed`, `failed`)
- `model_id`: Filter by associated model
- `created_by`: Filter by creator
- `search`: Search in name and description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "exp_123",
      "name": "Hyperparameter Tuning v3",
      "description": "Grid search for optimal parameters",
      "status": "completed",
      "model_id": "model_123",
      "run_count": 25,
      "best_run": {
        "id": "run_456",
        "metrics": {
          "accuracy": 0.951,
          "val_accuracy": 0.943
        }
      },
      "created_by": {
        "id": "user_123",
        "name": "John Doe"
      },
      "started_at": "2024-01-15T08:00:00Z",
      "completed_at": "2024-01-15T10:30:00Z",
      "duration_seconds": 9000
    }
  ]
}
```

### POST /projects/{project_id}/experiments
Create new experiment.

**Request:**
```json
{
  "name": "Feature Engineering Experiment",
  "description": "Testing new feature combinations",
  "model_id": "model_123",
  "config": {
    "max_depth": [3, 5, 7],
    "learning_rate": [0.01, 0.1, 0.2],
    "n_estimators": [100, 200, 300]
  }
}
```

### GET /experiments/{experiment_id}
Get experiment details.

### PUT /experiments/{experiment_id}
Update experiment.

### DELETE /experiments/{experiment_id}
Delete experiment and all runs.

### GET /experiments/{experiment_id}/runs
List experiment runs.

### POST /experiments/{experiment_id}/runs
Create new experiment run.

**Request:**
```json
{
  "run_name": "run_001",
  "parameters": {
    "max_depth": 5,
    "learning_rate": 0.1,
    "n_estimators": 200
  }
}
```

### GET /experiments/{experiment_id}/runs/{run_id}
Get experiment run details.

### PUT /experiments/{experiment_id}/runs/{run_id}/status
Update run status.

### POST /experiments/{experiment_id}/runs/{run_id}/metrics
Log metrics for run.

**Request:**
```json
{
  "metrics": [
    {
      "name": "accuracy",
      "value": 0.945,
      "step": 100
    },
    {
      "name": "loss",
      "value": 0.123,
      "step": 100
    }
  ]
}
```

### POST /experiments/{experiment_id}/runs/{run_id}/artifacts
Upload artifacts for run.

**Request (multipart/form-data):**
```
file: [binary file]
artifact_type: "plot" | "model" | "data" | "other"
description: "Confusion matrix visualization"
```

## Deployments

### GET /projects/{project_id}/deployments
List deployments in project.

**Query Parameters:**
- `environment`: Filter by environment (`development`, `staging`, `production`)
- `status`: Filter by status (`active`, `inactive`, `failed`)
- `model_id`: Filter by model

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deploy_123",
      "name": "fraud-api-prod",
      "environment": "production",
      "status": "active",
      "endpoint_url": "https://api.mlops-platform.com/inference/fraud-api-prod",
      "model_version": {
        "id": "version_123",
        "model_name": "Credit Card Fraud Detector",
        "version": "1.2.0"
      },
      "instance_type": "medium",
      "min_instances": 2,
      "max_instances": 10,
      "current_instances": 3,
      "health_status": "healthy",
      "deployed_at": "2024-01-15T10:00:00Z",
      "last_request_at": "2024-01-15T10:25:00Z",
      "request_count_24h": 15420
    }
  ]
}
```

### POST /projects/{project_id}/deployments
Create new deployment.

**Request:**
```json
{
  "name": "churn-api-staging",
  "model_version_id": "version_456",
  "environment": "staging",
  "instance_type": "small",
  "min_instances": 1,
  "max_instances": 3,
  "auto_scaling": true,
  "deployment_config": {
    "env_vars": {
      "MODEL_THRESHOLD": "0.5"
    },
    "resource_limits": {
      "memory": "2Gi",
      "cpu": "1000m"
    }
  }
}
```

### GET /deployments/{deployment_id}
Get deployment details.

### PUT /deployments/{deployment_id}
Update deployment configuration.

### DELETE /deployments/{deployment_id}
Terminate deployment.

### POST /deployments/{deployment_id}/rollback
Rollback to previous version.

**Request:**
```json
{
  "target_version_id": "version_123",
  "reason": "Performance issues with current version"
}
```

### GET /deployments/{deployment_id}/logs
Get deployment logs.

**Query Parameters:**
- `since`: Start time (ISO 8601)
- `until`: End time (ISO 8601)
- `level`: Log level (`error`, `warn`, `info`, `debug`)
- `limit`: Number of log entries

### GET /deployments/{deployment_id}/metrics
Get deployment metrics.

**Query Parameters:**
- `metric_names[]`: Specific metrics to retrieve
- `start_time`: Start time (ISO 8601)
- `end_time`: End time (ISO 8601)
- `granularity`: Time granularity (`1m`, `5m`, `1h`, `1d`)

## Model Inference

### POST /inference/{deployment_name}
Make prediction using deployed model.

**Request:**
```json
{
  "instances": [
    {
      "amount": 1250.00,
      "merchant_category": "grocery",
      "time_of_day": 14,
      "day_of_week": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "fraud_probability": 0.023,
      "prediction": "not_fraud",
      "confidence": 0.977
    }
  ],
  "model_info": {
    "model_id": "model_123",
    "version": "1.2.0",
    "prediction_id": "pred_789"
  },
  "metadata": {
    "latency_ms": 45,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### POST /inference/{deployment_name}/batch
Batch prediction for multiple instances.

### GET /inference/{deployment_name}/health
Health check for deployment.

### GET /inference/{deployment_name}/schema
Get model input/output schema.

## Monitoring & Observability

### GET /deployments/{deployment_id}/monitoring/metrics
Get performance metrics for deployment.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_metrics": {
      "accuracy": 0.943,
      "latency_p95": 120,
      "throughput_rps": 45.2,
      "error_rate": 0.002
    },
    "time_series": [
      {
        "timestamp": "2024-01-15T10:00:00Z",
        "accuracy": 0.945,
        "latency_p95": 115,
        "throughput_rps": 42.1
      }
    ]
  }
}
```

### GET /deployments/{deployment_id}/monitoring/drift
Get data drift analysis.

### POST /deployments/{deployment_id}/monitoring/alerts
Create monitoring alert.

**Request:**
```json
{
  "alert_type": "performance_degradation",
  "metric_name": "accuracy",
  "threshold": 0.90,
  "operator": "less_than",
  "severity": "high",
  "notification_channels": ["channel_123", "channel_456"]
}
```

### GET /organizations/{org_id}/alerts
List alerts for organization.

### PUT /alerts/{alert_id}/acknowledge
Acknowledge alert.

### PUT /alerts/{alert_id}/resolve
Resolve alert.

## API Keys & Security

### GET /organizations/{org_id}/api-keys
List API keys for organization.

### POST /organizations/{org_id}/api-keys
Create new API key.

**Request:**
```json
{
  "name": "Production API Key",
  "permissions": {
    "inference": ["read"],
    "models": ["read"],
    "deployments": ["read"]
  },
  "expires_at": "2025-01-15T00:00:00Z"
}
```

### PUT /api-keys/{key_id}
Update API key.

### DELETE /api-keys/{key_id}
Delete API key.

### GET /organizations/{org_id}/audit-logs
Get audit logs for organization.

## File Upload & Management

### POST /upload/models
Upload model file.

### POST /upload/datasets
Upload dataset file.

### GET /files/{file_id}/download
Download file.

### DELETE /files/{file_id}
Delete file.

## Webhooks

### GET /organizations/{org_id}/webhooks
List webhooks.

### POST /organizations/{org_id}/webhooks
Create webhook.

**Request:**
```json
{
  "name": "Deployment Notifications",
  "url": "https://example.com/webhooks/mlops",
  "events": ["deployment.created", "deployment.updated", "alert.triggered"],
  "secret": "webhook_secret_123"
}
```

### PUT /webhooks/{webhook_id}
Update webhook.

### DELETE /webhooks/{webhook_id}
Delete webhook.

### POST /webhooks/{webhook_id}/test
Test webhook delivery.

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid authentication |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

- **Free Tier**: 100 requests/hour
- **Professional**: 10,000 requests/hour
- **Enterprise**: Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9850
X-RateLimit-Reset: 1642248000
```

## API Client Libraries

Official SDKs available for:
- **Python**: `pip install mlops-platform-sdk`
- **JavaScript/Node.js**: `npm install mlops-platform-sdk`
- **R**: `install.packages("mlops.platform")`

## OpenAPI Specification

Complete OpenAPI 3.0 specification available at:
- **JSON**: `/api/v1/openapi.json`
- **YAML**: `/api/v1/openapi.yaml`
- **Interactive Docs**: `/docs` (Swagger UI)
- **ReDoc**: `/redoc`

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2025-07-23 | Initial API release |

This API design provides a comprehensive foundation for the MLOps platform with proper REST conventions, authentication, and extensibility.