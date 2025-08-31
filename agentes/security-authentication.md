# 🔐 Agente Security/Authentication

## Perfil do Agente
**Nome**: Security & Authentication Specialist  
**Especialidade**: JWT, OAuth2, RBAC, Security Auditing, Compliance  
**Experiência**: 10+ anos Security Engineering, 6+ anos Authentication Systems, 8+ anos Compliance  

## Responsabilidades Principais

### 🛡️ Authentication & Authorization
- **JWT Token Management**: Geração, validação, refresh de tokens
- **OAuth2 Implementation**: Authorization code flow, PKCE
- **SSO Integration**: Google, Microsoft, Okta, SAML
- **Multi-Factor Authentication**: TOTP, SMS, Hardware keys
- **Session Management**: Secure session handling e timeout

### 🔑 Access Control Systems
- **RBAC Implementation**: Role-based access control
- **Multi-tenancy Security**: Data isolation entre organizações
- **API Key Management**: Geração, rotação, scoping de permissões
- **Permission Systems**: Granular permission management
- **Audit Logging**: Comprehensive security audit trails

### 🛡️ Application Security
- **Input Validation**: SQL injection, XSS prevention
- **Rate Limiting**: DDoS protection, abuse prevention
- **CORS Configuration**: Cross-origin resource sharing
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Encryption**: Data at rest e in transit

### 📋 Compliance & Governance
- **GDPR Compliance**: Data privacy, right to be forgotten
- **SOC2 Controls**: Security controls implementation
- **PCI DSS**: Payment data security (if applicable)
- **Security Assessments**: Penetration testing, vulnerability scans
- **Documentation**: Security policies e procedures

## Stack Tecnológica Principal

### 🛠️ Security Technologies
```python
# Authentication & JWT
python-jose[cryptography]==3.3.0    # JWT handling
passlib[bcrypt]==1.7.4               # Password hashing
pyotp==2.9.0                         # TOTP for 2FA
python-multipart==0.0.6              # File upload security

# OAuth2 & SSO
authlib==1.3.0                       # OAuth2 client
python-social-auth==0.3.6            # Social authentication
requests-oauthlib==1.3.1             # OAuth1/2 requests

# Security & Encryption
cryptography==41.0.8                 # Encryption utilities
secrets                              # Secure random generation (built-in)
hashlib                              # Hashing (built-in)

# Rate Limiting & Protection
slowapi==0.1.9                       # Rate limiting for FastAPI
python-limits==3.6.0                 # Advanced rate limiting

# Audit & Compliance
pydantic-extra-types==2.1.0          # Enhanced validation types
email-validator==2.1.0               # Email validation
```

### 🔐 JWT Authentication System
```python
# Advanced JWT implementation
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets

class JWTManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
            
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(32),  # JWT ID for revocation
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=30)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(32),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> Dict[Any, Any]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get("type") != token_type:
                raise JWTError("Invalid token type")
                
            # Check if token is blacklisted
            if self.is_token_blacklisted(payload.get("jti")):
                raise JWTError("Token has been revoked")
                
            return payload
        except JWTError:
            raise
    
    def revoke_token(self, jti: str):
        """Add token to blacklist"""
        # Store in Redis with expiration
        redis_client.setex(f"blacklist:{jti}", timedelta(days=30), "revoked")
    
    def is_token_blacklisted(self, jti: str) -> bool:
        """Check if token is blacklisted"""
        return redis_client.exists(f"blacklist:{jti}")
```

