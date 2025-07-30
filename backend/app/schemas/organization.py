from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Organization Schemas
class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Organization name")
    description: Optional[str] = Field(None, max_length=1000, description="Organization description")
    billing_email: EmailStr = Field(..., description="Billing email address")

class OrganizationCreate(OrganizationBase):
    subscription_plan: Optional[str] = Field("starter", description="Subscription plan")
    max_users: Optional[int] = Field(5, ge=1, le=1000, description="Maximum number of users")
    max_models: Optional[int] = Field(10, ge=1, le=10000, description="Maximum number of models")

class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    billing_email: Optional[EmailStr] = None
    subscription_plan: Optional[str] = None
    max_users: Optional[int] = Field(None, ge=1, le=1000)
    max_models: Optional[int] = Field(None, ge=1, le=10000)

class OrganizationResponse(OrganizationBase):
    id: UUID
    slug: str
    subscription_plan: str
    subscription_status: str
    is_active: bool
    max_users: int
    max_models: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Organization Membership Schemas
class OrganizationMemberBase(BaseModel):
    role: str = Field(..., description="User role in organization")
    
    @validator('role')
    def validate_role(cls, v):
        valid_roles = ['admin', 'developer', 'viewer']
        if v not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v

class OrganizationMemberCreate(OrganizationMemberBase):
    user_id: UUID = Field(..., description="User ID to add to organization")

class OrganizationMemberUpdate(BaseModel):
    role: Optional[str] = None
    
    @validator('role')
    def validate_role(cls, v):
        if v is not None:
            valid_roles = ['admin', 'developer', 'viewer']
            if v not in valid_roles:
                raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v

class OrganizationMemberResponse(OrganizationMemberBase):
    id: UUID
    user_id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    
    # User information
    user_email: Optional[str] = None
    user_first_name: Optional[str] = None
    user_last_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# User Invitation Schemas
class UserInvitationCreate(BaseModel):
    email: EmailStr = Field(..., description="Email address to invite")
    role: str = Field("viewer", description="Role to assign to invited user")
    message: Optional[str] = Field(None, max_length=500, description="Optional invitation message")
    
    @validator('role')
    def validate_role(cls, v):
        valid_roles = ['admin', 'developer', 'viewer']
        if v not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v

class UserInvitationResponse(BaseModel):
    success: bool
    message: str
    invited_email: str
    role: str

# Organization Statistics Schema
class OrganizationStats(BaseModel):
    total_members: int
    total_projects: int
    total_models: int
    total_experiments: int
    total_deployments: int
    active_deployments: int
    
class OrganizationWithStats(OrganizationResponse):
    stats: OrganizationStats
    current_user_role: str

# List Response Schemas
class OrganizationListResponse(BaseModel):
    organizations: List[OrganizationResponse]
    total: int
    page: int
    size: int

class OrganizationMemberListResponse(BaseModel):
    members: List[OrganizationMemberResponse]
    total: int
    page: int
    size: int