# TRAE and Cursor Rules - MLOps Platform Development Guidelines

## Project Overview
You are developing an MLOps platform - a "Netflix for AI Models" that provides end-to-end machine learning lifecycle management. This is a SaaS platform with multi-tenant architecture, focusing on model development, deployment, monitoring, and governance.

## Core Architecture Rules

### NEVER CHANGE THESE FUNDAMENTALS:
- **Backend**: Python + FastAPI + SQLAlchemy + PostgreSQL + Redis
- **Frontend**: React + TypeScript + Next.js + Tailwind CSS
- **Infrastructure**: Docker + Kubernetes + MinIO/S3
- **Database**: PostgreSQL with multi-tenant design (organization-scoped)
- **Authentication**: JWT-based with refresh tokens
- **API Design**: RESTful with `/api/v1/` versioning

### NEVER USE THESE TECHNOLOGIES:
- ❌ Prisma (use SQLAlchemy only)
- ❌ MongoDB or NoSQL (PostgreSQL only for main data)
- ❌ Express.js or Node.js backend (Python FastAPI only)
- ❌ localStorage/sessionStorage in artifacts (use React state)
- ❌ Different CSS frameworks (Tailwind CSS only)

## Database Schema Rules

### ALWAYS FOLLOW:
- **Multi-tenancy**: Every entity MUST be scoped to `organization_id`
- **Soft deletes**: Use `deleted_at` timestamp, NEVER hard delete
- **Audit trail**: Include `created_at`, `updated_at`, `created_by` 
- **UUIDs**: All primary keys use UUID, never integers
- **Foreign keys**: Proper relationships with CASCADE/RESTRICT
- **Indexes**: Performance indexes for query patterns

### NEVER MODIFY:
- Core table structures from the schema design
- Multi-tenant isolation patterns
- Existing foreign key relationships
- UUID primary key strategy

