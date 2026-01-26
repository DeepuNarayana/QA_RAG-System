"""
Unit tests for review service.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import BookCreate, ReviewCreate, UserCreate
from app.services import BookService, ReviewService, UserService
from app.utils import NotFoundError


@pytest.mark.asyncio
async def test_create_review_success(
    test_db: AsyncSession,
    sample_user_data: dict,
    sample_book_data: dict,
    sample_review_data: dict,
):
    """Test successful review creation."""
    # Create user and book
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    book = await BookService.create_book(test_db, user.id, book_create)

    # Create review
    review_create = ReviewCreate(**sample_review_data)
    review = await ReviewService.create_review(test_db, book.id, user.id, review_create)

    assert review.book_id == book.id
    assert review.user_id == user.id
    assert review.rating == sample_review_data["rating"]


@pytest.mark.asyncio
async def test_get_reviews_for_book(
    test_db: AsyncSession,
    sample_user_data: dict,
    sample_book_data: dict,
    sample_review_data: dict,
):
    """Test fetching reviews for a book."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    book = await BookService.create_book(test_db, user.id, book_create)

    review_create = ReviewCreate(**sample_review_data)
    await ReviewService.create_review(test_db, book.id, user.id, review_create)

    reviews = await ReviewService.get_reviews_for_book(test_db, book.id)

    assert len(reviews) == 1
    assert reviews[0].book_id == book.id


@pytest.mark.asyncio
async def test_delete_review(
    test_db: AsyncSession,
    sample_user_data: dict,
    sample_book_data: dict,
    sample_review_data: dict,
):
    """Test review deletion."""
    user_create = UserCreate(**sample_user_data)
    user = await UserService.create_user(test_db, user_create)

    book_create = BookCreate(**sample_book_data)
    book = await BookService.create_book(test_db, user.id, book_create)

    review_create = ReviewCreate(**sample_review_data)
    review = await ReviewService.create_review(test_db, book.id, user.id, review_create)

    await ReviewService.delete_review(test_db, review.id)

    deleted_review = await ReviewService.get_review_by_id(test_db, review.id)
    assert deleted_review is None
