"""
Conftest for pytest

Shared fixtures for all tests.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.core.security import get_password_hash


@pytest.fixture
async def test_db():
    """Create test database session."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False, future=True
    )

    async with async_session() as session:
        yield session

    await engine.dispose()


@pytest.fixture
def sample_user_data():
    """Sample user data for tests."""
    return {
        "username": "testuser",
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "TestPassword123",
    }


@pytest.fixture
def sample_book_data():
    """Sample book data for tests."""
    return {
        "title": "Test Book",
        "author": "Test Author",
        "genre": "Fiction",
        "year_published": 2023,
        "description": "A test book",
        "isbn": "123-456-789",
        "pages": 300,
    }


@pytest.fixture
def sample_review_data():
    """Sample review data for tests."""
    return {
        "rating": 4.5,
        "review_text": "Great book!",
    }
