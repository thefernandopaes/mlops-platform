from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid

# Authentication Request Schemas
class UserRegister(BaseModel):
    """User registration request schema."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    first_name: str = Field(..., min_length=1, max_length=100, description="User first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="User last name")
    organization_name: Optional[str] = Field(None, max_length=255, description="Organization name for new users")

class UserLogin(BaseModel):
    """User login request schema."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class TokenRefresh(BaseModel):
    """Token refresh request schema."""
    refresh_token: str = Field(..., description="Refresh token")

# Authentication Response Schemas
class Token(BaseModel):
    """Token response schema."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

class UserResponse(BaseModel):
    """User response schema."""
    id: uuid.UUID = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    avatar_url: Optional[str] = Field(None, description="User avatar URL")
    is_active: bool = Field(..., description="User active status")
    is_verified: bool = Field(..., description="User verification status")
    last_login_at: Optional[datetime] = Field(None, description="Last login timestamp")
    created_at: datetime = Field(..., description="User creation timestamp")

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    """Authentication response schema."""
    user: UserResponse = Field(..., description="User information")
    token: Token = Field(..., description="Authentication tokens")

# Standard API Response Schemas
class APIResponse(BaseModel):
    """Standard API response schema."""
    success: bool = Field(..., description="Request success status")
    data: Optional[dict] = Field(None, description="Response data")
    metadata: dict = Field(default_factory=dict, description="Response metadata")

class ErrorResponse(BaseModel):
    """Error response schema."""
    success: bool = Field(default=False, description="Request success status")
    error: dict = Field(..., description="Error information")
    metadata: dict = Field(default_factory=dict, description="Response metadata")