"""
Unit tests for user service.
"""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.services import UserService
from app.utils import AuthenticationError, ConflictError, NotFoundError


@pytest.mark.asyncio
async def test_create_user_success(test_db: AsyncSession, sample_user_data: dict):
    """Test successful user creation."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    assert user.username == sample_user_data["username"]
    assert user.email == sample_user_data["email"]
    assert verify_password(sample_user_data["password"], user.hashed_password)


@pytest.mark.asyncio
async def test_create_user_duplicate_email(
    test_db: AsyncSession, sample_user_data: dict
):
    """Test duplicate email rejection."""
    user_create = UserCreate(**sample_user_data)
    await UserService.create_user(test_db, user_create)

    with pytest.raises(ConflictError):
        duplicate_data = sample_user_data.copy()
        duplicate_data["username"] = "different"
        await UserService.create_user(test_db, UserCreate(**duplicate_data))


@pytest.mark.asyncio
async def test_get_user_by_id(test_db: AsyncSession, sample_user_data: dict):
    """Test fetching user by ID."""
    user_create = UserCreate(**sample_user_data)
    created_user = await UserService.create_user(test_db, user_create)

    fetched_user = await UserService.get_user_by_id(test_db, created_user.id)

    assert fetched_user.id == created_user.id
    assert fetched_user.username == sample_user_data["username"]


@pytest.mark.asyncio
async def test_get_user_by_username(test_db: AsyncSession, sample_user_data: dict):
    """Test fetching user by username."""
    user_create = UserCreate(**sample_user_data)
    await UserService.create_user(test_db, user_create)

    fetched_user = await UserService.get_user_by_username(
        test_db, sample_user_data["username"]
    )

    assert fetched_user.username == sample_user_data["username"]


@pytest.mark.asyncio
async def test_authenticate_user_success(test_db: AsyncSession, sample_user_data: dict):
    """Test successful authentication."""
    user_create = UserCreate(**sample_user_data)
    await UserService.create_user(test_db, user_create)

    authenticated_user = await UserService.authenticate_user(
        test_db, sample_user_data["username"], sample_user_data["password"]
    )

    assert authenticated_user.username == sample_user_data["username"]


@pytest.mark.asyncio
async def test_authenticate_user_wrong_password(
    test_db: AsyncSession, sample_user_data: dict
):
    """Test authentication with wrong password."""
    user_create = UserCreate(**sample_user_data)
    await UserService.create_user(test_db, user_create)

    with pytest.raises(AuthenticationError):
        await UserService.authenticate_user(
            test_db, sample_user_data["username"], "WrongPassword123"
        )


@pytest.mark.asyncio
async def test_update_user(test_db: AsyncSession, sample_user_data: dict):
    """Test user update."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    update_data = UserUpdate(full_name="Updated Name")
    updated_user = await UserService.update_user(test_db, user.id, update_data)

    assert updated_user.full_name == "Updated Name"


@pytest.mark.asyncio
async def test_delete_user(test_db: AsyncSession, sample_user_data: dict):
    """Test user deletion."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    await UserService.delete_user(test_db, user.id)

    deleted_user = await UserService.get_user_by_id(test_db, user.id)
    assert deleted_user is None