```sql
-- ALWAYS use this pattern for new tables:
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- other fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

## API Design Rules

### ALWAYS FOLLOW:
- **Base URL**: `/api/v1/` for all endpoints
- **Authentication**: Bearer JWT token required (except auth endpoints)
- **Response format**: Consistent JSON structure
- **HTTP methods**: Standard REST (GET, POST, PUT, PATCH, DELETE)
- **Pagination**: Cursor-based for large datasets
- **Error handling**: Standard error codes and messages

### REQUIRED RESPONSE FORMAT:
```json
// Success
{
  "success": true,
  "data": {},
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### NEVER CREATE:
- Endpoints without authentication middleware
- APIs that bypass multi-tenant isolation
- Different response formats than specified
- APIs without proper error handling

## Frontend Development Rules

### ALWAYS USE:
- **React hooks**: useState, useEffect, useContext, useMemo
- **TypeScript**: Strict typing for all components and functions
- **Tailwind CSS**: Utility-first styling approach
- **React Query**: For API state management and caching
- **Context API**: For global state (auth, organization)
- **Component patterns**: Reusable, composable components

### DESIGN PRINCIPLES:
- **Responsive**: Mobile-first design approach
- **Loading states**: Show loading spinners/skeletons
- **Error boundaries**: Graceful error handling
- **Accessibility**: ARIA labels, keyboard navigation
- **Professional UI**: Clean, modern, enterprise-ready

### NEVER USE:
- Class components (functional components only)
- Inline styles (Tailwind classes only)
- Global CSS (component-scoped or Tailwind only)
- Direct API calls (use React Query hooks)

## Security & Authentication Rules

### ALWAYS IMPLEMENT:
- **JWT validation**: Verify tokens on all protected routes
- **RBAC**: Role-based access control (Admin, Developer, Viewer)
- **Multi-tenant isolation**: Data scoped to user's organization
- **Input validation**: Sanitize all user inputs
- **API rate limiting**: Prevent abuse
- **Audit logging**: Track all user actions

### NEVER SKIP:
- Authentication checks on protected routes
- Authorization validation for user actions
- Input sanitization and validation
- Audit trail logging for sensitive operations

## File Structure Rules

### BACKEND STRUCTURE:
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── organizations.py
│   │   │   ├── projects.py
│   │   │   ├── models.py
│   │   │   ├── experiments.py
│   │   │   └── deployments.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── organization.py
│   │   ├── project.py
│   │   └── model.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── model_service.py
│   │   └── deployment_service.py
│   └── utils/
├── alembic/
└── tests/
```

### FRONTEND STRUCTURE:
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── models/
│   │   └── deployments/
│   ├── hooks/
│   ├── contexts/
│   ├── utils/
│   └── types/
```

### NEVER CHANGE:
- The established folder structure
- Import patterns and conventions
- File naming conventions

## MLOps Feature Rules

### CORE FEATURES (MVP ONLY):
1. **Model Registry**: Model upload, versioning, metadata
2. **Experiment Tracking**: Runs, metrics, artifacts, comparison
3. **Deployment Pipeline**: One-click deploy, staging/prod environments
4. **Monitoring**: Performance metrics, data drift detection
5. **User Management**: Organizations, projects, RBAC

### NEVER ADD WITHOUT APPROVAL:
- Features not in MVP scope (advanced analytics, complex ML pipelines)
- Third-party integrations beyond specified (MLflow, cloud providers)
- Complex ML algorithms or custom training logic
- Advanced governance features (approval workflows, compliance)

## Integration Rules

### REQUIRED INTEGRATIONS:
- **MLflow**: For experiment tracking and model registry
- **Cloud Storage**: MinIO (local) or S3 (production)
- **Container Registry**: Docker Hub or cloud registry
- **Kubernetes**: For model deployment orchestration

### INTEGRATION PATTERNS:
```python
# ALWAYS use service layer for external integrations
class MLflowService:
    def __init__(self):
        self.client = mlflow.tracking.MlflowClient()
    
    def create_experiment(self, name: str, organization_id: str):
        # Implementation with proper error handling
        pass
```

### NEVER INTEGRATE:
- Services not approved in architecture (Airflow is optional)
- External APIs without proper error handling
- Services that bypass our authentication
- Third-party services that store sensitive data

## Error Handling Rules

### ALWAYS IMPLEMENT:
- **Try-catch blocks**: For all external API calls
- **Validation**: Input validation with clear error messages
- **Logging**: Structured logging with correlation IDs
- **Graceful degradation**: Fallbacks for non-critical features
- **User feedback**: Clear error messages for users

### ERROR HANDLING PATTERN:
```python
# Backend
from app.core.exceptions import ValidationError, NotFoundError

@router.post("/models")
async def create_model(model_data: ModelCreate):
    try:
        model = await model_service.create_model(model_data)
        return {"success": True, "data": model}
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

```typescript
// Frontend
const { data, error, isLoading } = useQuery({
  queryKey: ['models', projectId],
  queryFn: () => apiClient.getModels(projectId),
  onError: (error) => {
    toast.error(error.message || 'Failed to load models');
  }
});
```

## Testing Rules

### ALWAYS WRITE TESTS FOR:
- **API endpoints**: Request/response validation
- **Service functions**: Business logic testing
- **Database models**: Relationship and constraint testing
- **Authentication**: Login, permissions, token validation
- **Core user flows**: End-to-end critical paths

### TEST PATTERNS:
```python
# Backend tests
import pytest
from fastapi.testclient import TestClient

def test_create_model_success(client: TestClient, auth_headers):
    response = client.post(
        "/api/v1/models",
        json={"name": "Test Model", "type": "classification"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["success"] is True
```

```typescript
// Frontend tests
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelForm } from './ModelForm';

test('should submit model form with valid data', async () => {
  render(<ModelForm onSubmit={mockSubmit} />);
  fireEvent.change(screen.getByLabelText('Model Name'), {
    target: { value: 'Test Model' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create Model' }));
  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'Test Model'
  });
});
```

## Performance Rules

### ALWAYS OPTIMIZE:
- **Database queries**: Use indexes, avoid N+1 queries
- **API responses**: Pagination for large datasets
- **Frontend bundles**: Code splitting, lazy loading
- **Caching**: Redis for frequently accessed data
- **Images**: Optimize and compress all images

### PERFORMANCE PATTERNS:
```python
# Use select_related for foreign keys
models = session.query(Model).options(
    selectinload(Model.versions),
    selectinload(Model.project)
).filter(Model.organization_id == org_id).all()
```

```typescript
// Lazy load heavy components
const ModelChart = lazy(() => import('./ModelChart'));
```

## Documentation Rules

### ALWAYS DOCUMENT:
- **API endpoints**: OpenAPI/Swagger documentation
- **Functions**: Docstrings with parameters and return types
- **Components**: PropTypes and usage examples
- **Configuration**: Environment variables and setup
- **Deployment**: Step-by-step deployment guide

### DOCUMENTATION PATTERNS:
```python
def create_model(
    name: str, 
    model_type: str, 
    organization_id: str
) -> Model:
    """
    Create a new ML model in the registry.
    
    Args:
        name: Human-readable model name
        model_type: Type of model (classification, regression, etc.)
        organization_id: UUID of the owning organization
        
    Returns:
        Model: Created model instance
        
    Raises:
        ValidationError: If model name already exists
        PermissionError: If user lacks create permissions
    """
    pass
```

## Code Quality Rules

### ALWAYS FOLLOW:
- **PEP 8**: Python code style guidelines
- **ESLint**: JavaScript/TypeScript linting rules
- **Type hints**: Full typing for Python and TypeScript
- **DRY principle**: Don't repeat yourself
- **SOLID principles**: Clean architecture patterns

### CODE REVIEW CHECKLIST:
- [ ] Follows established patterns and conventions
- [ ] Includes proper error handling
- [ ] Has appropriate test coverage
- [ ] Implements security best practices
- [ ] Maintains performance standards
- [ ] Includes necessary documentation

## Deployment Rules

### ENVIRONMENT CONFIGURATION:
- **Development**: Local Docker Compose
- **Staging**: Kubernetes cluster with test data
- **Production**: Kubernetes cluster with real data
- **CI/CD**: Automated testing and deployment

### NEVER DEPLOY:
- Code without passing tests
- Features without proper documentation
- Changes that break existing functionality
- Code with security vulnerabilities
- Performance regressions

## Final Guidelines

### WHEN IN DOUBT:
1. **Refer to existing code patterns** in the project
2. **Check the API design document** for endpoint specifications
3. **Follow the database schema** for data models
4. **Stick to MVP scope** - don't add extra features
5. **Ask for clarification** rather than making assumptions

### EMERGENCY STOPS:
If asked to implement anything that:
- ❌ Changes core architecture decisions
- ❌ Adds features outside MVP scope
- ❌ Bypasses security measures
- ❌ Uses forbidden technologies
- ❌ Breaks existing functionality

**STOP and ask for explicit confirmation before proceeding.**

Remember: You're building an enterprise-grade MLOps platform. Quality, security, and maintainability are more important than speed.