from fastapi import Header, HTTPException, status
from app.config import get_settings
from app.db.supabase import get_supabase_client
from app.schemas.common import ErrorResponse

async def get_current_user(authorization: str = Header(None)) -> str:
    """
    FastAPI dependency that extracts and validates the Supabase JWT token.
    Returns the authenticated user's UUID string.
    """
    settings = get_settings()

    # In DEMO_MODE, provide a fallback test user ID if no auth header is supplied
    if settings.DEMO_MODE and not authorization:
        return "demo-user-0000-0000-0000-000000000000"

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorResponse(
                code="UNAUTHORIZED",
                message="Missing or malformed Authorization header. Expected 'Bearer <token>'."
            ).model_dump()
        )

    token = authorization.split("Bearer ")[1].strip()
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
