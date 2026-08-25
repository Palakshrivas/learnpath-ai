"""
Verifies a JWT that Java's auth service already issued. This service
does not own signup/login/passwords — it only needs to know WHO is
calling, so every route depends on get_current_user_id().

Two things to confirm with whoever built the Java side before this
will actually work:

1. Claim name for the user id. This checks "userId", then "user_id",
   then falls back to the standard "sub" claim. If Java's JwtBuilder
   puts the id somewhere else, add that key to USER_ID_CLAIMS below.

2. Secret encoding. Java's jjwt often does
   Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)) — i.e. the
   configured secret string is base64 and gets decoded to raw bytes
   before signing. If that's the case here, set
   JWT_SECRET_IS_BASE64=true in .env, otherwise python-jose will
   verify against the wrong bytes and every token will fail.
"""
import base64
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_SECRET_IS_BASE64

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not set. This must be the exact same secret your "
        "Java auth service signs tokens with — set it in .env."
    )

USER_ID_CLAIMS = ["userId", "user_id", "sub"]

bearer_scheme = HTTPBearer()


def _signing_key() -> bytes | str:
    if JWT_SECRET_IS_BASE64:
        return base64.b64decode(JWT_SECRET)
    return JWT_SECRET


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, _signing_key(), algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = next((payload.get(claim) for claim in USER_ID_CLAIMS if payload.get(claim)), None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has no user identifier")
    return str(user_id)
