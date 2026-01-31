"""
Application Configuration Management

This module handles all application configuration from environment variables
with proper type validation and defaults.
"""

from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    api_v1_str: str = "/api/v1"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Database Configuration
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/book_management"
    database_echo: bool = False

    # Llama3 / OpenRouter Configuration
    openrouter_api_key: str = ""
    llama_model: str = "meta-llama/llama-3-8b-instruct"
    # LLM provider selection: 'openrouter' or 'mock'
    llm_provider: str = "openrouter"
    # When using a remote or mock LLM service, point to its base URL
    llm_url: str = "http://localhost:5005"

    # Redis Configuration
    redis_url: str = "redis://localhost:6379/0"

    # Application Configuration
    environment: str = "development"
    debug: bool = True
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # AWS Configuration
    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_s3_bucket: str = ""

    class Config:
        """Pydantic configuration."""

        env_file = ".env"
        case_sensitive = False


settings = Settings()