### 🔑 Advanced RBAC System
```python
# Role-based access control with permissions
from enum import Enum
from typing import Set, List
from functools import wraps

class Permission(str, Enum):
    # Organization permissions
    ORG_READ = "org:read"
    ORG_WRITE = "org:write" 
    ORG_DELETE = "org:delete"
    ORG_MANAGE_MEMBERS = "org:manage_members"
    
    # Project permissions
    PROJECT_READ = "project:read"
    PROJECT_WRITE = "project:write"
    PROJECT_DELETE = "project:delete"
    PROJECT_MANAGE_MEMBERS = "project:manage_members"
    
    # Model permissions
    MODEL_READ = "model:read"
    MODEL_WRITE = "model:write"
    MODEL_DELETE = "model:delete"
    MODEL_DEPLOY = "model:deploy"
    
    # Experiment permissions
    EXPERIMENT_READ = "experiment:read"
    EXPERIMENT_WRITE = "experiment:write"
    EXPERIMENT_DELETE = "experiment:delete"
    
    # Deployment permissions
    DEPLOYMENT_READ = "deployment:read"
    DEPLOYMENT_WRITE = "deployment:write"
    DEPLOYMENT_DELETE = "deployment:delete"
    DEPLOYMENT_MANAGE = "deployment:manage"
    
    # Monitoring permissions
    MONITORING_READ = "monitoring:read"
    MONITORING_WRITE = "monitoring:write"
    
    # Admin permissions
    ADMIN_READ = "admin:read"
    ADMIN_WRITE = "admin:write"

class Role(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"
    GUEST = "guest"

# Role-permission mapping
ROLE_PERMISSIONS: Dict[Role, Set[Permission]] = {
    Role.OWNER: {perm for perm in Permission},  # All permissions
    Role.ADMIN: {
        Permission.ORG_READ, Permission.ORG_WRITE, Permission.ORG_MANAGE_MEMBERS,
        Permission.PROJECT_READ, Permission.PROJECT_WRITE, Permission.PROJECT_DELETE, Permission.PROJECT_MANAGE_MEMBERS,
        Permission.MODEL_READ, Permission.MODEL_WRITE, Permission.MODEL_DELETE, Permission.MODEL_DEPLOY,
        Permission.EXPERIMENT_READ, Permission.EXPERIMENT_WRITE, Permission.EXPERIMENT_DELETE,
        Permission.DEPLOYMENT_READ, Permission.DEPLOYMENT_WRITE, Permission.DEPLOYMENT_DELETE, Permission.DEPLOYMENT_MANAGE,
        Permission.MONITORING_READ, Permission.MONITORING_WRITE
    },
    Role.DEVELOPER: {
        Permission.ORG_READ,
        Permission.PROJECT_READ, Permission.PROJECT_WRITE,
        Permission.MODEL_READ, Permission.MODEL_WRITE, Permission.MODEL_DEPLOY,
        Permission.EXPERIMENT_READ, Permission.EXPERIMENT_WRITE,
        Permission.DEPLOYMENT_READ, Permission.DEPLOYMENT_WRITE,
        Permission.MONITORING_READ
    },
    Role.VIEWER: {
        Permission.ORG_READ,
        Permission.PROJECT_READ,
        Permission.MODEL_READ,
        Permission.EXPERIMENT_READ,
        Permission.DEPLOYMENT_READ,
        Permission.MONITORING_READ
    },
    Role.GUEST: {
        Permission.PROJECT_READ,
        Permission.MODEL_READ,
        Permission.EXPERIMENT_READ
    }
}

class PermissionChecker:
    @staticmethod
    def has_permission(user_role: Role, required_permission: Permission) -> bool:
        return required_permission in ROLE_PERMISSIONS.get(user_role, set())
    
    @staticmethod
    def check_permissions(user_role: Role, required_permissions: List[Permission]) -> bool:
        user_permissions = ROLE_PERMISSIONS.get(user_role, set())
        return all(perm in user_permissions for perm in required_permissions)

# Permission decorator for FastAPI endpoints
def require_permissions(*permissions: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current user from dependency injection
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # Check permissions
            user_role = Role(current_user.role)
            if not PermissionChecker.check_permissions(user_role, list(permissions)):
                raise HTTPException(
                    status_code=403, 
                    detail=f"Insufficient permissions. Required: {[p.value for p in permissions]}"
                )
                
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage example
@router.delete("/models/{model_id}")
@require_permissions(Permission.MODEL_DELETE)
async def delete_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Implementation
    pass
```

