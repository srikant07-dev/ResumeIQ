from fastapi import APIRouter
from app.config import get_settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        demo_mode=settings.DEMO_MODE
    )
