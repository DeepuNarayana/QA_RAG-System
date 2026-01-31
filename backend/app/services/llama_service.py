"""AI provider abstraction and default implementations.

This module provides a small dependency-injection-friendly abstraction for
LLM providers. The application should import `llama_service` (keeps
backwards-compatibility) which is a provider instance selected based
on `settings.llm_provider`.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

import httpx
from app.core.config import settings
from app.core.logging import get_logger
from app.utils.exceptions import AIServiceError

logger = get_logger(__name__)


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate_summary(self, content: str, max_length: int = 500) -> str:
        raise NotImplementedError

    @abstractmethod
    async def generate_embeddings(self, text: str) -> List[float]:
        raise NotImplementedError

    @abstractmethod
    async def generate_recommendations(self, user_preferences: str, top_k: int = 5) -> str:
        raise NotImplementedError


class OpenRouterProvider(LLMProvider):
    """Provider that uses OpenRouter (Llama3) API."""

    def __init__(self) -> None:
        self.api_key = settings.openrouter_api_key
        self.model = settings.llama_model
        self.base_url = "https://openrouter.ai/api/v1"

    async def _post_chat(self, prompt: str, max_tokens: int = 256) -> str:
        try:
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
                        "max_tokens": max_tokens,
                    },
                )

            if response.status_code != 200:
                logger.error("OpenRouter API error: %s", response.text)
                raise AIServiceError(f"OpenRouter error: {response.text}")

            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "")

        except httpx.HTTPError as e:
            logger.error("HTTP error during OpenRouter request: %s", str(e))
            raise AIServiceError(f"HTTP error: {str(e)}")

    async def generate_summary(self, content: str, max_length: int = 500) -> str:
        prompt = (
            f"Please provide a concise summary of the following content in {max_length} characters or less:\n\n{content}\n\nSummary:"
        )
        summary = await self._post_chat(prompt, max_tokens=int(max_length / 4))
        if not summary:
            raise AIServiceError("Empty summary generated")
        return summary.strip()

    async def generate_embeddings(self, text: str) -> List[float]:
        # Production should use a dedicated embedding model; keep parity with
        # prior implementation using sentence-transformers.
        try:
            logger.warning("Using sentence-transformers for local embeddings.")
            from sentence_transformers import SentenceTransformer

            model = SentenceTransformer("all-MiniLM-L6-v2")
            embeddings = model.encode(text)
            return embeddings.tolist()
        except Exception as e:
            logger.error("Embedding generation error: %s", str(e))
            raise AIServiceError(f"Embedding generation failed: {str(e)}")

    async def generate_recommendations(self, user_preferences: str, top_k: int = 5) -> str:
        prompt = (
            f"Based on the following user preferences, suggest {top_k} books that the user might enjoy:\n\n"
            f"User Preferences: {user_preferences}\n\nPlease provide {top_k} book recommendations with brief explanations.\n\nRecommendations:"
        )
        recs = await self._post_chat(prompt, max_tokens=1000)
        if not recs:
            raise AIServiceError("Empty recommendations generated")
        return recs.strip()


class MockLLMProvider(LLMProvider):
    """Simple mock provider for local development and tests.

    If `settings.llm_url` points to an HTTP mock service, this provider will
    forward requests there. Otherwise it returns canned responses.
    """

    def __init__(self) -> None:
        self.base_url = settings.llm_url

    async def _forward(self, path: str, payload: dict) -> str:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/{path.lstrip('/')}", json=payload)
            response.raise_for_status()
            return response.json().get("result", response.text)
        except Exception:
            # Fall back to a simple canned response
            return "[mocked response]"

    async def generate_summary(self, content: str, max_length: int = 500) -> str:
        payload = {"content": content, "max_length": max_length}
        return await self._forward("generate-summary", payload)

    async def generate_embeddings(self, text: str) -> List[float]:
        # Return a deterministic small vector for tests
        return [float(ord(c) % 10) for c in text[:64]]

    async def generate_recommendations(self, user_preferences: str, top_k: int = 5) -> str:
        payload = {"user_preferences": user_preferences, "top_k": top_k}
        return await self._forward("recommendations", payload)


def get_llm_provider() -> LLMProvider:
    provider = settings.llm_provider.lower()
    if provider == "mock":
        return MockLLMProvider()
    # default to OpenRouter
    return OpenRouterProvider()


# Backwards-compatible name used across the codebase
llama_service: LLMProvider = get_llm_provider()
