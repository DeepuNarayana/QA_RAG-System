"""
Database Configuration and Connection Management

Handles async database connections using SQLAlchemy with asyncpg driver.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.database_echo,
    future=True,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,  # Verify connection before using
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, future=True
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session.

    Yields:
        AsyncSession: Database session

    Raises:
        Exception: If database connection fails
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database schema."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")
        # Seed initial data
        await seed_data()
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise


async def seed_data() -> None:
    """Seed initial data if database is empty."""
    from sqlalchemy import select
    from app.models import User, Book
    
    try:
        async with AsyncSessionLocal() as session:
            # Check if books already exist
            result = await session.execute(select(Book))
            existing_books = result.scalars().all()
            
            if len(existing_books) == 0:
                # Check if default user exists
                result = await session.execute(select(User).where(User.username == "testuser"))
                user = result.scalar()
                
                if not user:
                    # Create a default user
                    user = User(
                        username="testuser",
                        email="test@example.com",
                        hashed_password="$2b$12$placeholder",
                        full_name="Test User",
                        is_active=True,
                        role="user",
                    )
                    session.add(user)
                    await session.flush()
                
                # Create sample books
                books = [
                    Book(
                        owner_id=user.id,
                        title="The Great Gatsby",
                        author="F. Scott Fitzgerald",
                        genre="Fiction",
                        year_published=1925,
                        description="A novel set in the Jazz Age",
                        summary="A classic American novel about wealth and love",
                        isbn="978-0-7432-7356-5",
                        pages=180,
                    ),
                    Book(
                        owner_id=user.id,
                        title="To Kill a Mockingbird",
                        author="Harper Lee",
                        genre="Fiction",
                        year_published=1960,
                        description="A gripping tale of racial injustice",
                        summary="A coming-of-age story in the American South",
                        isbn="978-0-06-112008-4",
                        pages=324,
                    ),
                    Book(
                        owner_id=user.id,
                        title="1984",
                        author="George Orwell",
                        genre="Dystopian",
                        year_published=1949,
                        description="A dystopian novel about totalitarianism",
                        summary="A chilling vision of the future under totalitarian rule",
                        isbn="978-0-451-52494-2",
                        pages=328,
                    ),
                ]
                session.add_all(books)
                await session.commit()
                logger.info("Database seeded with initial data")
    except Exception as e:
        logger.warning(f"Seed data skipped: {str(e)}")


async def close_db() -> None:
    """Close database connection."""
    try:
        await engine.dispose()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {str(e)}")
