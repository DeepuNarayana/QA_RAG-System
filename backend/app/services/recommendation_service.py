"""Recommendation engine (collaborative & content-based) using user preferences.

Implements both collaborative filtering and content-based recommendations.
"""

import re
from typing import List, Tuple

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import UserPreference, Book, Review, Borrow
from app.core.logging import get_logger

logger = get_logger(__name__)


def _tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase words."""
    return [t.lower() for t in re.findall(r"\w+", text or "")]


async def recommend_for_user(
    db: AsyncSession, user_id: int, top_k: int = 5
) -> List[Tuple[Book, float]]:
    """
    Get recommendations for a user using collaborative + content-based filtering.
    
    Args:
        db: Database session
        user_id: User ID to get recommendations for
        top_k: Number of recommendations to return
        
    Returns:
        List of (Book, score) tuples
    """
    try:
        # Try collaborative filtering first
        collab_recs = await _collaborative_filter(db, user_id, top_k)
        if collab_recs:
            return collab_recs

        # Fallback to content-based
        return await _content_based_recommendations(db, user_id, top_k)
    except Exception as e:
        logger.error(f"Recommendation failed: {e}")
        return []


async def _collaborative_filter(
    db: AsyncSession, user_id: int, top_k: int
) -> List[Tuple[Book, float]]:
    """
    Collaborative filtering: find users with similar reading patterns.
    
    Args:
        db: Database session
        user_id: User ID
        top_k: Number of recommendations
        
    Returns:
        List of recommended books
    """
    try:
        # Get books the user has borrowed
        result = await db.execute(
            select(Borrow.book_id).where(Borrow.user_id == user_id)
        )
        user_books = set(result.scalars().all())

        if not user_books:
            return []

        # Find other users who borrowed similar books
        result = await db.execute(
            select(Borrow.user_id, func.count(Borrow.id).label("overlap"))
            .where(Borrow.book_id.in_(user_books))
            .where(Borrow.user_id != user_id)
            .group_by(Borrow.user_id)
            .order_by(func.count(Borrow.id).desc())
            .limit(5)
        )
        similar_users = [row[0] for row in result.all()]

        if not similar_users:
            return []

        # Get books borrowed by similar users but not by this user
        result = await db.execute(
            select(Book, func.count(Borrow.id).label("count"))
            .join(Borrow, Borrow.book_id == Book.id)
            .where(Borrow.user_id.in_(similar_users))
            .where(~Book.id.in_(user_books))
            .group_by(Book.id)
            .order_by(func.count(Borrow.id).desc())
            .limit(top_k)
        )
        rows = result.all()
        return [(row[0], float(row[1]) / len(similar_users)) for row in rows]
    except Exception as e:
        logger.warning(f"Collaborative filtering failed: {e}")
        return []


async def _content_based_recommendations(
    db: AsyncSession, user_id: int, top_k: int
) -> List[Tuple[Book, float]]:
    """
    Content-based filtering using user preferences and book metadata.
    
    Args:
        db: Database session
        user_id: User ID
        top_k: Number of recommendations
        
    Returns:
        List of recommended books
    """
    try:
        # Get user preferences
        result = await db.execute(
            select(UserPreference).where(UserPreference.user_id == user_id)
        )
        pref = result.scalar()
        
        if not pref or not pref.preferences_text:
            # Fallback: top-rated books not borrowed
            result = await db.execute(
                select(Book)
                .where(
                    ~Book.id.in_(select(Borrow.book_id).where(Borrow.user_id == user_id))
                )
                .order_by(Book.average_rating.desc())
                .limit(top_k)
            )
            books = result.scalars().all()
            return [(b, b.average_rating / 5.0) for b in books]

        # Score books based on preference overlap
        pref_tokens = set(_tokenize(pref.preferences_text))
        
        result = await db.execute(
            select(Book).where(
                ~Book.id.in_(select(Borrow.book_id).where(Borrow.user_id == user_id))
            )
        )
        all_books = result.scalars().all()

        scored = []
        for book in all_books:
            text = f"{book.title} {book.summary or ''} {book.genre or ''}"
            book_tokens = set(_tokenize(text))
            
            # Calculate similarity score
            overlap = len(pref_tokens & book_tokens)
            rating_boost = book.average_rating / 5.0
            score = (overlap + 1) * rating_boost
            scored.append((book, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
    except Exception as e:
        logger.error(f"Content-based filtering failed: {e}")
        return []
