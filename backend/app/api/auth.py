from fastapi import APIRouter, Depends
from app.utils.security import get_current_user
from app.db.supabase import get_supabase_client
from app.schemas.user import UserProfile
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me", response_model=UserProfile)
async def get_my_profile(user_id: str = Depends(get_current_user)):
    """
    Returns the authenticated user's profile.
    Validates token end-to-end.
    """
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        return UserProfile(
            id=user_id,
            email="demo.user@example.com",
            full_name="Demo Candidate"
        )

    supabase = get_supabase_client()
    try:
        res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if res and res.data:
            return UserProfile(**res.data)
    except Exception:
        pass

    return UserProfile(
        id=user_id,
        email="user@resumeiq.app",
        full_name="ResumeIQ User"
    )
