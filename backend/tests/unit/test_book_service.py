"""
Unit tests for book service.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas import BookCreate, BookUpdate, UserCreate
from app.services import BookService, UserService
from app.utils import NotFoundError


@pytest.mark.asyncio
async def test_create_book_success(
    test_db: AsyncSession, sample_user_data: dict, sample_book_data: dict
):
    """Test successful book creation."""
    # Create user first
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    # Create book
    book_create = BookCreate(**sample_book_data)
    book = await BookService.create_book(test_db, user.id, book_create)

    assert book.title == sample_book_data["title"]
    assert book.author == sample_book_data["author"]
    assert book.owner_id == user.id


@pytest.mark.asyncio
async def test_get_book_by_id(
    test_db: AsyncSession, sample_user_data: dict, sample_book_data: dict
):
    """Test fetching book by ID."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    created_book = await BookService.create_book(test_db, user.id, book_create)

    fetched_book = await BookService.get_book_by_id(test_db, created_book.id)

    assert fetched_book.id == created_book.id
    assert fetched_book.title == sample_book_data["title"]


@pytest.mark.asyncio
async def test_get_all_books(
    test_db: AsyncSession, sample_user_data: dict, sample_book_data: dict
):
    """Test fetching all books."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    await BookService.create_book(test_db, user.id, book_create)

    books = await BookService.get_all_books(test_db)

    assert len(books) > 0


@pytest.mark.asyncio
async def test_get_user_books(
    test_db: AsyncSession, sample_user_data: dict, sample_book_data: dict
):
    """Test fetching books for a specific user."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    await BookService.create_book(test_db, user.id, book_create)

    user_books = await BookService.get_user_books(test_db, user.id)

    assert len(user_books) == 1
    assert user_books[0].owner_id == user.id


@pytest.mark.asyncio
async def test_update_book(
    test_db: AsyncSession, sample_user_data: dict, sample_book_data: dict
):
    """Test book update."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    book = await BookService.create_book(test_db, user.id, book_create)

    update_data = BookUpdate(title="Updated Title")
    updated_book = await BookService.update_book(test_db, book.id, update_data)

    assert updated_book.title == "Updated Title"


@pytest.mark.asyncio
async def test_delete_book(
    test_db: AsyncSession, sample_user_data: dict, sample_book_data: dict
):
    """Test book deletion."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    book = await BookService.create_book(test_db, user.id, book_create)

    await BookService.delete_book(test_db, book.id)

    deleted_book = await BookService.get_book_by_id(test_db, book.id)
    assert deleted_book is None
