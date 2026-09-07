import logging
from supabase import create_client, Client
from app.config import get_settings
from functools import lru_cache

logger = logging.getLogger(__name__)

@lru_cache()
def get_supabase_client() -> Client:
    """
    Returns the Supabase server client configured with SUPABASE_SERVICE_ROLE_KEY.
    Used exclusively in backend services. All database queries executed through
    this client MUST explicitly filter by authenticated user_id.
    """
    settings = get_settings()
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY

    if not url or not key:
        logger.warning(
            "Supabase credentials not configured (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing). "
            "Using fallback placeholder client for demo/offline operations."
        )
        url = "https://placeholder.supabase.co"
        key = "placeholder-key"

    return create_client(
        supabase_url=url,
        supabase_key=key
    )

