"""Storage service for handling file uploads and retrievals."""

import os
from pathlib import Path
from typing import Optional


class StorageService:
    """Abstracted storage service for local file management."""

    def __init__(self, base_path: str = "./data/books"):
        """
        Initialize storage service.

        Args:
            base_path: Base directory for storing files
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save_file(self, filename: str, content: bytes) -> str:
        """
        Save file to storage.

        Args:
            filename: Name of the file
            content: File content bytes

        Returns:
            str: File path/key for retrieval
        """
        file_path = self.base_path / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)

        with open(file_path, "wb") as f:
            f.write(content)

        return str(file_path)

    async def read_file(self, file_path: str) -> Optional[bytes]:
        """
        Read file from storage.

        Args:
            file_path: Path/key to the file

        Returns:
            Optional[bytes]: File content or None if not found
        """
        path = Path(file_path)
        if path.exists():
            with open(path, "rb") as f:
                return f.read()
        return None

    async def delete_file(self, file_path: str) -> bool:
        """
        Delete file from storage.

        Args:
            file_path: Path/key to the file

        Returns:
            bool: True if deleted, False if not found
        """
        path = Path(file_path)
        if path.exists():
            os.remove(path)
            return True
        return False
