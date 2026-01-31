"""
AI Routes

Handles AI-related endpoints for summarization, embeddings, and recommendations.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import get_db
from app.schemas import QARequest, QAResponse, SummaryRequest
from app.services import llama_service
from app.utils import AIServiceError

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate-summary")
async def generate_summary(
    request: SummaryRequest,
) -> dict:
    """
    Generate a summary for the given content.

    Args:
        request: Summary request with content

    Returns:
        dict: Generated summary

    Raises:
        HTTPException: If summary generation fails
    """
    try:
        summary = await llama_service.generate_summary(
            request.content, request.max_length or 500
        )
        return {"summary": summary}
    except AIServiceError as e:
        raise HTTPException(status_code=503, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Summarization failed")


@router.post("/recommendations")
async def get_recommendations(
    user_preferences: str,
    top_k: int = 5,
) -> dict:
    """
    Get book recommendations based on user preferences.

    Args:
        user_preferences: User's preferences description
        top_k: Number of recommendations

    Returns:
        dict: Book recommendations

    Raises:
        HTTPException: If recommendation generation fails
    """
    try:
        recommendations = await llama_service.generate_recommendations(
            user_preferences, top_k
        )
        return {"recommendations": recommendations}
    except AIServiceError as e:
        raise HTTPException(status_code=503, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Recommendation generation failed")


@router.post("/qa", response_model=QAResponse)
async def ask_question(
    request: QARequest,
) -> QAResponse:
    """
    Ask a question and get RAG-based answer.

    Args:
        request: Question and parameters

    Returns:
        QAResponse: Answer with relevant documents

    Raises:
        HTTPException: If Q&A fails
    """
    try:
        # In production, implement RAG with vector embeddings
        # For now, return a placeholder
        answer = await llama_service.generate_summary(request.question, 200)

        return QAResponse(
            answer=answer,
            relevant_documents=["document1.pdf", "document2.pdf"],
            confidence=0.85,
        )
    except AIServiceError as e:
        raise HTTPException(status_code=503, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Q&A failed")
