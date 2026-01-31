"""Dependency composition and provider factories."""

from app.core.config import settings


def get_storage_provider():
    provider = settings.storage_provider.lower()
    if provider == "local":
        from app.adapters.storage_local import LocalFileStorage

        return LocalFileStorage()

    # TODO: add S3 provider
    from app.adapters.storage_local import LocalFileStorage

    return LocalFileStorage()
