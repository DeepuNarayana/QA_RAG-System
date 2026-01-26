"""API module initialization."""

from app.api.routes import ai, auth, books, reviews

__all__ = ["auth", "books", "reviews", "ai"]