## Especialidades Técnicas

### 🔒 Multi-Tenant Security
```python
# Multi-tenant data isolation middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class TenancyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract organization context from JWT or header
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        
        if token:
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                organization_id = payload.get("organization_id")
                user_id = payload.get("sub")
                
                # Set tenant context
                request.state.organization_id = organization_id
                request.state.user_id = user_id
                
                # Add to database session context
                request.state.tenant_filter = and_(
                    Model.organization_id == organization_id,
                    Model.deleted_at.is_(None)
                )
                
            except JWTError:
                # Invalid token - let auth middleware handle
                pass
        
        response = await call_next(request)
        return response

# Tenant-aware database queries
class TenantAwareRepository:
    def __init__(self, session: AsyncSession, organization_id: str):
        self.session = session
        self.organization_id = organization_id
    
    async def get_models(self, project_id: str) -> List[Model]:
        # Automatically filter by organization
        query = (
            select(Model)
            .where(
                and_(
                    Model.project_id == project_id,
                    Model.organization_id == self.organization_id,
                    Model.deleted_at.is_(None)
                )
            )
        )
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def create_model(self, model_data: dict) -> Model:
        # Automatically set organization_id
        model_data['organization_id'] = self.organization_id
        model = Model(**model_data)
        
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        
        return model
```

### 🔑 API Key Management System
```python
# Comprehensive API key management
import secrets
import hashlib
from typing import List, Optional
from datetime import datetime, timedelta

class APIKeyManager:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        
    def generate_api_key(self) -> tuple[str, str]:
        """Generate API key and return (key, hash)"""
        # Generate secure random key
        raw_key = f"mlops_{secrets.token_urlsafe(32)}"
        
        # Create hash for storage (never store raw key)
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        return raw_key, key_hash
    
    async def create_api_key(self, 
                           organization_id: str,
                           name: str,
                           permissions: Dict[str, List[str]],
                           expires_at: Optional[datetime] = None,
                           created_by: str = None) -> tuple[APIKey, str]:
        """Create new API key with permissions"""
        
        raw_key, key_hash = self.generate_api_key()
        
        api_key = APIKey(
            organization_id=organization_id,
            name=name,
            key_hash=key_hash,
            permissions=permissions,
            expires_at=expires_at or datetime.utcnow() + timedelta(days=365),
            created_by=created_by,
            last_used_at=None,
            usage_count=0,
            is_active=True
        )
        
        self.session.add(api_key)
        await self.session.commit()
        await self.session.refresh(api_key)
        
        # Log API key creation
        await self.log_security_event("api_key_created", {
            "api_key_id": api_key.id,
            "organization_id": organization_id,
            "created_by": created_by,
            "permissions": permissions
        })
        
        return api_key, raw_key
    
    async def validate_api_key(self, raw_key: str) -> Optional[APIKey]:
        """Validate API key and update usage stats"""
        if not raw_key or not raw_key.startswith("mlops_"):
            return None
            
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        # Find API key
        query = (
            select(APIKey)
            .where(
                and_(
                    APIKey.key_hash == key_hash,
                    APIKey.is_active == True,
                    or_(
                        APIKey.expires_at.is_(None),
                        APIKey.expires_at > datetime.utcnow()
                    )
                )
            )
        )
        
        result = await self.session.execute(query)
        api_key = result.scalar_one_or_none()
        
        if api_key:
            # Update usage statistics
            api_key.last_used_at = datetime.utcnow()
            api_key.usage_count += 1
            await self.session.commit()
            
        return api_key
    
    async def rotate_api_key(self, api_key_id: str, created_by: str) -> tuple[APIKey, str]:
        """Rotate API key (generate new key, deactivate old)"""
        
        # Get current API key
        current_key = await self.session.get(APIKey, api_key_id)
        if not current_key:
            raise ValueError("API key not found")
        
        # Create new key with same permissions
        new_key, raw_key = await self.create_api_key(
            organization_id=current_key.organization_id,
            name=f"{current_key.name} (rotated)",
            permissions=current_key.permissions,
            expires_at=current_key.expires_at,
            created_by=created_by
        )
        
        # Deactivate old key
        current_key.is_active = False
        current_key.rotated_to = new_key.id
        await self.session.commit()
        
        # Log rotation
        await self.log_security_event("api_key_rotated", {
            "old_key_id": api_key_id,
            "new_key_id": new_key.id,
            "rotated_by": created_by
        })
        
        return new_key, raw_key

# API Key authentication dependency
async def get_api_key_user(
    api_key: str = Depends(HTTPBearer()),
    db: AsyncSession = Depends(get_db)
) -> APIKey:
    """Validate API key and return associated key info"""
    
    key_manager = APIKeyManager(db)
    api_key_obj = await key_manager.validate_api_key(api_key.credentials)
    
    if not api_key_obj:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return api_key_obj
```

