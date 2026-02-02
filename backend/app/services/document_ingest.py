"""Document ingestion pipeline.

This module provides a simple ingestion pipeline that reads the uploaded
file using the configured `StorageProvider`, extracts text (best-effort),
generates a summary via the LLM provider, and updates the `Document` and
`Book` records asynchronously.
"""

import asyncio
from typing import Optional

from sqlalchemy import select

from app.core.di import container
from app.core.database import AsyncSessionLocal
from app.models import Document, Book
from app.core.logging import get_logger

logger = get_logger(__name__)


async def _extract_text_from_bytes(data: bytes, filename: str) -> str:
    """Extract text from bytes with best-effort UTF-8 decoding."""
    try:
        return data.decode("utf-8")
    except Exception:
        # For PDFs and other formats, recommend integrating pdfminer or ebooklib
        return "[binary content omitted]"


async def ingest_document(document_id: int, book_id: Optional[int] = None) -> None:
    """Ingest a document: read file, extract text, generate summary, persist results."""
    storage = container.get_storage_provider()
    llm = container.get_llm_provider()

    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Document).where(Document.id == document_id))
            doc = result.scalars().first()
            if not doc:
                logger.error("Document not found: %s", document_id)
                return

            # Read file content
            content_bytes = await storage.read_file(doc.file_path)
            if not content_bytes:
                logger.error("Could not read file for document %s", document_id)
                return

            text = await _extract_text_from_bytes(content_bytes, doc.filename)

            # Generate summary via LLM
            try:
                summary = await llm.generate_book_summary(text)
            except Exception as e:
                logger.error("LLM summary failed: %s", str(e))
                summary = ""

            # Update document and optionally book
            doc.content = text
            doc.is_ingested = True
            doc.ingestion_status = "completed"
            await db.commit()

            if book_id:
                result = await db.execute(select(Book).where(Book.id == book_id))
                book = result.scalars().first()
                if book:
                    book.summary = summary
                    await db.commit()

            logger.info("Document ingested: %s", document_id)
        except Exception as e:
            logger.error("Ingestion failed for %s: %s", document_id, str(e))
            doc_err = None
            try:
                result = await db.execute(select(Document).where(Document.id == document_id))
                doc_err = result.scalars().first()
            except Exception:
                pass
            
            if doc_err:
                doc_err.ingestion_status = "failed"
                await db.commit()


async def schedule_ingest(document_id: int, book_id: Optional[int] = None) -> None:
    """Schedule a document for ingestion (wrapper for async task queue)."""
    await ingest_document(document_id, book_id)

def schedule_ingest(document_id: int, book_id: Optional[int] = None) -> None:
    asyncio.create_task(ingest_document(document_id, book_id))
