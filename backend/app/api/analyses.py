import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.security import get_current_user
from app.config import get_settings
from app.services.analysis_service import (
    create_and_run_analysis,
    get_analysis_by_id,
    list_user_analyses,
    delete_user_analysis,
    re_evaluate_analysis
)
from app.services.market_intelligence_service import (
    run_full_market_intelligence,
    update_market_intel_status,
    count_user_market_intel_today,
)
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisResponse,
    AnalysisHistoryItem,
    ReEvaluationRequest,
    ReEvaluationResponse,
    MarketIntelTriggerRequest,
    MarketIntelTriggerResponse,
    MarketIntelQuotaResponse,
)
from app.schemas.common import ErrorResponse

router = APIRouter(prefix="/analyses", tags=["Analyses"])

@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    req: AnalysisCreateRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Primary endpoint to run hybrid resume analysis against a job description.
    """
    return await create_and_run_analysis(req, user_id)

@router.get("", response_model=list[AnalysisHistoryItem])
async def get_analysis_history(user_id: str = Depends(get_current_user)):
    """Lists previous analyses conducted by the authenticated user."""
    return await list_user_analyses(user_id)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_detail(
    analysis_id: str,
    user_id: str = Depends(get_current_user)
):
    """Retrieves full analysis score breakdown, evidence, and recommendations."""
    return await get_analysis_by_id(analysis_id, user_id)

@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user)
):
    """Deletes an analysis record."""
    return await delete_user_analysis(analysis_id, user_id)

@router.post("/{analysis_id}/re-evaluate", response_model=ReEvaluationResponse)
async def re_evaluate(
    analysis_id: str,
    req: ReEvaluationRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Re-evaluates an updated resume against the same job description from a prior analysis.
    Returns the new analysis with computed score deltas and skill migration tracking.
    """
    return await re_evaluate_analysis(
        parent_analysis_id=analysis_id,
        new_resume_id=req.resume_id,
        user_id=user_id
    )


@router.post(
    "/{analysis_id}/market-intel/trigger",
    response_model=MarketIntelTriggerResponse,
)
async def trigger_market_intelligence(
    analysis_id: str,
    req: MarketIntelTriggerRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Triggers async market intelligence analysis for a completed analysis.
    Requires: company_name to be set on the analysis.
    Rate limited to MARKET_INTEL_DAILY_LIMIT per user per day.
    Skipped entirely in DEMO_MODE.
    """
    settings = get_settings()

    # Guard: Demo mode
    if settings.DEMO_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ErrorResponse(
                code="DEMO_MODE",
                message="Market Intelligence is not available in demo mode.",
            ).model_dump(),
        )

    # Guard: Deep Dive requires dedicated API key
    if req.mode == "deep" and not settings.GEMINI_DEEP_RESEARCH_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ErrorResponse(
                code="DEEP_RESEARCH_NOT_CONFIGURED",
                message="Deep Dive mode requires a dedicated API key. Contact admin.",
            ).model_dump(),
        )

    # Guard: Load analysis, verify ownership and company_name exists (from request or stored analysis)
    analysis = await get_analysis_by_id(analysis_id, user_id)
    target_company = (req.company_name or analysis.company_name or "").strip()
    if not target_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="NO_COMPANY_NAME",
                message="Please provide a target company name to run Market Intelligence.",
            ).model_dump(),
        )

    # Persist company name to analysis record if newly provided
    if req.company_name and req.company_name.strip() != (analysis.company_name or ""):
        analysis.company_name = req.company_name.strip()
        if not settings.DEMO_MODE and settings.SUPABASE_URL and user_id != "00000000-0000-0000-0000-000000000000":
            try:
                from app.db.supabase import get_supabase_client
                get_supabase_client().table("analyses").update({"company_name": analysis.company_name}).eq("id", analysis_id).eq("user_id", user_id).execute()
            except Exception as e:
                logger.warning("Failed to update company_name on analysis %s: %s", analysis_id, e)

    # Guard: Already running
    if analysis.market_intel_status == "running":
        return MarketIntelTriggerResponse(
            status="running",
            message="Market intelligence is already in progress.",
        )

    # Guard: Already completed — allow re-trigger by resetting
    # (Users can re-run if they want fresh data)

    # Guard: Rate limit
    daily_count = await count_user_market_intel_today(user_id)
    if daily_count >= settings.MARKET_INTEL_DAILY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=ErrorResponse(
                code="RATE_LIMIT",
                message=f"Daily market intelligence limit reached ({settings.MARKET_INTEL_DAILY_LIMIT}/day). Try again tomorrow.",
            ).model_dump(),
        )

    # Set status to running and spawn background task
    await update_market_intel_status(analysis_id, user_id, "running")
    asyncio.create_task(
        run_full_market_intelligence(analysis_id, user_id, mode=req.mode, company_name=target_company)
    )

    mode_label = "deep dive" if req.mode == "deep" else "fast"
    return MarketIntelTriggerResponse(
        status="running",
        message=f"Market intelligence started in {mode_label} mode.",
    )


@router.get("/{analysis_id}/market-intel/quota", response_model=MarketIntelQuotaResponse)
async def get_market_intel_quota(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Returns the user's market intelligence daily usage and remaining limit."""
    settings = get_settings()
    daily_count = await count_user_market_intel_today(user_id)
    limit = settings.MARKET_INTEL_DAILY_LIMIT
    return MarketIntelQuotaResponse(
        used=daily_count,
        limit=limit,
        remaining=max(0, limit - daily_count),
    )

