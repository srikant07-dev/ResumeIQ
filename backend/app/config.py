from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
ROOT_DIR = BASE_DIR.parent                         # repo root (ResumeAI/)

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResumeIQ API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Server & CORS
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"
    DEMO_MODE: bool = False
    
    # Supabase (Service role key is kept server-side only)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Google Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_DEEP_RESEARCH_API_KEY: str = ""  # Dedicated key for Deep Dive mode (isolated rate limits)
    GEMINI_MODEL: str = "gemini-3.6-flash"
    DEEP_RESEARCH_AGENT: str = "deep-research-preview-04-2026"

    # Search Provider (Tavily Tier 1, DuckDuckGo Tier 2 fallback)
    TAVILY_API_KEY: str = ""

    # Market Intelligence
    MARKET_INTEL_DAILY_LIMIT: int = 3  # Max market intel analyses per user per day

    model_config = SettingsConfigDict(
        env_file=[
            str(BASE_DIR / ".env"),
            str(ROOT_DIR / ".env"),
            ".env"
        ],
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

