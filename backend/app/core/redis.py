"""Redis client helper for shared use (token blacklist, cache)."""

from typing import Optional

from redis.asyncio import Redis

from app.core.config import settings

_redis: Optional[Redis] = None


def get_redis_url() -> str:
    return settings.redis_url


async def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = Redis.from_url(get_redis_url(), encoding="utf-8", decode_responses=True)
    return _redis
