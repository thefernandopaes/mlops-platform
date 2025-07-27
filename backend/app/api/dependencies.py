from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.models.organization_membership import OrganizationMembership
from typing import Optional
import uuid

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token, "access")
    
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_organization_access(organization_id: str):
    """Dependency to ensure user has access to organization."""
    async def _check_access(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ):
        # Convert string to UUID if needed
        try:
            org_uuid = uuid.UUID(organization_id) if isinstance(organization_id, str) else organization_id
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid organization ID format"
            )
        
        # Check if user belongs to the organization
        membership = db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == current_user.id,
            OrganizationMembership.organization_id == org_uuid
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this organization"
            )
        
        return current_user
    return _check_access

def require_organization_role(organization_id: str, required_role: str = "viewer"):
    """Dependency to ensure user has specific role in organization."""
    async def _check_role(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ):
        # Convert string to UUID if needed
        try:
            org_uuid = uuid.UUID(organization_id) if isinstance(organization_id, str) else organization_id
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid organization ID format"
            )
        
        # Check if user has required role in the organization
        membership = db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == current_user.id,
            OrganizationMembership.organization_id == org_uuid
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this organization"
            )
        
        # Role hierarchy: admin > developer > viewer
        role_hierarchy = {"admin": 3, "developer": 2, "viewer": 1}
        user_role_level = role_hierarchy.get(membership.role, 0)
        required_role_level = role_hierarchy.get(required_role, 0)
        
        if user_role_level < required_role_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        
        return current_user
    return _check_role