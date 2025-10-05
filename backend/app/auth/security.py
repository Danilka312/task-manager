import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import jwt

# было:
# from passlib.context import CryptContext
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# стало:
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


ALGORITHM = "HS256"
JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")


def hash_password(pwd: str) -> str:
    return pwd_context.hash(pwd)


def verify_password(pwd: str, hashed: str) -> bool:
    return pwd_context.verify(pwd, hashed)


def _create_token(data: Dict[str, Any], expires_minutes: int) -> str:
    to_encode: Dict[str, Any] = {**data}
    expire_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire_at})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)


def create_access_token(data: Dict[str, Any], expires_minutes: int = 30) -> str:
    return _create_token(data, expires_minutes)


def create_refresh_token(data: Dict[str, Any], expires_minutes: int = 60 * 24 * 7) -> str:
    return _create_token(data, expires_minutes)


