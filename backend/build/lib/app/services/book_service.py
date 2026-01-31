"""
Book Service Module

Handles book-related business logic and database operations.
"""

from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models import Book, Review
from app.schemas import BookCreate, BookUpdate
from app.utils import NotFoundError

logger = get_logger(__name__)


class BookService:
    """Service for book management."""

    @staticmethod
    async def create_book(
        db: AsyncSession, owner_id: int, book_data: BookCreate
    ) -> Book:
        """
        Create a new book.

        Args:
            db: Database session
            owner_id: Owner user ID
            book_data: Book creation data

        Returns:
            Book: Created book
        """
        try:
            book = Book(
                owner_id=owner_id,
                **book_data.dict()
            )

            db.add(book)
            await db.commit()
            await db.refresh(book)

            logger.info(f"Book created: {book.title}")
            return book

        except Exception as e:
            logger.error(f"Error creating book: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def get_book_by_id(
        db: AsyncSession, book_id: int
    ) -> Optional[Book]:
        """
        Get book by ID.

        Args:
            db: Database session
            book_id: Book ID

        Returns:
            Optional[Book]: Book if found, None otherwise
        """
        try:
            stmt = select(Book).where(Book.id == book_id)
            result = await db.execute(stmt)
            book = result.scalars().first()
            return book
        except Exception as e:
            logger.error(f"Error fetching book: {str(e)}")
            raise

    @staticmethod
    async def get_all_books(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Book]:
        """
        Get all books with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List[Book]: List of books
        """
        try:
            stmt = select(Book).offset(skip).limit(limit)
            result = await db.execute(stmt)
            books = result.scalars().all()
            return books
        except Exception as e:
            logger.error(f"Error fetching books: {str(e)}")
            raise

    @staticmethod
    async def get_user_books(
        db: AsyncSession, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Book]:
        """
        Get books for a specific user.

        Args:
            db: Database session
            owner_id: Owner user ID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List[Book]: List of user's books
        """
        try:
            stmt = select(Book).where(
                Book.owner_id == owner_id
            ).offset(skip).limit(limit)
            result = await db.execute(stmt)
            books = result.scalars().all()
            return books
        except Exception as e:
            logger.error(f"Error fetching user books: {str(e)}")
            raise

    @staticmethod
    async def update_book(
        db: AsyncSession, book_id: int, book_data: BookUpdate
    ) -> Book:
        """
        Update book information.

        Args:
            db: Database session
            book_id: Book ID
            book_data: Update data

        Returns:
            Book: Updated book

        Raises:
            NotFoundError: If book not found
        """
        try:
            book = await BookService.get_book_by_id(db, book_id)

            if not book:
                raise NotFoundError("Book")

            update_data = book_data.dict(exclude_unset=True)

            for field, value in update_data.items():
                setattr(book, field, value)

            await db.commit()
            await db.refresh(book)

            logger.info(f"Book updated: {book.title}")
            return book

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error updating book: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def delete_book(
        db: AsyncSession, book_id: int
    ) -> None:
        """
        Delete book.

        Args:
            db: Database session
            book_id: Book ID

        Raises:
            NotFoundError: If book not found
        """
        try:
            book = await BookService.get_book_by_id(db, book_id)

            if not book:
                raise NotFoundError("Book")

            await db.delete(book)
            await db.commit()

            logger.info(f"Book deleted: {book.title}")

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error deleting book: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def get_book_summary(
        db: AsyncSession, book_id: int
    ) -> dict:
        """
        Get book summary with aggregated ratings.

        Args:
            db: Database session
            book_id: Book ID

        Returns:
            dict: Book summary with average rating

        Raises:
            NotFoundError: If book not found
        """
        try:
            book = await BookService.get_book_by_id(db, book_id)

            if not book:
                raise NotFoundError("Book")

            # Get average rating
            stmt = select(func.avg(Review.rating)).where(Review.book_id == book_id)
            result = await db.execute(stmt)
            avg_rating = result.scalars().first() or 0.0

            return {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "summary": book.summary,
                "average_rating": float(avg_rating),
            }

        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error getting book summary: {str(e)}")
            raise
