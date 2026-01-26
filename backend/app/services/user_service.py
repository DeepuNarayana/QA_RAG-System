"""
User Service Module

Handles user-related business logic.
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.utils import AuthenticationError, ConflictError, NotFoundError

logger = get_logger(__name__)


class UserService:
    """Service for user management."""

    @staticmethod
    async def create_user(
        db: AsyncSession, user_data: UserCreate
    ) -> User:
        """
        Create a new user.

        Args:
            db: Database session
            user_data: User creation data

        Returns:
            User: Created user

        Raises:
            ConflictError: If user already exists
        """
        try:
            # Check if user already exists
            stmt = select(User).where(
                (User.email == user_data.email) | (User.username == user_data.username)
            )
            existing_user = await db.execute(stmt)
            if existing_user.scalars().first():
                raise ConflictError("User with this email or username already exists")

            # Create new user
            user = User(
                username=user_data.username,
                email=user_data.email,
                full_name=user_data.full_name,
                hashed_password=get_password_hash(user_data.password),
            )

            db.add(user)
            await db.commit()
            await db.refresh(user)

            logger.info(f"User created: {user.username}")
            return user

        except ConflictError:
            raise
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def get_user_by_id(
        db: AsyncSession, user_id: int
    ) -> Optional[User]:
        """
        Get user by ID.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Optional[User]: User if found, None otherwise
        """
        try:
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalars().first()
            return user
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            raise

    @staticmethod
    async def get_user_by_username(
        db: AsyncSession, username: str
    ) -> Optional[User]:
        """
        Get user by username.

        Args:
            db: Database session
            username: Username

        Returns:
            Optional[User]: User if found, None otherwise
        """
        try:
            stmt = select(User).where(User.username == username)
            result = await db.execute(stmt)
            user = result.scalars().first()
            return user
        except Exception as e:
            logger.error(f"Error fetching user by username: {str(e)}")
            raise

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, username: str, password: str
    ) -> User:
        """
        Authenticate user with username and password.

        Args:
            db: Database session
            username: Username
            password: Password

        Returns:
            User: Authenticated user

        Raises:
            AuthenticationError: If authentication fails
        """
        try:
            user = await UserService.get_user_by_username(db, username)

            if not user:
                raise AuthenticationError("Invalid username or password")

            if not user.is_active:
                raise AuthenticationError("User account is inactive")

            if not verify_password(password, user.hashed_password):
                raise AuthenticationError("Invalid username or password")

            logger.info(f"User authenticated: {username}")
            return user

        except AuthenticationError:
            raise
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            raise AuthenticationError("Authentication failed")

    @staticmethod
    async def update_user(
        db: AsyncSession, user_id: int, user_data: UserUpdate
    ) -> User:
        """
        Update user information.

        Args:
            db: Database session
            user_id: User ID
            user_data: Update data

        Returns:
            User: Updated user

        Raises:
            NotFoundError: If user not found
        """
        try:
            user = await UserService.get_user_by_id(db, user_id)

            if not user:
                raise NotFoundError("User")

            update_data = user_data.dict(exclude_unset=True)

            if "password" in update_data:
                update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

            for field, value in update_data.items():
                setattr(user, field, value)

            await db.commit()
            await db.refresh(user)

            logger.info(f"User updated: {user.username}")
            return user

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def delete_user(
        db: AsyncSession, user_id: int
    ) -> None:
        """
        Delete user.

        Args:
            db: Database session
            user_id: User ID

        Raises:
            NotFoundError: If user not found
        """
        try:
            user = await UserService.get_user_by_id(db, user_id)

            if not user:
                raise NotFoundError("User")

            await db.delete(user)
            await db.commit()

            logger.info(f"User deleted: {user.username}")

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            await db.rollback()
            raise
