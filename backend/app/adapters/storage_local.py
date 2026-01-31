from __future__ import annotations

import os
import asyncio
from typing import AsyncIterator

from app.ports.storage import StorageProvider
from app.core.config import settings


class LocalFileStorage(StorageProvider):
    def __init__(self) -> None:
        self.base_dir = os.path.abspath(settings.storage_url)
        os.makedirs(self.base_dir, exist_ok=True)

    async def save(self, filename: str, data: bytes) -> str:
        # write file using a thread to avoid blocking the event loop
        path = os.path.join(self.base_dir, filename)

        def _write():
            with open(path, "wb") as f:
                f.write(data)

        await asyncio.to_thread(_write)
        return path

    async def read(self, object_id: str) -> AsyncIterator[bytes]:
        # object_id is a filesystem path here
        def _read_all():
            with open(object_id, "rb") as f:
                return f.read()

        content = await asyncio.to_thread(_read_all)

        async def _iter():
            yield content

        return _iter()
