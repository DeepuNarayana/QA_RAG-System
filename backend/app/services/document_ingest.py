"""Document ingestion pipeline.

This module provides a simple ingestion pipeline that reads the uploaded
file using the configured `StorageProvider`, extracts text (best-effort),
generates a summary via the LLM provider, and updates the `Document` and
`Book` records asynchronously.
"""

import asyncio
from typing import Optional

from app.core.di import get_storage_provider
from app.core.database import AsyncSessionLocal
from app.models import Document, Book
from app.services import llama_service
from app.core.logging import get_logger

logger = get_logger(__name__)


async def _extract_text_from_bytes(data: bytes, filename: str) -> str:
    # Very small, best-effort extraction: try UTF-8 decode else placeholder
    try:
        return data.decode("utf-8")
    except Exception:
        # For PDFs and other formats, recommend integrating pdfminer or ebooklib
        return "[binary content omitted]"


async def ingest_document(document_id: int, book_id: Optional[int] = None) -> None:
    """Ingest a document: read file, extract text, generate summary, persist results."""
    storage = get_storage_provider()

    async with AsyncSessionLocal() as db:
        try:
            doc = (await db.execute(__import__("sqlalchemy").select(Document).where(Document.id == document_id))).scalars().first()
            if not doc:
                logger.error("Document not found: %s", document_id)
                return

            # Read file content
            content_bytes = b""
            async for chunk in await storage.read(doc.file_path):
                content_bytes += chunk

            text = await _extract_text_from_bytes(content_bytes, doc.filename)

            # Generate summary via LLM
            try:
                summary = await llama_service.generate_summary(text, 1000)
            except Exception as e:
                logger.error("LLM summary failed: %s", str(e))
                summary = ""

            # Update document and optionally book
            doc.content = text
            doc.is_ingested = True
            doc.ingestion_status = "completed"
            await db.commit()

            if book_id:
                b = (await db.execute(__import__("sqlalchemy").select(Book).where(Book.id == book_id))).scalars().first()
                if b:
                    b.summary = summary
                    await db.commit()

            logger.info("Document ingested: %s", document_id)
        except Exception as e:
            logger.error("Ingestion failed for %s: %s", document_id, str(e))
            if doc:
                doc.ingestion_status = "failed"
                doc.ingestion_error = str(e)
                await db.commit()


def schedule_ingest(document_id: int, book_id: Optional[int] = None) -> None:
    asyncio.create_task(ingest_document(document_id, book_id))
