"""Review analysis background tasks.

Generate rolling consensus summaries for book reviews using the LLM.
"""

import asyncio
from typing import List

from app.core.database import AsyncSessionLocal
from app.services import llama_service
from app.models import Review, Book
from app.core.logging import get_logger

logger = get_logger(__name__)


async def _analyze_reviews(book_id: int) -> None:
    async with AsyncSessionLocal() as db:
        try:
            stmt = __import__("sqlalchemy").select(Review).where(Review.book_id == book_id)
            res = await db.execute(stmt)
            reviews: List[Review] = res.scalars().all()

            if not reviews:
                return

            combined = "\n\n".join([r.review_text or "" for r in reviews[-50:]])

            prompt = f"Provide a concise consensus summary of these user reviews:\n\n{combined}\n\nSummary:" 
            try:
                consensus = await llama_service.generate_summary(prompt, 500)
            except Exception as e:
                logger.error("Failed to generate consensus: %s", str(e))
                consensus = ""

            # Update book.review_summary
            book = (await db.execute(__import__("sqlalchemy").select(Book).where(Book.id == book_id))).scalars().first()
            if book:
                book.review_summary = consensus
                await db.commit()

            logger.info("Updated review consensus for book %s", book_id)
        except Exception as e:
            logger.error("Review analysis failed for %s: %s", book_id, str(e))


def schedule_review_analysis(book_id: int) -> None:
    asyncio.create_task(_analyze_reviews(book_id))
