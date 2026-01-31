"""Redis client helper for shared use (token blacklist, cache)."""

from typing import Optional

import aioredis

from app.core.config import settings

_redis: Optional[aioredis.Redis] = None


def get_redis_url() -> str:
    return settings.redis_url


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(get_redis_url(), encoding="utf-8", decode_responses=True)
    return _redis
