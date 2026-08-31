from supabase import create_client, Client
from app.config import get_settings
from functools import lru_cache

@lru_cache()
def get_supabase_client() -> Client:
    """
    Returns the Supabase server client configured with SUPABASE_SERVICE_ROLE_KEY.
    Used exclusively in backend services. All database queries executed through
    this client MUST explicitly filter by authenticated user_id.
    """
    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        # Returns a dummy or unconfigured client in demo/local testing mode
        pass
    return create_client(
        supabase_url=settings.SUPABASE_URL or "https://placeholder.supabase.co",
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY or "placeholder-key"
    )
