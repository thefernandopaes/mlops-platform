from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import Optional, Tuple
import uuid
import re

from app.models.user import User
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    verify_token
)
from app.schemas.auth import UserRegister, UserLogin, AuthResponse, UserResponse, Token
from app.core.config import settings

class AuthService:
    """Authentication service for user management and JWT operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _validate_password(self, password: str) -> None:
        """Validate password strength."""
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be at least 8 characters long"
            )
        
        if not re.search(r"[A-Za-z]", password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must contain at least one letter"
            )
        
        if not re.search(r"\d", password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must contain at least one number"
            )
    
    def _create_organization_slug(self, name: str) -> str:
        """Create a unique organization slug from name."""
        # Convert to lowercase, replace spaces with hyphens, remove special chars
        slug = re.sub(r'[^a-z0-9\-]', '', name.lower().replace(' ', '-'))
        
        # Ensure uniqueness
        base_slug = slug
        counter = 1
        while self.db.query(Organization).filter(Organization.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def register_user(self, user_data: UserRegister) -> AuthResponse:
        """Register a new user and optionally create an organization."""
        # Validate password
        self._validate_password(user_data.password)
        
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            User.email == user_data.email,
            User.deleted_at.is_(None)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        try:
            # Create user
            user = User(
                id=uuid.uuid4(),
                email=user_data.email,
                password_hash=get_password_hash(user_data.password),
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                is_active=True,
                is_verified=False  # Email verification can be implemented later
            )
            
            self.db.add(user)
            self.db.flush()  # Get user ID
            
            # Create organization if provided
            organization = None
            if user_data.organization_name:
                organization_slug = self._create_organization_slug(user_data.organization_name)
                organization = Organization(
                    id=uuid.uuid4(),
                    name=user_data.organization_name,
                    slug=organization_slug,
                    billing_email=user_data.email,
                    subscription_plan='starter',
                    subscription_status='active',
                    max_users=5,  # Starter plan limit
                    max_models=10
                )
                self.db.add(organization)
                self.db.flush()  # Get organization ID
                
                # Create organization membership
                membership = OrganizationMembership(
                    id=uuid.uuid4(),
                    organization_id=organization.id,
                    user_id=user.id,
                    role='admin'  # First user is admin
                )
                self.db.add(membership)
            
            self.db.commit()
            
            # Generate tokens
            token_data = {"sub": str(user.id)}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            # Create response
            user_response = UserResponse.from_orm(user)
            token_response = Token(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
            
            return AuthResponse(user=user_response, token=token_response)
            
        except IntegrityError as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User registration failed due to data conflict"
            )
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User registration failed"
            )
    
    def authenticate_user(self, login_data: UserLogin) -> AuthResponse:
        """Authenticate user and return tokens."""
        # Find user
        user = self.db.query(User).filter(
            User.email == login_data.email,
            User.deleted_at.is_(None)
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not user.password_hash or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        self.db.commit()
        
        # Generate tokens
        token_data = {"sub": str(user.id)}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Create response
        user_response = UserResponse.from_orm(user)
        token_response = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        return AuthResponse(user=user_response, token=token_response)
    
    def refresh_access_token(self, refresh_token: str) -> Token:
        """Refresh access token using refresh token."""
        # Verify refresh token
        payload = verify_token(refresh_token, "refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if user exists and is active
        user = self.db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None),
            User.is_active == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Generate new tokens
        token_data = {"sub": str(user.id)}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()
    
    def logout_user(self, user_id: str) -> bool:
        """Logout user (placeholder for token blacklisting)."""
        # In a production system, you would blacklist the tokens here
        # For now, we'll just return success
        # TODO: Implement token blacklisting with Redis
        return True