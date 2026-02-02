"""Background task queue service for async operations."""

from typing import Callable, Any
import asyncio
import logging

logger = logging.getLogger(__name__)


class TaskQueue:
    """Simple in-memory task queue for background jobs."""

    def __init__(self):
        self.tasks = []

    async def enqueue(self, coro):
        """
        Enqueue a coroutine to run asynchronously.
        
        Args:
            coro: Async coroutine to execute
        """
        task = asyncio.create_task(coro)
        self.tasks.append(task)
        # Log when task completes
        task.add_done_callback(lambda t: logger.info(f"Task completed: {t.get_name()}"))

    async def enqueue_with_callback(self, coro, callback: Callable[[Any], Any] = None):
        """
        Enqueue with optional callback on completion.
        
        Args:
            coro: Async coroutine to execute
            callback: Optional sync callback for result
        """
        async def _wrapper():
            try:
                result = await coro
                if callback:
                    callback(result)
                return result
            except Exception as e:
                logger.error(f"Task failed: {e}")
                raise

        await self.enqueue(_wrapper())


# Global task queue instance
task_queue = TaskQueue()
