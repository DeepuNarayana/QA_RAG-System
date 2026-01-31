"""
Security Module

Handles authentication, token generation, and password hashing with proper
cryptographic standards.
"""

from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import uuid
from datetime import timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis
from app.core import get_db
from app.models import User

from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenData(BaseModel):
    """Token data payload."""

    user_id: int
    username: str
    email: str
    role: str
    jti: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hashed version.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against

    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        str: The hashed password
    """
    return pwd_context.hash(password)


def create_access_token(
    data: TokenData, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Token data to encode
        expires_delta: Custom expiration time delta

    Returns:
        str: The encoded JWT token

    Raises:
        Exception: If token creation fails
    """
    to_encode = data.dict()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    # Add issued-at and unique token id (jti) for revocation tracking
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc).timestamp(), "jti": jti})

    try:
        encoded_jwt = jwt.encode(
            to_encode, settings.secret_key, algorithm=settings.algorithm
        )
        return encoded_jwt
    except Exception as e:
        raise Exception(f"Failed to create access token: {str(e)}")


def decode_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT token.

    Args:
        token: The JWT token to decode

    Returns:
        Optional[TokenData]: The decoded token data or None if invalid

    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: int = payload.get("user_id")
        username: str = payload.get("username")
        email: str = payload.get("email")
        role: str = payload.get("role", "user")
        jti: Optional[str] = payload.get("jti")

        if user_id is None or username is None:
            return None

        token_data = TokenData(user_id=user_id, username=username, email=email, role=role, jti=jti)
        return token_data
    except JWTError:
        return None


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def revoke_token(token: str) -> None:
    """Revoke a JWT by storing its JTI in Redis until the token expires."""
    token_data = decode_token(token)
    if not token_data or not token_data.jti:
        return
    redis = await get_redis()
    try:
        # Decode raw to get exp for TTL
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        exp = int(payload.get("exp", 0))
        now = int(datetime.now(timezone.utc).timestamp())
        ttl = max(exp - now, 0)
        key = f"revoked:token:{token_data.jti}"
        await redis.set(key, "1", ex=ttl)
    except Exception:
        # best-effort: if we cannot decode, skip
        return


async def is_token_revoked(token: str) -> bool:
    token_data = decode_token(token)
    if not token_data or not token_data.jti:
        return False
    redis = await get_redis()
    key = f"revoked:token:{token_data.jti}"
    val = await redis.get(key)
    return val is not None


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    token_data = decode_token(token)
    if token_data is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if await is_token_revoked(token):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    # fetch user from DB
    try:
        stmt = await db.execute(__import__("sqlalchemy").select(User).where(User.id == token_data.user_id))
        user = stmt.scalars().first()
    except Exception:
        user = None

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    return user
