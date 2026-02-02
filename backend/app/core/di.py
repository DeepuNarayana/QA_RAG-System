"""
Dependency Injection Container

Manages singleton instances and provides factory methods for services.
Supports pluggable providers for storage and LLM.
"""

from typing import Protocol, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


# ============================================================================
# INTERFACES (Protocols)
# ============================================================================


class StorageProvider(Protocol):
    """Interface for storage backends."""

    async def save_file(self, filename: str, content: bytes) -> str:
        """Save file and return path/key."""
        ...

    async def read_file(self, file_path: str) -> Optional[bytes]:
        """Read file by path/key."""
        ...

    async def delete_file(self, file_path: str) -> bool:
        """Delete file by path/key."""
        ...


class LLMProvider(Protocol):
    """Interface for LLM backends."""

    async def generate_book_summary(
        self, content: str, max_length: int = 200
    ) -> str:
        """Generate summary of content."""
        ...

    async def analyze_reviews(self, reviews: list[str]) -> dict:
        """Analyze reviews and return consensus."""
        ...


# ============================================================================
# CONCRETE IMPLEMENTATIONS
# ============================================================================


class LocalStorageProvider:
    """Local file system storage implementation."""

    def __init__(self, base_path: str = "./data/books"):
        from pathlib import Path

        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save_file(self, filename: str, content: bytes) -> str:
        """Save file to local disk."""
        from pathlib import Path

        file_path = self.base_path / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)

        with open(file_path, "wb") as f:
            f.write(content)

        return str(file_path)

    async def read_file(self, file_path: str) -> Optional[bytes]:
        """Read file from local disk."""
        from pathlib import Path

        path = Path(file_path)
        if path.exists():
            with open(path, "rb") as f:
                return f.read()
        return None

    async def delete_file(self, file_path: str) -> bool:
        """Delete file from local disk."""
        import os
        from pathlib import Path

        path = Path(file_path)
        if path.exists():
            os.remove(path)
            return True
        return False


class S3StorageProvider:
    """AWS S3 storage implementation with full boto3 integration."""

    def __init__(
        self,
        bucket_name: str,
        region: str = "us-east-1",
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
    ):
        try:
            import aioboto3
        except ImportError:
            raise ImportError(
                "aioboto3 is required for S3 storage. Install with: pip install aioboto3"
            )

        self.bucket_name = bucket_name
        self.region = region
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key

        # Initialize session
        self.session = aioboto3.Session(
            region_name=region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )
        logger.info(f"S3StorageProvider initialized for bucket: {bucket_name}")

    async def save_file(self, filename: str, content: bytes) -> str:
        """Upload file to S3.

        Args:
            filename: Name of the file to save
            content: File content as bytes

        Returns:
            str: S3 object key (path)
        """
        try:
            async with self.session.client("s3") as s3:
                await s3.put_object(
                    Bucket=self.bucket_name,
                    Key=filename,
                    Body=content,
                    ContentType="application/octet-stream",
                )
            logger.info(f"File uploaded to S3: {filename}")
            return f"s3://{self.bucket_name}/{filename}"
        except Exception as e:
            logger.error(f"Error uploading file to S3: {e}")
            raise

    async def read_file(self, file_path: str) -> Optional[bytes]:
        """Download file from S3.

        Args:
            file_path: S3 object key or full S3 URI

        Returns:
            Optional[bytes]: File content or None if not found
        """
        try:
            # Extract key from S3 URI if needed
            key = file_path.replace(f"s3://{self.bucket_name}/", "")

            async with self.session.client("s3") as s3:
                response = await s3.get_object(Bucket=self.bucket_name, Key=key)
                content = await response["Body"].read()
            logger.info(f"File downloaded from S3: {key}")
            return content
        except Exception as e:
            logger.warning(f"Error reading file from S3: {e}")
            return None

    async def delete_file(self, file_path: str) -> bool:
        """Delete file from S3.

        Args:
            file_path: S3 object key or full S3 URI

        Returns:
            bool: True if deleted, False on error
        """
        try:
            # Extract key from S3 URI if needed
            key = file_path.replace(f"s3://{self.bucket_name}/", "")

            async with self.session.client("s3") as s3:
                await s3.delete_object(Bucket=self.bucket_name, Key=key)
            logger.info(f"File deleted from S3: {key}")
            return True
        except Exception as e:
            logger.error(f"Error deleting file from S3: {e}")
            return False


