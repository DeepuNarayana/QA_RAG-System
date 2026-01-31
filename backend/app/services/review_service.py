"""
Review Service Module

Handles review-related business logic.
"""

from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models import Review, Book
from app.schemas import ReviewCreate
from app.utils import NotFoundError
from app.services.review_analysis import schedule_review_analysis

logger = get_logger(__name__)


class ReviewService:
    """Service for review management."""

    @staticmethod
    async def create_review(
        db: AsyncSession, book_id: int, user_id: int, review_data: ReviewCreate
    ) -> Review:
        """
        Create a new review for a book.

        Args:
            db: Database session
            book_id: Book ID
            user_id: User ID
            review_data: Review creation data

        Returns:
            Review: Created review
        """
        try:
            # Verify book exists
            stmt = select(Book).where(Book.id == book_id)
            result = await db.execute(stmt)
            if not result.scalars().first():
                raise NotFoundError("Book")

            review = Review(
                book_id=book_id,
                user_id=user_id,
                **review_data.dict()
            )

            db.add(review)
            await db.commit()
            await db.refresh(review)

            # Update book average rating
            await ReviewService._update_book_average_rating(db, book_id)

            # Schedule background analysis of reviews
            try:
                schedule_review_analysis(book_id)
            except Exception:
                logger.warning("Failed to schedule review analysis")

            logger.info(f"Review created for book {book_id}")
            return review

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error creating review: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def get_reviews_for_book(
        db: AsyncSession, book_id: int, skip: int = 0, limit: int = 100
    ) -> List[Review]:
        """
        Get all reviews for a book.

        Args:
            db: Database session
            book_id: Book ID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List[Review]: List of reviews
        """
        try:
            stmt = select(Review).where(
                Review.book_id == book_id
            ).offset(skip).limit(limit)
            result = await db.execute(stmt)
            reviews = result.scalars().all()
            return reviews
        except Exception as e:
            logger.error(f"Error fetching reviews: {str(e)}")
            raise

    @staticmethod
    async def get_review_by_id(
        db: AsyncSession, review_id: int
    ) -> Optional[Review]:
        """
        Get review by ID.

        Args:
            db: Database session
            review_id: Review ID

        Returns:
            Optional[Review]: Review if found, None otherwise
        """
        try:
            stmt = select(Review).where(Review.id == review_id)
            result = await db.execute(stmt)
            review = result.scalars().first()
            return review
        except Exception as e:
            logger.error(f"Error fetching review: {str(e)}")
            raise

    @staticmethod
    async def delete_review(
        db: AsyncSession, review_id: int
    ) -> None:
        """
        Delete a review.

        Args:
            db: Database session
            review_id: Review ID

        Raises:
            NotFoundError: If review not found
        """
        try:
            review = await ReviewService.get_review_by_id(db, review_id)

            if not review:
                raise NotFoundError("Review")

            book_id = review.book_id
            await db.delete(review)
            await db.commit()

            # Update book average rating
            await ReviewService._update_book_average_rating(db, book_id)

            logger.info(f"Review deleted: {review_id}")

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error deleting review: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def _update_book_average_rating(
        db: AsyncSession, book_id: int
    ) -> None:
        """
        Update book's average rating based on reviews.

        Args:
            db: Database session
            book_id: Book ID
        """
        try:
            stmt = select(func.avg(Review.rating)).where(Review.book_id == book_id)
            result = await db.execute(stmt)
            avg_rating = result.scalars().first() or 0.0

            stmt = select(Book).where(Book.id == book_id)
            result = await db.execute(stmt)
            book = result.scalars().first()

            if book:
                book.average_rating = float(avg_rating)
                await db.commit()

        except Exception as e:
            logger.error(f"Error updating book average rating: {str(e)}")
