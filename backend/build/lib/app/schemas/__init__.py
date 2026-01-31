"""
Pydantic Schemas

Request/response schemas for API endpoints with proper validation.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    """Base user schema."""

    username: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""

    password: str = Field(..., min_length=8)

    @validator("password")
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserUpdate(BaseModel):
    """User update schema."""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    """User response schema."""

    id: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Login request schema."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class BookBase(BaseModel):
    """Base book schema."""

    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    genre: Optional[str] = None
    year_published: Optional[int] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    pages: Optional[int] = None


class BookCreate(BookBase):
    """Book creation schema."""

    pass


class BookUpdate(BaseModel):
    """Book update schema."""

    title: Optional[str] = None
    author: Optional[str] = None
    genre: Optional[str] = None
    year_published: Optional[int] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    pages: Optional[int] = None


class BookResponse(BookBase):
    """Book response schema."""

    id: int
    owner_id: int
    summary: Optional[str] = None
    average_rating: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    """Base review schema."""

    rating: float = Field(..., ge=1, le=5)
    review_text: Optional[str] = None


class ReviewCreate(ReviewBase):
    """Review creation schema."""

    pass


class ReviewResponse(ReviewBase):
    """Review response schema."""

    id: int
    book_id: int
    user_id: int
    helpful_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    """Base document schema."""

    filename: str
    document_type: str


class DocumentCreate(DocumentBase):
    """Document creation schema."""

    pass


class DocumentResponse(DocumentBase):
    """Document response schema."""

    id: int
    owner_id: int
    file_path: str
    file_size: Optional[int] = None
    is_ingested: bool
    ingestion_status: str
    ingestion_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SummaryRequest(BaseModel):
    """Request schema for generating summaries."""

    content: str
    max_length: Optional[int] = 500


class QARequest(BaseModel):
    """Request schema for Q&A endpoint."""

    question: str
    top_k: Optional[int] = 3


class QAResponse(BaseModel):
    """Response schema for Q&A endpoint."""

    answer: str
    relevant_documents: List[str]
    confidence: float