### 🛡️ Advanced Security Middleware
```python
# Security middleware stack
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Rate limiting configuration
limiter = Limiter(key_func=get_remote_address)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers.update({
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY", 
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        })
        
        return response

class SecurityAuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Extract request info
        request_info = {
            "method": request.method,
            "url": str(request.url),
            "user_agent": request.headers.get("user-agent"),
            "ip_address": get_remote_address(request),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Extract user info if authenticated
        if hasattr(request.state, 'user_id'):
            request_info.update({
                "user_id": request.state.user_id,
                "organization_id": request.state.organization_id
            })
        
        try:
            response = await call_next(request)
            
            # Log successful requests (high-value endpoints only)
            if self.should_audit_endpoint(request.url.path):
                request_info.update({
                    "status_code": response.status_code,
                    "response_time_ms": (time.time() - start_time) * 1000
                })
                await self.log_audit_event("api_request", request_info)
            
            return response
            
        except Exception as e:
            # Log all errors
            request_info.update({
                "status_code": 500,
                "error": str(e),
                "response_time_ms": (time.time() - start_time) * 1000
            })
            await self.log_audit_event("api_error", request_info)
            raise
    
    def should_audit_endpoint(self, path: str) -> bool:
        """Determine if endpoint should be audited"""
        audit_patterns = [
            "/api/v1/auth/",
            "/api/v1/organizations/",
            "/api/v1/models/",
            "/api/v1/deployments/",
            "/api/v1/api-keys/"
        ]
        return any(pattern in path for pattern in audit_patterns)
    
    async def log_audit_event(self, event_type: str, data: dict):
        """Log security audit event"""
        audit_log = AuditLog(
            event_type=event_type,
            data=data,
            timestamp=datetime.utcnow()
        )
        
        # Log to database and external SIEM if configured
        self.session.add(audit_log)
        await self.session.commit()
```

