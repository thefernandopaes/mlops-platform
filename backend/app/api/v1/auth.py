from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_active_user
from app.services.auth_service import AuthService
from app.schemas.auth import (
    UserRegister, 
    UserLogin, 
    TokenRefresh, 
    AuthResponse, 
    Token, 
    APIResponse
)
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    Creates a new user account and optionally a new organization if organization_name is provided.
    Returns user information and authentication tokens.
    """
    auth_service = AuthService(db)
    
    try:
        auth_response = auth_service.register_user(user_data)
        
        return APIResponse(
            success=True,
            data={
                "user": auth_response.user.dict(),
                "token": auth_response.token.dict()
            },
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": f"reg_{datetime.utcnow().timestamp()}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=APIResponse)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access tokens.
    
    Validates user credentials and returns JWT tokens for API access.
    """
    auth_service = AuthService(db)
    
    try:
        auth_response = auth_service.authenticate_user(login_data)
        
        return APIResponse(
            success=True,
            data={
                "user": auth_response.user.dict(),
                "token": auth_response.token.dict()
            },
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": f"login_{datetime.utcnow().timestamp()}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=APIResponse)
async def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    Validates the refresh token and returns new access and refresh tokens.
    """
    auth_service = AuthService(db)
    
    try:
        new_token = auth_service.refresh_access_token(token_data.refresh_token)
        
        return APIResponse(
            success=True,
            data={"token": new_token.dict()},
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": f"refresh_{datetime.utcnow().timestamp()}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout", response_model=APIResponse)
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Logout current user.
    
    Invalidates the current user's tokens (placeholder for token blacklisting).
    """
    auth_service = AuthService(db)
    
    try:
        success = auth_service.logout_user(str(current_user.id))
        
        return APIResponse(
            success=True,
            data={"message": "Successfully logged out"},
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": f"logout_{datetime.utcnow().timestamp()}"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.get("/me", response_model=APIResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user information.
    
    Returns the authenticated user's profile information.
    """
    from app.schemas.auth import UserResponse
    
    user_response = UserResponse.from_orm(current_user)
    
    return APIResponse(
        success=True,
        data={"user": user_response.dict()},
        metadata={
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": f"me_{datetime.utcnow().timestamp()}"
        }
    )