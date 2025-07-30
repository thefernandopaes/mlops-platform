from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, and_
from fastapi import HTTPException, status
from typing import List, Optional, Tuple, Dict, Any
import uuid
import re
from datetime import datetime

from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership
from app.models.user import User
from app.models.project import Project
from app.models.model import Model
from app.models.experiment import Experiment
from app.models.deployment import Deployment
from app.schemas.organization import (
    OrganizationCreate, 
    OrganizationUpdate, 
    OrganizationMemberCreate,
    OrganizationMemberUpdate,
    UserInvitationCreate,
    OrganizationStats
)

class OrganizationService:
    """Service class for organization management operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _generate_slug(self, name: str) -> str:
        """Generate a unique slug from organization name."""
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
        slug = re.sub(r'[\s-]+', '-', slug).strip('-')
        
        # Ensure uniqueness
        base_slug = slug
        counter = 1
        while self.db.query(Organization).filter(Organization.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def create_organization(
        self, 
        org_data: OrganizationCreate, 
        creator_user_id: uuid.UUID
    ) -> Organization:
        """Create a new organization with the creator as admin."""
        try:
            # Generate unique slug
            slug = self._generate_slug(org_data.name)
            
            # Create organization
            organization = Organization(
                id=uuid.uuid4(),
                name=org_data.name,
                slug=slug,
                description=org_data.description,
                billing_email=org_data.billing_email,
                subscription_plan=org_data.subscription_plan or "starter",
                subscription_status="active",
                is_active=True,
                max_users=org_data.max_users or 5,
                max_models=org_data.max_models or 10
            )
            
            self.db.add(organization)
            self.db.flush()  # Get the organization ID
            
            # Add creator as admin
            membership = OrganizationMembership(
                id=uuid.uuid4(),
                user_id=creator_user_id,
                organization_id=organization.id,
                role="admin"
            )
            
            self.db.add(membership)
            self.db.commit()
            self.db.refresh(organization)
            
            return organization
            
        except IntegrityError as e:
            self.db.rollback()
            if "organizations_slug_key" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Organization with this name already exists"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create organization"
            )
    
    def get_organization(self, organization_id: uuid.UUID) -> Optional[Organization]:
        """Get organization by ID."""
        return self.db.query(Organization).filter(
            Organization.id == organization_id,
            Organization.deleted_at.is_(None)
        ).first()
    
    def get_organization_by_slug(self, slug: str) -> Optional[Organization]:
        """Get organization by slug."""
        return self.db.query(Organization).filter(
            Organization.slug == slug,
            Organization.deleted_at.is_(None)
        ).first()
    
    def list_user_organizations(
        self, 
        user_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> Tuple[List[Organization], int]:
        """List organizations where user is a member."""
        query = self.db.query(Organization).join(
            OrganizationMembership,
            Organization.id == OrganizationMembership.organization_id
        ).filter(
            OrganizationMembership.user_id == user_id,
            Organization.deleted_at.is_(None),
            OrganizationMembership.deleted_at.is_(None)
        ).order_by(Organization.name)
        
        total = query.count()
        organizations = query.offset(skip).limit(limit).all()
        
        return organizations, total
    
    def update_organization(
        self, 
        organization_id: uuid.UUID, 
        org_data: OrganizationUpdate
    ) -> Organization:
        """Update organization details."""
        organization = self.get_organization(organization_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        try:
            # Update fields if provided
            update_data = org_data.dict(exclude_unset=True)
            
            # Handle name change (regenerate slug)
            if 'name' in update_data:
                update_data['slug'] = self._generate_slug(update_data['name'])
            
            for field, value in update_data.items():
                setattr(organization, field, value)
            
            organization.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(organization)
            
            return organization
            
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this name already exists"
            )
    
    def delete_organization(self, organization_id: uuid.UUID) -> bool:
        """Soft delete organization."""
        organization = self.get_organization(organization_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Soft delete
        organization.deleted_at = datetime.utcnow()
        organization.is_active = False
        
        self.db.commit()
        return True
    
    def get_organization_members(
        self, 
        organization_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Get organization members with user details."""
        query = self.db.query(
            OrganizationMembership,
            User.email,
            User.first_name,
            User.last_name
        ).join(
            User, OrganizationMembership.user_id == User.id
        ).filter(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.deleted_at.is_(None),
            User.deleted_at.is_(None)
        ).order_by(OrganizationMembership.created_at)
        
        total = query.count()
        results = query.offset(skip).limit(limit).all()
        
        # Format response
        members = []
        for membership, email, first_name, last_name in results:
            member_data = {
                "id": membership.id,
                "user_id": membership.user_id,
                "organization_id": membership.organization_id,
                "role": membership.role,
                "created_at": membership.created_at,
                "updated_at": membership.updated_at,
                "user_email": email,
                "user_first_name": first_name,
                "user_last_name": last_name
            }
            members.append(member_data)
        
        return members, total
    
    def add_organization_member(
        self, 
        organization_id: uuid.UUID, 
        member_data: OrganizationMemberCreate
    ) -> OrganizationMembership:
        """Add a user to organization."""
        # Check if organization exists
        organization = self.get_organization(organization_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Check if user exists
        user = self.db.query(User).filter(
            User.id == member_data.user_id,
            User.deleted_at.is_(None)
        ).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is already a member
        existing_membership = self.db.query(OrganizationMembership).filter(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.user_id == member_data.user_id,
            OrganizationMembership.deleted_at.is_(None)
        ).first()
        
        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this organization"
            )
        
        # Check organization user limit
        current_members = self.db.query(OrganizationMembership).filter(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.deleted_at.is_(None)
        ).count()
        
        if current_members >= organization.max_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Organization has reached maximum user limit ({organization.max_users})"
            )
        
        try:
            membership = OrganizationMembership(
                id=uuid.uuid4(),
                user_id=member_data.user_id,
                organization_id=organization_id,
                role=member_data.role
            )
            
            self.db.add(membership)
            self.db.commit()
            self.db.refresh(membership)
            
            return membership
            
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add user to organization"
            )
    
    def update_member_role(
        self, 
        organization_id: uuid.UUID, 
        user_id: uuid.UUID, 
        role_data: OrganizationMemberUpdate
    ) -> OrganizationMembership:
        """Update organization member role."""
        membership = self.db.query(OrganizationMembership).filter(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.user_id == user_id,
            OrganizationMembership.deleted_at.is_(None)
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not a member of this organization"
            )
        
        # Update role
        if role_data.role:
            membership.role = role_data.role
            membership.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(membership)
        
        return membership
    
    def remove_organization_member(
        self, 
        organization_id: uuid.UUID, 
        user_id: uuid.UUID
    ) -> bool:
        """Remove user from organization."""
        membership = self.db.query(OrganizationMembership).filter(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.user_id == user_id,
            OrganizationMembership.deleted_at.is_(None)
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not a member of this organization"
            )
        
        # Check if this is the last admin
        admin_count = self.db.query(OrganizationMembership).filter(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.role == "admin",
            OrganizationMembership.deleted_at.is_(None)
        ).count()
        
        if membership.role == "admin" and admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last admin from organization"
            )
        
        # Soft delete membership
        membership.deleted_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def get_organization_stats(self, organization_id: uuid.UUID) -> OrganizationStats:
        """Get organization statistics."""
        # Count members
        total_members = self.db.query(OrganizationMembership).filter(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.deleted_at.is_(None)
        ).count()
        
        # Count projects
        total_projects = self.db.query(Project).filter(
            Project.organization_id == organization_id,
            Project.deleted_at.is_(None)
        ).count()
        
        # Count models
        total_models = self.db.query(Model).filter(
            Model.organization_id == organization_id,
            Model.deleted_at.is_(None)
        ).count()
        
        # Count experiments
        total_experiments = self.db.query(Experiment).filter(
            Experiment.organization_id == organization_id,
            Experiment.deleted_at.is_(None)
        ).count()
        
        # Count deployments
        total_deployments = self.db.query(Deployment).filter(
            Deployment.organization_id == organization_id,
            Deployment.deleted_at.is_(None)
        ).count()
        
        # Count active deployments
        active_deployments = self.db.query(Deployment).filter(
            Deployment.organization_id == organization_id,
            Deployment.status == "running",
            Deployment.deleted_at.is_(None)
        ).count()
        
        return OrganizationStats(
            total_members=total_members,
            total_projects=total_projects,
            total_models=total_models,
            total_experiments=total_experiments,
            total_deployments=total_deployments,
            active_deployments=active_deployments
        )
    
    def get_user_role_in_organization(
        self, 
        user_id: uuid.UUID, 
        organization_id: uuid.UUID
    ) -> Optional[str]:
        """Get user's role in organization."""
        membership = self.db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == user_id,
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.deleted_at.is_(None)
        ).first()
        
        return membership.role if membership else None
    
    def invite_user_by_email(
        self, 
        organization_id: uuid.UUID, 
        invitation_data: UserInvitationCreate
    ) -> Dict[str, Any]:
        """Invite user to organization by email."""
        # Check if organization exists
        organization = self.get_organization(organization_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            User.email == invitation_data.email,
            User.deleted_at.is_(None)
        ).first()
        
        if existing_user:
            # Check if already a member
            existing_membership = self.db.query(OrganizationMembership).filter(
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.user_id == existing_user.id,
                OrganizationMembership.deleted_at.is_(None)
            ).first()
            
            if existing_membership:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User is already a member of this organization"
                )
            
            # Add existing user to organization
            member_data = OrganizationMemberCreate(
                user_id=existing_user.id,
                role=invitation_data.role
            )
            self.add_organization_member(organization_id, member_data)
            
            return {
                "success": True,
                "message": "User added to organization successfully",
                "invited_email": invitation_data.email,
                "role": invitation_data.role,
                "user_exists": True
            }
        else:
            # TODO: Implement email invitation system for new users
            # For now, return a placeholder response
            return {
                "success": True,
                "message": "Invitation sent successfully (email system not implemented yet)",
                "invited_email": invitation_data.email,
                "role": invitation_data.role,
                "user_exists": False
            }