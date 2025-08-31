"""
API Key Management endpoints.
Provides CRUD operations for API keys with proper security and audit logging.
"""

import secrets
import hashlib
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_

from app.core.deps import get_db, get_current_user
from app.core.security import verify_permissions
from app.models.user import User
from app.models.api_key import ApiKey
from app.models.audit_log import AuditLog
from app.schemas.api_key import (
    ApiKeyCreate,
    ApiKeyUpdate,
    ApiKeyResponse,
    ApiKeyListResponse,
    ApiKeyUsageResponse
)
from app.services.audit_service import AuditService


router = APIRouter()
audit_service = AuditService()


@router.post("/api-keys", response_model=ApiKeyResponse)
async def create_api_key(
    api_key_data: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new API key.
    
    Requires 'api_keys:create' permission.
    """
    # Check permissions
    if not verify_permissions(current_user, ["api_keys:create"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create API keys"
        )
    
    # Generate secure API key
    raw_key = _generate_api_key()
    key_hash = _hash_api_key(raw_key)
    key_prefix = raw_key[:8]  # First 8 characters for display
    
    # Set expiration if provided
    expires_at = None
    if api_key_data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=api_key_data.expires_in_days)
    
    # Create API key record
    db_api_key = ApiKey(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        name=api_key_data.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        permissions=api_key_data.permissions or {},
        expires_at=expires_at,
        is_active=True
    )
    
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    
    # Audit log
    await audit_service.log_action(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="api_key.created",
        resource_type="api_key",
        resource_id=str(db_api_key.id),
        details={
            "api_key_name": api_key_data.name,
            "permissions": api_key_data.permissions or {},
            "expires_at": expires_at.isoformat() if expires_at else None
        }
    )
    
    # Return response with the raw key (only time it's shown)
    response = ApiKeyResponse.from_orm(db_api_key)
    response.key = raw_key  # Include raw key in response
    return response


@router.get("/api-keys", response_model=ApiKeyListResponse)
async def list_api_keys(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List API keys for current user's organization.
    
    Requires 'api_keys:read' permission.
    """
    if not verify_permissions(current_user, ["api_keys:read"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to read API keys"
        )
    
    # Build query
    query = select(ApiKey).where(
        and_(
            ApiKey.organization_id == current_user.organization_id,
            ApiKey.deleted_at.is_(None)
        )
    )
    
    if not include_inactive:
        query = query.where(ApiKey.is_active == True)
    
    # Execute query with pagination
    query = query.offset(skip).limit(limit).order_by(ApiKey.created_at.desc())
    result = db.execute(query)
    api_keys = result.scalars().all()
    
    # Get total count
    count_query = select(ApiKey).where(
        and_(
            ApiKey.organization_id == current_user.organization_id,
            ApiKey.deleted_at.is_(None)
        )
    )
    if not include_inactive:
        count_query = count_query.where(ApiKey.is_active == True)
    
    total = len(db.execute(count_query).scalars().all())
    
    return ApiKeyListResponse(
        api_keys=[ApiKeyResponse.from_orm(key) for key in api_keys],
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/api-keys/{api_key_id}", response_model=ApiKeyResponse)
async def get_api_key(
    api_key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get specific API key details.
    
    Requires 'api_keys:read' permission.
    """
    if not verify_permissions(current_user, ["api_keys:read"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to read API keys"
        )
    
    # Get API key
    query = select(ApiKey).where(
        and_(
            ApiKey.id == api_key_id,
            ApiKey.organization_id == current_user.organization_id,
            ApiKey.deleted_at.is_(None)
        )
    )
    result = db.execute(query)
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return ApiKeyResponse.from_orm(api_key)


@router.put("/api-keys/{api_key_id}", response_model=ApiKeyResponse)
async def update_api_key(
    api_key_id: str,
    api_key_data: ApiKeyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update API key details.
    
    Requires 'api_keys:update' permission.
    """
    if not verify_permissions(current_user, ["api_keys:update"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update API keys"
        )
    
    # Get API key
    query = select(ApiKey).where(
        and_(
            ApiKey.id == api_key_id,
            ApiKey.organization_id == current_user.organization_id,
            ApiKey.deleted_at.is_(None)
        )
    )
    result = db.execute(query)
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Track changes for audit
    changes = {}
    
    # Update fields
    if api_key_data.name is not None:
        changes["name"] = {"old": api_key.name, "new": api_key_data.name}
        api_key.name = api_key_data.name
    
    if api_key_data.permissions is not None:
        changes["permissions"] = {"old": api_key.permissions, "new": api_key_data.permissions}
        api_key.permissions = api_key_data.permissions
    
    if api_key_data.is_active is not None:
        changes["is_active"] = {"old": api_key.is_active, "new": api_key_data.is_active}
        api_key.is_active = api_key_data.is_active
    
    if api_key_data.expires_in_days is not None:
        new_expires_at = datetime.utcnow() + timedelta(days=api_key_data.expires_in_days)
        changes["expires_at"] = {
            "old": api_key.expires_at.isoformat() if api_key.expires_at else None,
            "new": new_expires_at.isoformat()
        }
        api_key.expires_at = new_expires_at
    
    db.commit()
    db.refresh(api_key)
    
    # Audit log
    if changes:
        await audit_service.log_action(
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            action="api_key.updated",
            resource_type="api_key",
            resource_id=str(api_key.id),
            details={"changes": changes}
        )
    
    return ApiKeyResponse.from_orm(api_key)


@router.delete("/api-keys/{api_key_id}")
async def delete_api_key(
    api_key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete (soft delete) an API key.
    
    Requires 'api_keys:delete' permission.
    """
    if not verify_permissions(current_user, ["api_keys:delete"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete API keys"
        )
    
    # Get API key
    query = select(ApiKey).where(
        and_(
            ApiKey.id == api_key_id,
            ApiKey.organization_id == current_user.organization_id,
            ApiKey.deleted_at.is_(None)
        )
    )
    result = db.execute(query)
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Soft delete
    api_key.deleted_at = datetime.utcnow()
    api_key.is_active = False
    db.commit()
    
    # Audit log
    await audit_service.log_action(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="api_key.deleted",
        resource_type="api_key",
        resource_id=str(api_key.id),
        details={"api_key_name": api_key.name}
    )
    
    return {"message": "API key deleted successfully"}


@router.post("/api-keys/{api_key_id}/regenerate", response_model=ApiKeyResponse)
async def regenerate_api_key(
    api_key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Regenerate an existing API key (creates new key value).
    
    Requires 'api_keys:update' permission.
    """
    if not verify_permissions(current_user, ["api_keys:update"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to regenerate API keys"
        )
    
    # Get API key
    query = select(ApiKey).where(
        and_(
            ApiKey.id == api_key_id,
            ApiKey.organization_id == current_user.organization_id,
            ApiKey.deleted_at.is_(None)
        )
    )
    result = db.execute(query)
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Generate new key
    raw_key = _generate_api_key()
    key_hash = _hash_api_key(raw_key)
    key_prefix = raw_key[:8]
    
    # Update API key
    old_prefix = api_key.key_prefix
    api_key.key_hash = key_hash
    api_key.key_prefix = key_prefix
    api_key.last_used_at = None  # Reset usage tracking
    
    db.commit()
    db.refresh(api_key)
    
    # Audit log
    await audit_service.log_action(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="api_key.regenerated",
        resource_type="api_key",
        resource_id=str(api_key.id),
        details={
            "old_prefix": old_prefix,
            "new_prefix": key_prefix
        }
    )
    
    # Return response with new key
    response = ApiKeyResponse.from_orm(api_key)
    response.key = raw_key
    return response


@router.get("/api-keys/{api_key_id}/usage", response_model=ApiKeyUsageResponse)
async def get_api_key_usage(
    api_key_id: str,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get usage statistics for an API key.
    
    Requires 'api_keys:read' permission.
    """
    if not verify_permissions(current_user, ["api_keys:read"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to read API key usage"
        )
    
    # Get API key
    query = select(ApiKey).where(
        and_(
            ApiKey.id == api_key_id,
            ApiKey.organization_id == current_user.organization_id,
            ApiKey.deleted_at.is_(None)
        )
    )
    result = db.execute(query)
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Get usage statistics (this would integrate with your monitoring system)
    # For now, return basic information
    usage_stats = await _get_api_key_usage_stats(api_key_id, days)
    
    return ApiKeyUsageResponse(
        api_key_id=api_key_id,
        period_days=days,
        total_requests=usage_stats.get("total_requests", 0),
        successful_requests=usage_stats.get("successful_requests", 0),
        failed_requests=usage_stats.get("failed_requests", 0),
        last_used_at=api_key.last_used_at,
        usage_by_endpoint=usage_stats.get("usage_by_endpoint", {}),
        usage_by_day=usage_stats.get("usage_by_day", {})
    )


# Helper functions

def _generate_api_key() -> str:
    """Generate a secure API key."""
    # Generate 32 bytes of random data and encode as base64
    key_bytes = secrets.token_bytes(32)
    # Convert to hex for readability
    return f"mk_{secrets.token_hex(32)}"


def _hash_api_key(raw_key: str) -> str:
    """Hash API key for secure storage."""
    return hashlib.sha256(raw_key.encode()).hexdigest()


async def _get_api_key_usage_stats(api_key_id: str, days: int) -> dict:
    """
    Get usage statistics for API key from monitoring system.
    This would integrate with your metrics/monitoring infrastructure.
    """
    # Placeholder implementation
    # In real implementation, this would query Redis, InfluxDB, or similar
    return {
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "usage_by_endpoint": {},
        "usage_by_day": {}
    }


async def verify_api_key(key: str, db: Session) -> Optional[ApiKey]:
    """
    Verify API key and return ApiKey object if valid.
    
    Args:
        key: Raw API key to verify
        db: Database session
        
    Returns:
        ApiKey object if valid, None otherwise
    """
    if not key or not key.startswith("mk_"):
        return None
    
    key_hash = _hash_api_key(key)
    
    query = select(ApiKey).where(
        and_(
            ApiKey.key_hash == key_hash,
            ApiKey.is_active == True,
            ApiKey.deleted_at.is_(None),
            or_(
                ApiKey.expires_at.is_(None),
                ApiKey.expires_at > datetime.utcnow()
            )
        )
    )
    
    result = db.execute(query)
    api_key = result.scalar_one_or_none()
    
    if api_key:
        # Update last used timestamp
        api_key.last_used_at = datetime.utcnow()
        db.commit()
    
    return api_key