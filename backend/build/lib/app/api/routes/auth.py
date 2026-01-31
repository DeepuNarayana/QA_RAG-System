"""
Authentication Routes

Handles user registration, login, and token management.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import create_access_token, get_db
from app.core.security import TokenData
from app.schemas import LoginRequest, TokenResponse, UserCreate, UserResponse
from app.services import UserService
from app.utils import AuthenticationError, ConflictError

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """
    Register a new user.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        UserResponse: Created user data

    Raises:
        HTTPException: If registration fails
    """
    try:
        user = await UserService.create_user(db, user_data)
        return UserResponse.from_orm(user)
    except ConflictError as e:
        raise HTTPException(status_code=409, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Authenticate user and return access token.

    Args:
        credentials: Login credentials
        db: Database session

    Returns:
        TokenResponse: Access token and user data

    Raises:
        HTTPException: If authentication fails
    """
    try:
        user = await UserService.authenticate_user(
            db, credentials.username, credentials.password
        )

        token_data = TokenData(
            user_id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
        )

        access_token = create_access_token(token_data)

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.from_orm(user),
        )
    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")
