from fastapi import APIRouter, Depends, status
from app.utils.security import get_current_user
from app.services.analysis_service import (
    create_and_run_analysis,
    get_analysis_by_id,
    list_user_analyses,
    delete_user_analysis
)
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisResponse,
    AnalysisHistoryItem
)

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
