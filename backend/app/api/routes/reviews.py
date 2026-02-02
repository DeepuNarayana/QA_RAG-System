"""
Review Routes

Handles review-related API endpoints.
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import get_db
from app.schemas import ReviewCreate, ReviewResponse
from app.services import ReviewService
from app.utils import NotFoundError
from app.core.security import get_current_user
from fastapi import Depends
from app.services.borrow_service import BorrowService

router = APIRouter(prefix="/books/{book_id}/reviews", tags=["reviews"])


async def _get_current_user(
    user=Depends(get_current_user),
) -> int:
    return user.id


@router.post("", response_model=ReviewResponse)
async def create_review(
    book_id: int,
    review_data: ReviewCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[int, Depends(_get_current_user)] = 1,
) -> ReviewResponse:
    """
    Create a new review for a book.

    Args:
        book_id: Book ID
        review_data: Review creation data
        db: Database session
        user_id: User ID

    Returns:
        ReviewResponse: Created review data

    Raises:
        HTTPException: If creation fails
    """
    try:
        # enforce constraint: user must have borrowed the book before reviewing
        has_borrowed = await BorrowService.user_has_borrowed(db, user_id, book_id)
        if not has_borrowed:
            raise HTTPException(status_code=403, detail="User must borrow the book before reviewing")

        review = await ReviewService.create_review(db, book_id, user_id, review_data)

        # Trigger async review analysis
        await task_queue.enqueue(analyze_and_update_review_consensus(book_id))

        return ReviewResponse.from_orm(review)
    except HTTPException:
        raise
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Review creation failed")


@router.get("", response_model=List[ReviewResponse])
async def get_reviews(
    book_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100,
) -> List[ReviewResponse]:
    """
    Get all reviews for a book.

    Args:
        book_id: Book ID
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[ReviewResponse]: List of reviews
    """
    try:
        reviews = await ReviewService.get_reviews_for_book(db, book_id, skip, limit)
        return [ReviewResponse.from_orm(review) for review in reviews]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch reviews")


@router.delete("/{review_id}")
async def delete_review(
    book_id: int,
    review_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Delete a review.

    Args:
        book_id: Book ID (for routing)
        review_id: Review ID
        db: Database session

    Returns:
        dict: Deletion confirmation

    Raises:
        HTTPException: If deletion fails
    """
    try:
        await ReviewService.delete_review(db, review_id)
        return {"message": "Review deleted successfully"}
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Review deletion failed")