### 🔍 Security Scanning & Validation
```python
# Input validation and sanitization
from pydantic import validator, root_validator
import re
from typing import Dict, Any

class SecurityValidator:
    @staticmethod
    def validate_sql_injection(value: str) -> str:
        """Check for SQL injection patterns"""
        dangerous_patterns = [
            r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
            r'(--|/\*|\*/|;)',
            r'(\b(OR|AND)\s+\d+=\d+)',
            r'(\b(OR|AND)\s+[\'"].*[\'"])',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                raise ValueError("Potentially malicious input detected")
        
        return value
    
    @staticmethod
    def validate_xss(value: str) -> str:
        """Check for XSS patterns"""
        xss_patterns = [
            r'<script.*?>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe.*?>',
            r'<object.*?>',
            r'<embed.*?>'
        ]
        
        for pattern in xss_patterns:
            if re.search(pattern, value, re.IGNORECASE | re.DOTALL):
                raise ValueError("Potentially malicious input detected")
        
        return value
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize uploaded filenames"""
        # Remove path traversal attempts
        filename = os.path.basename(filename)
        
        # Remove dangerous characters
        filename = re.sub(r'[^\w\-_\.]', '', filename)
        
        # Ensure filename is not empty and has reasonable length
        if not filename or len(filename) > 255:
            raise ValueError("Invalid filename")
        
        return filename

# Enhanced Pydantic models with security validation
class SecureBaseModel(BaseModel):
    @validator('*', pre=True)
    def validate_strings(cls, v):
        if isinstance(v, str):
            # Apply security validations
            v = SecurityValidator.validate_sql_injection(v)
            v = SecurityValidator.validate_xss(v)
        return v

class CreateModelRequest(SecureBaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    model_type: str = Field(..., regex=r'^(classification|regression|clustering|llm)$')
    framework: str = Field(..., regex=r'^(scikit-learn|tensorflow|pytorch|xgboost|lightgbm)$')
    tags: List[str] = Field(default_factory=list, max_items=20)
    
    @validator('tags')
    def validate_tags(cls, v):
        for tag in v:
            if len(tag) > 50:
                raise ValueError("Tag too long")
            if not re.match(r'^[a-zA-Z0-9_-]+$', tag):
                raise ValueError("Tag contains invalid characters")
        return v
```

### 🔐 OAuth2 & SSO Integration
```python
# OAuth2 provider integration
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

class OAuthManager:
    def __init__(self):
        self.config = Config('.env')
        self.oauth = OAuth(self.config)
        
        # Register OAuth providers
        self.google = self.oauth.register(
            name='google',
            client_id=self.config('GOOGLE_CLIENT_ID'),
            client_secret=self.config('GOOGLE_CLIENT_SECRET'),
            server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
            client_kwargs={
                'scope': 'openid email profile'
            }
        )
        
        self.microsoft = self.oauth.register(
            name='microsoft',
            client_id=self.config('MICROSOFT_CLIENT_ID'),
            client_secret=self.config('MICROSOFT_CLIENT_SECRET'),
            authority=f"https://login.microsoftonline.com/{self.config('MICROSOFT_TENANT_ID')}",
            client_kwargs={'scope': 'openid profile email'}
        )
    
    async def handle_oauth_callback(self, provider: str, request: Request) -> dict:
        """Handle OAuth callback and create/update user"""
        
        if provider == 'google':
            client = self.google
        elif provider == 'microsoft':
            client = self.microsoft
        else:
            raise ValueError(f"Unknown provider: {provider}")
        
        # Exchange code for token
        token = await client.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            user_info = await client.parse_id_token(token)
        
        # Create or update user
        user = await self.get_or_create_oauth_user(user_info, provider)
        
        # Generate platform JWT
        jwt_manager = JWTManager(SECRET_KEY)
        access_token = jwt_manager.create_access_token({
            "sub": user.id,
            "email": user.email,
            "organization_id": user.current_organization_id
        })
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    
    async def get_or_create_oauth_user(self, user_info: dict, provider: str) -> User:
        """Get existing user or create new one from OAuth info"""
        
        email = user_info.get('email')
        if not email:
            raise ValueError("Email not provided by OAuth provider")
        
        # Check if user exists
        query = select(User).where(User.email == email)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        
        if user:
            # Update user info from OAuth
            user.first_name = user_info.get('given_name', user.first_name)
            user.last_name = user_info.get('family_name', user.last_name)
            user.avatar_url = user_info.get('picture', user.avatar_url)
            user.last_login_at = datetime.utcnow()
            
        else:
            # Create new user
            user = User(
                email=email,
                first_name=user_info.get('given_name', ''),
                last_name=user_info.get('family_name', ''),
                avatar_url=user_info.get('picture'),
                is_email_verified=True,  # OAuth emails are verified
                oauth_provider=provider,
                oauth_id=user_info.get('sub'),
                last_login_at=datetime.utcnow()
            )
            
            self.session.add(user)
        
        await self.session.commit()
        await self.session.refresh(user)
        
        return user
```

## Arquivos de Responsabilidade

