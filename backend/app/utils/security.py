from fastapi import Header, HTTPException, status
from app.config import get_settings
from app.db.supabase import get_supabase_client
from app.schemas.common import ErrorResponse

DEMO_USER_ID = "00000000-0000-0000-0000-000000000000"

async def get_current_user(authorization: str = Header(None)) -> str:
    """
    FastAPI dependency that extracts and validates the Supabase JWT token.
    Returns the authenticated user's UUID string.
    In demo mode, only the explicit token 'demo-token' is accepted.
    Strictly adheres to API_SPEC.md.
    """
    settings = get_settings()

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorResponse(
                code="UNAUTHORIZED",
                message="Missing or malformed Authorization header. Expected 'Bearer <token>'."
            ).model_dump()
        )

    token = authorization.split("Bearer ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorResponse(
                code="UNAUTHORIZED",
                message="Empty bearer token provided."
            ).model_dump()
        )

    # Demo token verification: only accepted when DEMO_MODE is explicitly enabled
    if token in ("demo-token", "demo"):
        if settings.DEMO_MODE:
            return DEMO_USER_ID
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorResponse(
                code="UNAUTHORIZED",
                message="Demo authentication is disabled in production mode."
            ).model_dump()
        )

    # If in pure offline demo mode without Supabase, reject non-demo tokens
    if settings.DEMO_MODE and not settings.SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorResponse(
                code="UNAUTHORIZED",
                message="Invalid session token. Expected 'Bearer demo-token'."
            ).model_dump()
        )

    supabase = get_supabase_client()

    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise ValueError("User not found for token")
        return str(user_response.user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorResponse(
                code="UNAUTHORIZED",
                message="Invalid or expired session token. Please sign in again.",
                details={"error": str(e)}
            ).model_dump()
        )

