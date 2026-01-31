"""
Main Application Factory

Creates and configures the FastAPI application with all routes and middleware.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.routes import ai, auth, books, reviews
from app.core import close_db, init_db, settings, setup_logging

# Setup logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for application startup and shutdown.

    Args:
        app: FastAPI application instance

    Yields:
        None
    """
    # Startup
    try:
        await init_db()
    except Exception as e:
        print(f"Failed to initialize database: {e}")

    yield

    # Shutdown
    try:
        await close_db()
    except Exception as e:
        print(f"Failed to close database: {e}")


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.

    Returns:
        FastAPI: Configured application instance
    """
    app = FastAPI(
        title="Intelligent Book Management System",
        description="RAG-based book management with Llama3 integration",
        version="1.0.0",
        lifespan=lifespan,
    )

    # Add middleware
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Trusted host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1"],
    )

    # Include routers
    app.include_router(auth.router)
    app.include_router(books.router)
    app.include_router(reviews.router)
    app.include_router(ai.router)

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "ok", "version": "1.0.0"}

    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint with API information."""
        return {
            "message": "Intelligent Book Management System",
            "version": "1.0.0",
            "docs_url": "/docs",
            "api_prefix": settings.api_v1_str,
        }

    return app


app = create_app()
