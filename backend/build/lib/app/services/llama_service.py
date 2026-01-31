"""
AI Service Module

Handles integration with Llama3 via OpenRouter for content summarization
and embedding generation.
"""

from typing import List, Optional

import httpx
from app.core.config import settings
from app.core.logging import get_logger
from app.utils.exceptions import AIServiceError

logger = get_logger(__name__)


class LlamaService:
    """Service for Llama3 model integration."""

    def __init__(self):
        """Initialize Llama service."""
        self.api_key = settings.openrouter_api_key
        self.model = settings.llama_model
        self.base_url = "https://openrouter.ai/api/v1"

    async def generate_summary(
        self, content: str, max_length: int = 500
    ) -> str:
        """
        Generate a summary for the given content using Llama3.

        Args:
            content: Content to summarize
            max_length: Maximum length of summary

        Returns:
            str: Generated summary

        Raises:
            AIServiceError: If API call fails
        """
        try:
            prompt = f"""Please provide a concise summary of the following content in {max_length} characters or less:

{content}

Summary:"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "http://localhost:8000",
                        "X-Title": "Intelligent Book Management System",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "You are a helpful assistant."},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.7,
                        "max_tokens": int(max_length / 4),  # Rough estimate
                    },
                )

            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"Llama3 API error: {error_detail}")
                raise AIServiceError(f"Failed to generate summary: {error_detail}")

            result = response.json()
            summary = result.get("choices", [{}])[0].get("message", {}).get("content", "")

            if not summary:
                raise AIServiceError("Empty summary generated")

            logger.info("Summary generated successfully")
            return summary.strip()

        except httpx.HTTPError as e:
            logger.error(f"HTTP error during summarization: {str(e)}")
            raise AIServiceError(f"HTTP error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during summarization: {str(e)}")
            raise AIServiceError(f"Summarization failed: {str(e)}")

    async def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate embeddings for the given text.

        Note: For production, consider using a dedicated embedding model.
        This is a placeholder implementation.

        Args:
            text: Text to embed

        Returns:
            List[float]: Embedding vector

        Raises:
            AIServiceError: If embedding generation fails
        """
        try:
            # In production, use a proper embedding model like sentence-transformers
            # For now, this is a placeholder
            logger.warning("Using placeholder embeddings. Use proper embedding model in production.")
            
            # Generate a simple hash-based embedding
            from sentence_transformers import SentenceTransformer
            
            model = SentenceTransformer('all-MiniLM-L6-v2')
            embeddings = model.encode(text)
            
            return embeddings.tolist()

        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise AIServiceError(f"Embedding generation failed: {str(e)}")

    async def generate_recommendations(
        self, user_preferences: str, top_k: int = 5
    ) -> str:
        """
        Generate book recommendations based on user preferences.

        Args:
            user_preferences: User's preferences description
            top_k: Number of recommendations to return

        Returns:
            str: Recommendations

        Raises:
            AIServiceError: If API call fails
        """
        try:
            prompt = f"""Based on the following user preferences, suggest {top_k} books that the user might enjoy:

User Preferences: {user_preferences}

Please provide {top_k} book recommendations with brief explanations.

Recommendations:"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "http://localhost:8000",
                        "X-Title": "Intelligent Book Management System",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "You are a helpful book recommendation assistant."},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000,
                    },
                )

            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"Llama3 API error: {error_detail}")
                raise AIServiceError(f"Failed to generate recommendations: {error_detail}")

            result = response.json()
            recommendations = result.get("choices", [{}])[0].get("message", {}).get("content", "")

            if not recommendations:
                raise AIServiceError("Empty recommendations generated")

            logger.info("Recommendations generated successfully")
            return recommendations.strip()

        except httpx.HTTPError as e:
            logger.error(f"HTTP error during recommendation generation: {str(e)}")
            raise AIServiceError(f"HTTP error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during recommendation generation: {str(e)}")
            raise AIServiceError(f"Recommendation generation failed: {str(e)}")


llama_service = LlamaService()
