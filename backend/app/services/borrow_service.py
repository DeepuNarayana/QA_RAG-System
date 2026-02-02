"""Borrow service to manage borrow/return lifecycle."""

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Borrow
from app.core.logging import get_logger

logger = get_logger(__name__)


class BorrowService:
    @staticmethod
    async def borrow_book(db: AsyncSession, user_id: int, book_id: int, days: int = 14) -> Borrow:
        # create borrow record
        due = datetime.utcnow() + timedelta(days=days)
        record = Borrow(user_id=user_id, book_id=book_id, due_date=due)
        db.add(record)
        await db.commit()
        await db.refresh(record)
        logger.info(f"User {user_id} borrowed book {book_id}")
        return record

    @staticmethod
    async def return_book(db: AsyncSession, user_id: int, book_id: int) -> None:
        stmt = select(Borrow).where(Borrow.user_id == user_id, Borrow.book_id == book_id, Borrow.returned_at == None)
        res = await db.execute(stmt)
        record = res.scalars().first()
        if not record:
            raise Exception("No active borrow found")
        record.returned_at = datetime.utcnow()
        await db.commit()
        logger.info(f"User {user_id} returned book {book_id}")

    @staticmethod
    async def user_has_borrowed(db: AsyncSession, user_id: int, book_id: int) -> bool:
        """Check if user has ever borrowed this book."""
        stmt = select(Borrow).where(Borrow.user_id == user_id, Borrow.book_id == book_id)
        res = await db.execute(stmt)
        record = res.scalars().first()
        return record is not None

    @staticmethod
    async def user_currently_borrowed(db: AsyncSession, user_id: int, book_id: int) -> bool:
        """Check if user currently has an active borrow (not returned)."""
        stmt = select(Borrow).where(
            Borrow.user_id == user_id, 
            Borrow.book_id == book_id, 
            Borrow.returned_at == None
        )
        res = await db.execute(stmt)
        record = res.scalars().first()
        return record is not None
