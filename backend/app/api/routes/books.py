"""
Book Routes

Handles book-related API endpoints.
"""

import logging
import logging
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core import get_db
from app.core.security import get_current_user
from app.schemas import BookCreate, BookResponse, BookUpdate
from app.services import BookService
from app.core.di import get_storage_provider
from fastapi import UploadFile, File
from app.services.borrow_service import BorrowService
from app.services.document_ingest import schedule_ingest
from app.utils import NotFoundError

router = APIRouter(prefix="/books", tags=["books"])


async def _get_current_user(
    user=Depends(get_current_user),
) -> int:
    return user.id


@router.post("", response_model=BookResponse)
async def create_book(
    book_data: BookCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    owner_id: Annotated[int, Depends(_get_current_user)] = 1,
) -> BookResponse:
    """
    Create a new book.

    Args:
        book_data: Book creation data
        db: Database session
        owner_id: Owner user ID

    Returns:
        BookResponse: Created book data

    Raises:
        HTTPException: If creation fails
    """
    try:
        book = await BookService.create_book(db, owner_id, book_data)
        return BookResponse.from_orm(book)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Book creation failed")



@router.post("/{book_id}/upload")
async def upload_book_file(
    book_id: int,
    file: UploadFile = File(...),
    db: Annotated[AsyncSession, Depends(get_db)] = Depends(get_db),
    user=Depends(get_current_user),
):
    """Upload a book file and attach it to a document record."""
    storage = get_storage_provider()
    content = await file.read()
    # create a unique filename prefix with book id
    filename = f"book_{book_id}_{file.filename}"
    path = await storage.save(filename, content)

    # create document record
    from app.models import Document

    doc = Document(owner_id=user.id, filename=file.filename, file_path=path, document_type=file.content_type, file_size=len(content))
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # schedule ingestion asynchronously
    try:
        schedule_ingest(doc.id, book_id)
    except Exception:
        logger = __import__("app").core.logging.get_logger(__name__)
        logger.warning("Failed to schedule ingestion for document %s", doc.id)

    return {"message": "uploaded", "document_id": doc.id, "path": path}


@router.post("/{book_id}/borrow")
async def borrow_book(
    book_id: int,
    db: Annotated[AsyncSession, Depends(get_db)] = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        record = await BorrowService.borrow_book(db, user.id, book_id)
        return {"message": "borrowed", "borrow_id": record.id, "due_date": record.due_date}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{book_id}/return")
async def return_book(
    book_id: int,
    db: Annotated[AsyncSession, Depends(get_db)] = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        await BorrowService.return_book(db, user.id, book_id)
        return {"message": "returned"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[BookResponse])
async def get_books(
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100,
) -> List[BookResponse]:
    """
    Get all books with pagination.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[BookResponse]: List of books
    """
    try:
        books = await BookService.get_all_books(db, skip, limit)
        return [BookResponse.from_orm(book) for book in books]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch books")


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BookResponse:
    """
    Get book by ID.

    Args:
        book_id: Book ID
        db: Database session

    Returns:
        BookResponse: Book data

    Raises:
        HTTPException: If book not found
    """
    try:
        book = await BookService.get_book_by_id(db, book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return BookResponse.from_orm(book)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch book")


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    book_data: BookUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BookResponse:
    """
    Update book information.

    Args:
        book_id: Book ID
        book_data: Update data
        db: Database session

    Returns:
        BookResponse: Updated book data

    Raises:
        HTTPException: If update fails
    """
    try:
        book = await BookService.update_book(db, book_id, book_data)
        return BookResponse.from_orm(book)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Book update failed")


@router.delete("/{book_id}")
async def delete_book(
    book_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Delete a book.

    Args:
        book_id: Book ID
        db: Database session

    Returns:
        dict: Deletion confirmation

    Raises:
        HTTPException: If deletion fails
    """
    try:
        await BookService.delete_book(db, book_id)
        return {"message": "Book deleted successfully"}
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Book deletion failed")


@router.get("/{book_id}/summary")
async def get_book_summary(
    book_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Get book summary with average rating.

    Args:
        book_id: Book ID
        db: Database session

    Returns:
        dict: Book summary with ratings

    Raises:
        HTTPException: If book not found
    """
    try:
        summary = await BookService.get_book_summary(db, book_id)
        return summary
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch summary")
