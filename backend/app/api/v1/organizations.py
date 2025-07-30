from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_active_user, require_organization_access, require_organization_role
from app.models.user import User
from app.services.organization_service import OrganizationService
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationWithStats,
    OrganizationListResponse,
    OrganizationMemberCreate,
    OrganizationMemberUpdate,
    OrganizationMemberResponse,
    OrganizationMemberListResponse,
    UserInvitationCreate,
    UserInvitationResponse
)

router = APIRouter()

@router.get("/", response_model=OrganizationListResponse)
async def list_organizations(
    skip: int = Query(0, ge=0, description="Number of organizations to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of organizations to return"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List organizations where current user is a member."""
    service = OrganizationService(db)
    organizations, total = service.list_user_organizations(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    return OrganizationListResponse(
        organizations=organizations,
        total=total,
        page=skip // limit + 1,
        size=len(organizations)
    )

@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new organization with current user as admin."""
    service = OrganizationService(db)
    organization = service.create_organization(
        org_data=org_data,
        creator_user_id=current_user.id
    )
    
    return organization

@router.get("/{organization_id}", response_model=OrganizationWithStats)
async def get_organization(
    organization_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get organization by ID with statistics."""
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format"
        )
    
    # Check access
    await require_organization_access(organization_id)(current_user, db)
    
    service = OrganizationService(db)
    organization = service.get_organization(org_uuid)
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Get statistics and user role
    stats = service.get_organization_stats(org_uuid)
    user_role = service.get_user_role_in_organization(current_user.id, org_uuid)
    
    # Convert to response model
    org_dict = {
        "id": organization.id,
        "name": organization.name,
        "slug": organization.slug,
        "description": organization.description,
        "billing_email": organization.billing_email,
        "subscription_plan": organization.subscription_plan,
        "subscription_status": organization.subscription_status,
        "is_active": organization.is_active,
        "max_users": organization.max_users,
        "max_models": organization.max_models,
        "created_at": organization.created_at,
        "updated_at": organization.updated_at,
        "stats": stats,
        "current_user_role": user_role or "none"
    }
    
    return OrganizationWithStats(**org_dict)

@router.put("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: str,
    org_data: OrganizationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update organization details. Requires admin role."""
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format"
        )
    
    # Check admin access
    await require_organization_role(organization_id, "admin")(current_user, db)
    
    service = OrganizationService(db)
    organization = service.update_organization(org_uuid, org_data)
    
    return organization

@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    organization_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete organization. Requires admin role."""
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format"
        )
    
    # Check admin access
    await require_organization_role(organization_id, "admin")(current_user, db)
    
    service = OrganizationService(db)
    service.delete_organization(org_uuid)

# Organization Members Management

@router.get("/{organization_id}/members", response_model=OrganizationMemberListResponse)
async def list_organization_members(
    organization_id: str,
    skip: int = Query(0, ge=0, description="Number of members to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of members to return"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List organization members."""
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format"
        )
    
    # Check access
    await require_organization_access(organization_id)(current_user, db)
    
    service = OrganizationService(db)
    members, total = service.get_organization_members(
        organization_id=org_uuid,
        skip=skip,
        limit=limit
    )
    
    return OrganizationMemberListResponse(
        members=members,
        total=total,
        page=skip // limit + 1,
        size=len(members)
    )

@router.post("/{organization_id}/members", response_model=OrganizationMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_organization_member(
    organization_id: str,
    member_data: OrganizationMemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add user to organization. Requires admin role."""
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format"
        )
    
    # Check admin access
    await require_organization_role(organization_id, "admin")(current_user, db)
    
    service = OrganizationService(db)
    membership = service.add_organization_member(org_uuid, member_data)
    
    return membership

@router.put("/{organization_id}/members/{user_id}", response_model=OrganizationMemberResponse)
async def update_member_role(
    organization_id: str,
    user_id: str,
    role_data: OrganizationMemberUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update organization member role. Requires admin role."""
    try:
        org_uuid = uuid.UUID(organization_id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    # Check admin access
    await require_organization_role(organization_id, "admin")(current_user, db)
    
    service = OrganizationService(db)
    membership = service.update_member_role(org_uuid, user_uuid, role_data)
    
    return membership

@router.delete("/{organization_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_organization_member(
    organization_id: str,
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove user from organization. Requires admin role."""
    try:
        org_uuid = uuid.UUID(organization_id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    # Check admin access
    await require_organization_role(organization_id, "admin")(current_user, db)
    
    service = OrganizationService(db)
    service.remove_organization_member(org_uuid, user_uuid)

# User Invitation

@router.post("/{organization_id}/invite", response_model=UserInvitationResponse)
async def invite_user_to_organization(
    organization_id: str,
    invitation_data: UserInvitationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Invite user to organization by email. Requires admin role."""
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format"
        )
    
    # Check admin access
    await require_organization_role(organization_id, "admin")(current_user, db)
    
    service = OrganizationService(db)
    result = service.invite_user_by_email(org_uuid, invitation_data)
    
    return UserInvitationResponse(
        success=result["success"],
        message=result["message"],
        invited_email=result["invited_email"],
        role=result["role"]
    )