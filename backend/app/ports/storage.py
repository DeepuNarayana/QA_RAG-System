from __future__ import annotations

from abc import ABC, abstractmethod
from typing import AsyncIterator


class StorageProvider(ABC):
    """Abstract storage provider for file blobs."""

    @abstractmethod
    async def save(self, filename: str, data: bytes) -> str:
        """Save bytes and return an object id or path."""

    @abstractmethod
    async def read(self, object_id: str) -> AsyncIterator[bytes]:
        """Read stored object as an async iterator of bytes."""