class MockLLMProvider:
    """Mock LLM provider for testing."""

    async def generate_book_summary(
        self, content: str, max_length: int = 200
    ) -> str:
        """Generate mock summary."""
        words = content.split()[:50]
        summary = " ".join(words)
        return summary + "..." if len(content.split()) > 50 else summary

    async def analyze_reviews(self, reviews: list[str]) -> dict:
        """Generate mock review analysis."""
        if not reviews:
            return {
                "sentiment": "neutral",
                "themes": [],
                "consensus": "No reviews yet",
            }

        avg_length = sum(len(r.split()) for r in reviews) / len(reviews)
        return {
            "sentiment": "positive" if avg_length > 10 else "neutral",
            "themes": ["character development", "plot"],
            "consensus": f"Based on {len(reviews)} reviews, readers appreciate this book.",
        }


class OpenAILLMProvider:
    """OpenAI LLM provider with full API integration."""

    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        try:
            import openai
        except ImportError:
            raise ImportError(
                "openai is required for OpenAI provider. Install with: pip install openai"
            )

        self.api_key = api_key
        self.model = model
        self.client = openai.AsyncOpenAI(api_key=api_key)
        logger.info(f"OpenAILLMProvider initialized with model: {model}")

    async def generate_book_summary(
        self, content: str, max_length: int = 200
    ) -> str:
        """Generate summary using OpenAI.

        Args:
            content: Book content to summarize
            max_length: Maximum length of the summary

        Returns:
            str: Generated summary
        """
        try:
            # Truncate content if too long to avoid token limits
            max_tokens_for_content = 2000
            truncated_content = content[:max_tokens_for_content]

            prompt = f"""Provide a concise summary of the following book content in {max_length} words or less:

{truncated_content}

Summary:"""

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=min(max_length // 4 + 50, 500),
            )
            summary = response.choices[0].message.content.strip()
            logger.info("Book summary generated successfully")
            return summary
        except Exception as e:
            logger.error(f"Error generating summary with OpenAI: {e}")
            raise

    async def analyze_reviews(self, reviews: list[str]) -> dict:
        """Analyze reviews using OpenAI.

        Args:
            reviews: List of review texts to analyze

        Returns:
            dict: Analysis with 'sentiment', 'themes', and 'consensus'
        """
        try:
            if not reviews:
                return {
                    "sentiment": "neutral",
                    "themes": [],
                    "consensus": "No reviews available for analysis.",
                }

            # Combine reviews for analysis (limit to 10)
            reviews_text = "\n".join(f"- {review}" for review in reviews[:10])

            prompt = f"""Analyze the following {len(reviews)} book reviews and provide:
1. Overall sentiment (positive, negative, mixed, neutral)
2. Key themes (as a JSON array of 3-5 strings)
3. A consensus statement (1-2 sentences)

Reviews:
{reviews_text}

Respond in this exact JSON format:
{{
  "sentiment": "<sentiment>",
  "themes": [<themes>],
  "consensus": "<consensus statement>"
}}"""

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=300,
            )
            response_text = response.choices[0].message.content.strip()

            # Parse JSON response
            import json
            import re
            json_match = re.search(r"\{[^{}]*\}", response_text, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
            else:
                analysis = json.loads(response_text)

            logger.info("Review analysis completed successfully")
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing reviews with OpenAI: {e}")
            return {
                "sentiment": "mixed",
                "themes": ["quality", "engagement", "writing style"],
                "consensus": "Reviews show varied opinions on the book's merit.",
            }


class OpenRouterLLMProvider:
    """OpenRouter LLM provider (Llama 3 integration)."""

    def __init__(self, api_key: str, model: str = "meta-llama/llama-3-8b-instruct"):
        self.api_key = api_key
        self.model = model
        logger.warning("OpenRouterLLMProvider initialized but not fully implemented")

    async def generate_book_summary(
        self, content: str, max_length: int = 200
    ) -> str:
        """Generate summary using OpenRouter."""
        logger.warning("OpenRouter summarization not implemented; using mock")
        words = content.split()[:50]
        return " ".join(words) + "..."

    async def analyze_reviews(self, reviews: list[str]) -> dict:
        """Analyze reviews using OpenRouter."""
        logger.warning("OpenRouter analysis not implemented; using mock")
        return {
            "sentiment": "positive",
            "themes": ["storytelling", "character"],
            "consensus": "Strong reader engagement",
        }


# ============================================================================
# DI CONTAINER
# ============================================================================


class Container:
    """Dependency Injection container for managing service instances."""

    def __init__(self):
        self._storage_provider: Optional[StorageProvider] = None
        self._llm_provider: Optional[LLMProvider] = None

    def set_storage_provider(self, provider: StorageProvider) -> None:
        """Register storage provider."""
        self._storage_provider = provider
        logger.info(f"Storage provider set to {provider.__class__.__name__}")

    def get_storage_provider(self) -> StorageProvider:
        """Get registered storage provider."""
        if not self._storage_provider:
            raise RuntimeError("Storage provider not configured")
        return self._storage_provider

    def set_llm_provider(self, provider: LLMProvider) -> None:
        """Register LLM provider."""
        self._llm_provider = provider
        logger.info(f"LLM provider set to {provider.__class__.__name__}")

    def get_llm_provider(self) -> LLMProvider:
        """Get registered LLM provider."""
        if not self._llm_provider:
            raise RuntimeError("LLM provider not configured")
        return self._llm_provider


# ============================================================================
# FACTORY FUNCTIONS
# ============================================================================


def create_storage_provider(provider_type: str, **kwargs) -> StorageProvider:
    """Factory function to create storage provider based on configuration."""
    if provider_type == "local":
        return LocalStorageProvider(kwargs.get("base_path", "./data/books"))
    elif provider_type == "s3":
        return S3StorageProvider(
            bucket_name=kwargs.get("bucket_name", "luminalib-books"),
            region=kwargs.get("region", "us-east-1"),
        )
    else:
        raise ValueError(f"Unknown storage provider: {provider_type}")


def create_llm_provider(provider_type: str, **kwargs) -> LLMProvider:
    """Factory function to create LLM provider based on configuration."""
    if provider_type == "mock":
        return MockLLMProvider()
    elif provider_type == "openai":
        return OpenAILLMProvider(
            api_key=kwargs.get("api_key", ""),
            model=kwargs.get("model", "gpt-3.5-turbo"),
        )
    elif provider_type == "openrouter":
        return OpenRouterLLMProvider(
            api_key=kwargs.get("api_key", ""),
            model=kwargs.get("model", "meta-llama/llama-3-8b-instruct"),
        )
    else:
        raise ValueError(f"Unknown LLM provider: {provider_type}")


# ============================================================================
# GLOBAL CONTAINER & INITIALIZATION
# ============================================================================

container = Container()


def initialize_container():
    """Initialize DI container with configured providers."""
    storage_type = settings.storage_provider.lower()
    llm_type = settings.llm_provider.lower()

    storage = create_storage_provider(storage_type, base_path=settings.storage_url)
    llm = create_llm_provider(
        llm_type,
        api_key=settings.openrouter_api_key,
        model=settings.llama_model,
    )

    container.set_storage_provider(storage)
    container.set_llm_provider(llm)
    logger.info("Dependency injection container initialized")
