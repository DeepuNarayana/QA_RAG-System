"""Background tasks for asynchronous book processing."""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.di import container
from app.models import Book, Review

logger = logging.getLogger(__name__)


async def ingest_and_summarize_book(book_id: int, file_path: str) -> None:
    """
    Asynchronous task to ingest book content and generate summary.
    
    Args:
        book_id: Book ID to process
        file_path: Path to the stored book file
    """
    try:
        storage = container.get_storage_provider()
        llm = container.get_llm_provider()
        
        # Read book content
        content = await storage.read_file(file_path)
        if not content:
            logger.error(f"Could not read file for book {book_id}")
            return
        
        # Decode content (assumes text files)
        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            text_content = content.decode("utf-8", errors="ignore")
        
        # Generate summary using configured LLM provider
        summary = await llm.generate_book_summary(text_content)
        
        # Update book record
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Book).where(Book.id == book_id))
            book = result.scalar()
            if book:
                book.summary = summary
                await db.commit()
                logger.info(f"Book {book_id} summary generated and stored")
    except Exception as e:
        logger.error(f"Book ingestion failed for book {book_id}: {e}")


async def analyze_and_update_review_consensus(book_id: int) -> None:
    """
    Asynchronous task to analyze reviews and update book consensus.
    
    Args:
        book_id: Book ID to analyze reviews for
    """
    try:
        llm = container.get_llm_provider()
        
        async with AsyncSessionLocal() as db:
            # Get all reviews for this book
            result = await db.execute(
                select(Review).where(Review.book_id == book_id)
            )
            reviews = result.scalars().all()
            
            if not reviews:
                return
            
            review_texts = [r.review_text or "" for r in reviews]
            
            # Analyze using configured LLM provider
            analysis = await llm.analyze_reviews(review_texts)
            
            # Calculate average rating
            avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
            
            # Update book with analysis
            result = await db.execute(select(Book).where(Book.id == book_id))
            book = result.scalar()
            if book:
                book.average_rating = avg_rating
                book.review_summary = analysis.get("consensus", "")
                await db.commit()
                logger.info(f"Book {book_id} review analysis completed")
    except Exception as e:
        logger.error(f"Review analysis failed for book {book_id}: {e}")