### 📁 Security Architecture
```
backend/app/
├── core/
│   ├── security.py          # JWT management, password hashing
│   ├── permissions.py       # RBAC system
│   ├── config.py           # Security configuration
│   └── oauth.py            # OAuth2 providers
├── middleware/
│   ├── authentication.py   # Auth middleware
│   ├── tenancy.py          # Multi-tenant isolation
│   ├── rate_limit.py       # Rate limiting
│   ├── security_headers.py # Security headers
│   └── audit.py            # Security audit logging
├── models/
│   ├── user.py             # User model with security fields
│   ├── api_key.py          # API key management
│   ├── audit_log.py        # Security audit trails
│   └── session.py          # Session management
├── schemas/
│   ├── auth.py             # Authentication schemas
│   ├── security.py         # Security-related schemas
│   └── permissions.py      # Permission schemas
└── services/
    ├── auth_service.py      # Authentication business logic
    ├── permission_service.py # Permission checking
    ├── audit_service.py     # Audit logging service
    └── security_service.py  # General security utilities
```

## Expertise Areas

### 🔍 Security Monitoring & Incident Response
```python
# Security event monitoring
class SecurityMonitor:
    def __init__(self):
        self.suspicious_patterns = {
            'brute_force': {'threshold': 5, 'window': 300},  # 5 failed attempts in 5 minutes
            'unusual_access': {'threshold': 10, 'window': 3600},  # 10+ requests per hour from same IP
            'privilege_escalation': {'patterns': ['role_change', 'permission_grant']},
            'data_exfiltration': {'threshold': 1000, 'metric': 'download_size_mb'}
        }
    
    async def analyze_security_events(self, time_window: timedelta = timedelta(hours=1)) -> dict:
        """Analyze recent security events for threats"""
        
        since = datetime.utcnow() - time_window
        
        # Get recent audit logs
        query = (
            select(AuditLog)
            .where(AuditLog.timestamp >= since)
            .order_by(AuditLog.timestamp.desc())
        )
        
        result = await self.session.execute(query)
        events = result.scalars().all()
        
        threats = {
            'brute_force_attempts': self.detect_brute_force(events),
            'unusual_access_patterns': self.detect_unusual_access(events),
            'privilege_escalations': self.detect_privilege_escalation(events),
            'potential_data_exfiltration': self.detect_data_exfiltration(events)
        }
        
        return threats
    
    def detect_brute_force(self, events: List[AuditLog]) -> List[dict]:
        """Detect brute force login attempts"""
        login_failures = defaultdict(list)
        
        for event in events:
            if event.event_type == 'login_failed':
                ip = event.data.get('ip_address')
                if ip:
                    login_failures[ip].append(event.timestamp)
        
        # Check for suspicious patterns
        suspicious_ips = []
        for ip, timestamps in login_failures.items():
            if len(timestamps) >= self.suspicious_patterns['brute_force']['threshold']:
                time_span = (max(timestamps) - min(timestamps)).total_seconds()
                if time_span <= self.suspicious_patterns['brute_force']['window']:
                    suspicious_ips.append({
                        'ip_address': ip,
                        'attempt_count': len(timestamps),
                        'time_span_seconds': time_span,
                        'severity': 'high' if len(timestamps) > 10 else 'medium'
                    })
        
        return suspicious_ips
    
    async def block_suspicious_ip(self, ip_address: str, reason: str, duration: timedelta = timedelta(hours=24)):
        """Block suspicious IP address"""
        
        # Add to Redis blocklist
        redis_client.setex(f"blocked_ip:{ip_address}", int(duration.total_seconds()), reason)
        
        # Log security action
        await self.log_security_event("ip_blocked", {
            "ip_address": ip_address,
            "reason": reason,
            "duration_seconds": int(duration.total_seconds())
        })
        
        # Send alert to security team
        await self.send_security_alert("IP_BLOCKED", {
            "ip": ip_address,
            "reason": reason
        })

# IP blocking middleware
class IPBlockingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = get_remote_address(request)
        
        # Check if IP is blocked
        block_reason = redis_client.get(f"blocked_ip:{client_ip}")
        if block_reason:
            raise HTTPException(
                status_code=403,
                detail="Access denied: IP address blocked"
            )
        
        return await call_next(request)
```

