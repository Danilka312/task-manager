from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.auth.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.infra.db import get_db
from app.infra.models import UserORM
from app.auth.deps import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str | None = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    created_at: datetime


class TokenPair(BaseModel):
    access: str
    refresh: str


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterBody, db: Annotated[Session, Depends(get_db)]):
    existing = db.query(UserORM).filter(UserORM.email == body.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = UserORM(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, email=user.email, full_name=user.full_name, created_at=user.created_at)


@router.post("/login", response_model=TokenPair)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Annotated[Session, Depends(get_db)]):
    user = db.query(UserORM).filter(UserORM.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")

    claims = {"sub": user.email}
    return TokenPair(access=create_access_token(claims), refresh=create_refresh_token(claims))


class RefreshBody(BaseModel):
    refresh: str


class AccessToken(BaseModel):
    access: str


@router.post("/refresh", response_model=AccessToken)
def refresh_token(body: RefreshBody):
    # Validate refresh token by decoding; just re-issue access token for same subject
    from jose import jwt
    from app.auth.security import ALGORITHM, JWT_SECRET

    try:
        payload = jwt.decode(body.refresh, JWT_SECRET, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        if subject is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return AccessToken(access=create_access_token({"sub": subject}))


@router.get("/me", response_model=UserResponse)
def me(current_user: Annotated[UserORM, Depends(get_current_user)]):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
    )


