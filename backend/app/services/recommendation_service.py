"""Recommendation engine (basic content-based) using user preferences.

This is a simple, extendable content-based recommender that scores books by
overlap between user preference tokens and book title/summary tokens.
"""

from typing import List, Tuple
import re

from app.core.database import AsyncSessionLocal
from app.models import UserPreference, Book
from app.core.logging import get_logger

logger = get_logger(__name__)


def _tokenize(text: str) -> List[str]:
    return [t.lower() for t in re.findall(r"\w+", text or "")]


async def recommend_for_user(user_id: int, top_k: int = 5) -> List[Tuple[Book, float]]:
    async with AsyncSessionLocal() as db:
        pref = (await db.execute(__import__("sqlalchemy").select(UserPreference).where(UserPreference.user_id == user_id))).scalars().first()
        if not pref or not pref.preferences_text:
            # fallback: recommend top-rated books
            res = await db.execute(__import__("sqlalchemy").select(Book).order_by(Book.average_rating.desc()).limit(top_k))
            return [(b, b.average_rating) for b in res.scalars().all()]

        tokens = set(_tokenize(pref.preferences_text))

        res = await db.execute(__import__("sqlalchemy").select(Book))
        books = res.scalars().all()

        scored = []
        for b in books:
            text = f"{b.title} {b.summary or ''} {b.description or ''}"
            tset = set(_tokenize(text))
            score = len(tokens & tset)
            scored.append((b, float(score)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
