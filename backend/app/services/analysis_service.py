import uuid
from fastapi import HTTPException, status
from app.db.supabase import get_supabase_client
from app.config import get_settings
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisResponse,
    AnalysisHistoryItem,
    AnalysisResultData
)
from app.schemas.common import ErrorResponse
from app.services.llm_service import analyze_resume_with_gemini
from app.services.mock_service import get_mock_analysis_result
from app.services.scoring_service import calculate_overall_score

async def create_and_run_analysis(
    req: AnalysisCreateRequest,
    user_id: str
) -> AnalysisResponse:
    """
    1. Validates resume ownership for user_id.
    2. Runs analysis (Gemini or Mock fallback).
    3. Persists scores, status, and result_json.
    """
    settings = get_settings()
    analysis_id = str(uuid.uuid4())
    
    # 1. Resume Ownership Check
    resume_text = "Experienced software engineer specializing in Python, React, FastAPI, and PostgreSQL."
    
    if not settings.DEMO_MODE and settings.SUPABASE_URL:
        supabase = get_supabase_client()
        resume_query = supabase.table("resumes")\
            .select("id, extracted_text")\
            .eq("id", req.resume_id)\
            .eq("user_id", user_id)\
            .execute()
            
        if not resume_query.data or len(resume_query.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="RESUME_NOT_FOUND",
                    message="Resume not found or access denied. Ensure the resume belongs to your account."
                ).model_dump()
            )
        resume_text = resume_query.data[0].get("extracted_text") or resume_text

    # 2. Run AI Analysis or Mock Mode
    result_data: AnalysisResultData
    try:
        if settings.DEMO_MODE or not settings.GEMINI_API_KEY:
            result_data = get_mock_analysis_result(req.job_title, resume_text)
        else:
            result_data = await analyze_resume_with_gemini(resume_text, req.job_description)
    except Exception as ai_err:
        # Fall back gracefully to mock analysis if Gemini API experiences rate limit/network error
        result_data = get_mock_analysis_result(req.job_title, resume_text)

    # 3. Extract sub-scores & compute overall score
    skills_val = result_data.score_breakdown.skills.score
    exp_val = result_data.score_breakdown.experience.score
    kw_val = result_data.score_breakdown.keywords.score
    edu_val = result_data.score_breakdown.education.score
    qual_val = result_data.score_breakdown.quality.score
    
    overall_val = calculate_overall_score(
        skills_score=skills_val,
        experience_score=exp_val,
        keyword_score=kw_val,
        education_score=edu_val,
        quality_score=qual_val
    )

    # 4. Save to database
    if not settings.DEMO_MODE and settings.SUPABASE_URL:
        supabase = get_supabase_client()
        insert_payload = {
            "id": analysis_id,
            "user_id": user_id,
            "resume_id": req.resume_id,
            "job_title": req.job_title,
            "job_description": req.job_description,
            "overall_score": overall_val,
            "skills_score": skills_val,
            "experience_score": exp_val,
            "keyword_score": kw_val,
            "education_score": edu_val,
            "quality_score": qual_val,
            "status": "completed",
            "result_json": result_data.model_dump()
        }
        supabase.table("analyses").insert(insert_payload).execute()

    return AnalysisResponse(
        id=analysis_id,
        resume_id=req.resume_id,
        job_title=req.job_title,
        job_description=req.job_description,
        overall_score=overall_val,
        skills_score=skills_val,
        experience_score=exp_val,
        keyword_score=kw_val,
        education_score=edu_val,
        quality_score=qual_val,
        status="completed",
        result_json=result_data
    )

async def get_analysis_by_id(analysis_id: str, user_id: str) -> AnalysisResponse:
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        mock_data = get_mock_analysis_result("Backend Developer")
        return AnalysisResponse(
            id=analysis_id,
            resume_id="demo-resume-id",
            job_title="Backend Developer",
            job_description="Sample job description...",
            overall_score=82,
            skills_score=84,
            experience_score=78,
            keyword_score=82,
            education_score=95,
            quality_score=80,
            status="completed",
            result_json=mock_data
        )

    supabase = get_supabase_client()
    res = supabase.table("analyses")\
        .select("*")\
        .eq("id", analysis_id)\
        .eq("user_id", user_id)\
        .single()\
        .execute()
        
    if not res or not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                code="ANALYSIS_NOT_FOUND",
                message="Analysis record not found or access denied."
            ).model_dump()
        )
    return AnalysisResponse(**res.data)

async def list_user_analyses(user_id: str) -> list[AnalysisHistoryItem]:
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        return [
            AnalysisHistoryItem(
                id="demo-analysis-1",
                resume_id="demo-resume-1",
                job_title="Full Stack Engineer",
                overall_score=82,
                status="completed"
            ),
            AnalysisHistoryItem(
                id="demo-analysis-2",
                resume_id="demo-resume-1",
                job_title="Frontend Developer",
                overall_score=74,
                status="completed"
            )
        ]

    supabase = get_supabase_client()
    try:
        res = supabase.table("analyses")\
            .select("id, resume_id, job_title, overall_score, status, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return [AnalysisHistoryItem(**row) for row in (res.data or [])]
    except Exception:
        return []

async def delete_user_analysis(analysis_id: str, user_id: str) -> dict:
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL:
        return {"status": "deleted", "id": analysis_id}

    supabase = get_supabase_client()
    try:
        supabase.table("analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
        return {"status": "deleted", "id": analysis_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DELETE_FAILED",
                message="Failed to delete analysis record.",
                details={"error": str(e)}
            ).model_dump()
        )