### 🔐 Data Encryption & Privacy
```python
# Data encryption for sensitive fields
from cryptography.fernet import Fernet
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine

class DataEncryption:
    def __init__(self, encryption_key: str):
        self.fernet = Fernet(encryption_key.encode())
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.fernet.decrypt(encrypted_data.encode()).decode()

# GDPR compliance utilities
class GDPRCompliance:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
    
    async def export_user_data(self, user_id: str) -> dict:
        """Export all user data for GDPR compliance"""
        
        # Collect user data from all tables
        user_data = {
            'user_profile': await self.get_user_profile(user_id),
            'organizations': await self.get_user_organizations(user_id),
            'projects': await self.get_user_projects(user_id),
            'models': await self.get_user_models(user_id),
            'experiments': await self.get_user_experiments(user_id),
            'audit_logs': await self.get_user_audit_logs(user_id)
        }
        
        return user_data
    
    async def anonymize_user_data(self, user_id: str) -> bool:
        """Anonymize user data while preserving system integrity"""
        
        try:
            # Get user
            user = await self.session.get(User, user_id)
            if not user:
                return False
            
            # Anonymize personal data
            user.email = f"deleted_user_{user_id}@anonymized.com"
            user.first_name = "Deleted"
            user.last_name = "User"
            user.avatar_url = None
            user.phone = None
            user.is_active = False
            user.deleted_at = datetime.utcnow()
            
            # Anonymize audit logs
            audit_logs = await self.session.execute(
                select(AuditLog).where(AuditLog.data['user_id'].astext == user_id)
            )
            
            for log in audit_logs.scalars():
                if 'email' in log.data:
                    log.data['email'] = f"deleted_user_{user_id}@anonymized.com"
                if 'name' in log.data:
                    log.data['name'] = "Deleted User"
            
            await self.session.commit()
            
            # Log GDPR action
            await self.log_security_event("gdpr_anonymization", {
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return True
            
        except Exception as e:
            await self.session.rollback()
            raise e
```

## Protocolos de Segurança

### 📋 Security Standards
1. **Password Policy**: Minimum 12 characters, complexity requirements
2. **Token Expiration**: Access tokens 15min, refresh tokens 30 days
3. **Rate Limiting**: 100 requests/minute per IP, 1000/hour per user
4. **Input Validation**: All inputs validated and sanitized
5. **Audit Logging**: All security events logged and monitored

### 🚨 Incident Response
1. **Threat Detection**: Automated monitoring e alerting
2. **Incident Classification**: Severity levels e escalation
3. **Response Procedures**: Documented playbooks
4. **Communication**: Stakeholder notification protocols
5. **Recovery Plans**: Business continuity procedures

## Ferramentas de Trabalho

### 🛠️ Security Tools
- **Authentication**: Auth0, Okta, AWS Cognito
- **Vulnerability Scanning**: Snyk, OWASP ZAP, Bandit
- **Secret Management**: HashiCorp Vault, AWS Secrets Manager
- **SIEM**: Splunk, ELK Stack, AWS CloudTrail
- **Compliance**: Vanta, Drata, SecureFrame

### 🔍 Testing Tools
- **Security Testing**: OWASP Testing Guide, Burp Suite
- **Penetration Testing**: Metasploit, Nessus, OpenVAS
- **Code Analysis**: SonarQube, CodeQL, Semgrep
- **Dependency Scanning**: Safety, pip-audit, npm audit
- **Secrets Detection**: GitGuardian, TruffleHog

Este agente é responsável por garantir que a plataforma MLOps seja segura, compliant e protegida contra ameaças, implementando as melhores práticas de segurança em aplicações web modernas.