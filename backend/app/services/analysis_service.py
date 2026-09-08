from datetime import datetime, timezone
import logging
import uuid
from fastapi import HTTPException, status
from app.db.supabase import get_supabase_client
from app.config import get_settings
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisResponse,
    AnalysisHistoryItem,
    AnalysisResultData,
    ReEvaluationResponse,
    ScoreDelta
)
from app.schemas.common import ErrorResponse
from app.services.llm_service import analyze_resume_with_gemini
from app.services.mock_service import get_mock_analysis_result
from app.services.scoring_service import calculate_overall_score

logger = logging.getLogger(__name__)

MOCK_RESUME_ID = "11111111-1111-1111-1111-111111111111"
MOCK_ANALYSIS_ID_1 = "22222222-2222-2222-2222-222222222221"
MOCK_ANALYSIS_ID_2 = "22222222-2222-2222-2222-222222222222"

SAMPLE_CANDIDATE_RESUME_TEXT = """
SRIKANT SRINIWASAN
Full Stack Software Engineer | Bangalore, India | srikant.dev@example.com | github.com/srikant-dev

PROFESSIONAL SUMMARY
Results-driven Full Stack Software Engineer with 3+ years of experience designing, developing, and deploying scalable web applications and distributed backend services. Proficient in Python, FastAPI, React, PostgreSQL, RESTful API architecture, and cloud infrastructure. Passionate about engineering clean code, optimizing database performance, and building responsive user interfaces.

TECHNICAL SKILLS
- Languages & Frameworks: Python, JavaScript, TypeScript, FastAPI, React, Next.js, Node.js, HTML5, CSS3, Tailwind CSS
- Databases & Caching: PostgreSQL, Redis, SQLAlchemy, Database Indexing, Query Optimization, Schema Migrations
- Cloud & DevOps: Docker, Containerization, Git, GitHub Actions, CI/CD pipelines, AWS (S3, EC2 basics), Linux/Unix
- Core Concepts: REST APIs, JWT Authentication, Microservices Architecture, Agile/Scrum, Unit Testing (Pytest, Vitest)

WORK EXPERIENCE
Software Engineer | NexaTech Solutions | 2023 - Present
- Architected and deployed 15+ high-performance RESTful API endpoints using FastAPI and Pydantic, handling 40,000+ daily requests with sub-100ms p95 latency.
- Built interactive analytics dashboards with React and Tailwind CSS, improving user onboarding workflow efficiency by 28%.
- Optimized complex PostgreSQL join queries and introduced indexed lookup tables, cutting query response times by 42%.
- Integrated Supabase Row-Level Security (RLS) and JWT authentication to protect candidate data across multi-tenant environments.
- Implemented automated CI/CD workflows using GitHub Actions and containerized microservices using Docker.

Associate Developer | CloudMatrix Labs | 2021 - 2023
- Developed modular React UI components using modern hooks and context state management for client portals.
- Maintained backend Python services, writing robust Pytest test suites achieving 90%+ code coverage.
- Configured Redis caching layers for high-traffic session verification, reducing database read pressure.
- Collaborated across cross-functional engineering teams in agile sprints to deliver client features on time.

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science & Engineering
National Institute of Technology | 2017 - 2021 | CGPA: 8.6/10
""".strip()

MAX_DEMO_STORE_SIZE = 100

# In-memory store for Demo Mode session analyses
DEMO_ANALYSES_STORE: dict[str, AnalysisResponse] = {}

async def create_and_run_analysis(
    req: AnalysisCreateRequest,
    user_id: str
) -> AnalysisResponse:
    """
    1. Validates resume ownership for user_id (with sample resume fallback).
    2. Runs analysis (Gemini or Mock fallback).
    3. Persists scores, status, and result_json (PostgreSQL or Demo Store).
    """
    settings = get_settings()
    analysis_id = str(uuid.uuid4())
    now_utc = datetime.now(timezone.utc)
    
    # 1. Resume Ownership & Text Retrieval
    resume_text = SAMPLE_CANDIDATE_RESUME_TEXT
    
    # Allow pre-seeded sample resume ID in both demo and live modes
    if req.resume_id == MOCK_RESUME_ID:
        pass  # Uses verified sample candidate text
    elif (
        not settings.DEMO_MODE
        and settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_ROLE_KEY
        and user_id != "00000000-0000-0000-0000-000000000000"
    ):
        supabase = get_supabase_client()
        try:
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
            db_text = resume_query.data[0].get("extracted_text")
            if not db_text or not db_text.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=ErrorResponse(
                        code="RESUME_EMPTY_TEXT",
                        message="The selected resume contains no readable text. Please upload a PDF with extractable text or use OCR."
                    ).model_dump()
                )
            resume_text = db_text
        except HTTPException:
            raise
        except Exception as query_err:
            if "PGRST116" in str(query_err) or "0 rows" in str(query_err):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=ErrorResponse(
                        code="RESUME_NOT_FOUND",
                        message="Resume not found or access denied."
                    ).model_dump()
                )
            logger.error("Failed to query resume for analysis: %s", query_err, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ErrorResponse(
                    code="DATABASE_ERROR",
                    message="Database error while validating resume ownership.",
                    details={"error": str(query_err)}
                ).model_dump()
            )

    # 2. Run AI Analysis or Mock Mode
    result_data: AnalysisResultData
    try:
        if settings.DEMO_MODE or not settings.GEMINI_API_KEY:
            result_data = get_mock_analysis_result(req.job_title, resume_text)
        else:
            result_data = await analyze_resume_with_gemini(resume_text, req.job_description)
    except Exception as ai_err:
        logger.error("Gemini AI analysis failed for resume_id=%s: %s", req.resume_id, ai_err, exc_info=True)
        if settings.DEMO_MODE:
            result_data = get_mock_analysis_result(req.job_title, resume_text)
        else:
            # Explicit failure status recorded to database
            if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY and user_id != "00000000-0000-0000-0000-000000000000":
                try:
                    supabase = get_supabase_client()
                    fail_payload = {
                        "id": analysis_id,
                        "user_id": user_id,
                        "resume_id": req.resume_id,
                        "job_title": req.job_title,
                        "job_description": req.job_description,
                        "status": "failed",
                        "error_message": str(ai_err)
                    }
                    if req.company_name:
                        fail_payload["company_name"] = req.company_name
                    supabase.table("analyses").insert(fail_payload).execute()
                except Exception as db_err:
                    logger.error("Failed to record failed analysis status to DB: %s", db_err)

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=ErrorResponse(
                    code="AI_SERVICE_ERROR",
                    message="AI analysis engine encountered an error while processing the resume.",
                    details={"error": str(ai_err)}
                ).model_dump()
            )

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

    response_obj = AnalysisResponse(
        id=analysis_id,
        resume_id=req.resume_id,
        job_title=req.job_title or "Untitled Position",
        job_description=req.job_description,
        overall_score=overall_val,
        skills_score=skills_val,
        experience_score=exp_val,
        keyword_score=kw_val,
        education_score=edu_val,
        quality_score=qual_val,
        status="completed",
        result_json=result_data,
        created_at=now_utc,
        company_name=req.company_name,
        parent_analysis_id=req.parent_analysis_id,
    )

    # 4. Save to database or Demo Store
    if (
        settings.DEMO_MODE
        or not settings.SUPABASE_URL
        or not settings.SUPABASE_SERVICE_ROLE_KEY
        or user_id == "00000000-0000-0000-0000-000000000000"
    ):
        DEMO_ANALYSES_STORE[analysis_id] = response_obj
        if len(DEMO_ANALYSES_STORE) > MAX_DEMO_STORE_SIZE:
            oldest_key = next(iter(DEMO_ANALYSES_STORE))
            DEMO_ANALYSES_STORE.pop(oldest_key, None)
        return response_obj

    supabase = get_supabase_client()
    try:
        insert_payload = {
            "id": analysis_id,
            "user_id": user_id,
            "resume_id": req.resume_id,
            "job_title": req.job_title or "Untitled Position",
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
        if req.company_name:
            insert_payload["company_name"] = req.company_name
        if req.parent_analysis_id:
            insert_payload["parent_analysis_id"] = req.parent_analysis_id
        supabase.table("analyses").insert(insert_payload).execute()
    except Exception as insert_err:
        logger.error("Failed to persist completed analysis to database: %s", insert_err, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DATABASE_ERROR",
                message="Failed to save completed analysis record."
            ).model_dump()
        )

    return response_obj

async def get_analysis_by_id(analysis_id: str, user_id: str) -> AnalysisResponse:
    settings = get_settings()
    if settings.DEMO_MODE or not settings.SUPABASE_URL or user_id == "00000000-0000-0000-0000-000000000000":
        if analysis_id in DEMO_ANALYSES_STORE:
            return DEMO_ANALYSES_STORE[analysis_id]
        if analysis_id in (MOCK_ANALYSIS_ID_1, MOCK_ANALYSIS_ID_2):
            mock_data = get_mock_analysis_result("Backend Developer")
            return AnalysisResponse(
                id=analysis_id,
                resume_id=MOCK_RESUME_ID,
                job_title="Backend Developer",
                job_description="Sample job description...",
                overall_score=82,
                skills_score=84,
                experience_score=78,
                keyword_score=82,
                education_score=95,
                quality_score=80,
                status="completed",
                result_json=mock_data,
                created_at=datetime.now(timezone.utc)
            )
        # Any other unknown ID in demo mode
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                code="ANALYSIS_NOT_FOUND",
                message="Analysis record not found or access denied."
            ).model_dump()
        )

    supabase = get_supabase_client()
    try:
        res = supabase.table("analyses")\
            .select("*")\
            .eq("id", analysis_id)\
            .eq("user_id", user_id)\
            .single()\
            .execute()
            
        if not res or not res.data or not isinstance(res.data, dict):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="ANALYSIS_NOT_FOUND",
                    message="Analysis record not found or access denied."
                ).model_dump()
            )
        data: dict = dict(res.data)
        if not data.get("job_title"):
            data["job_title"] = "Untitled Position"
        return AnalysisResponse(**data)
    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e) or "0 rows" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="ANALYSIS_NOT_FOUND",
                    message="Analysis record not found or access denied."
                ).model_dump()
            )
        logger.error("Analysis lookup failed for id=%s, user=%s: %s", analysis_id, user_id, e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DATABASE_ERROR",
                message="Database error while querying analysis record."
            ).model_dump()
        )

async def list_user_analyses(user_id: str) -> list[AnalysisHistoryItem]:
    settings = get_settings()
    if (
        settings.DEMO_MODE
        or not settings.SUPABASE_URL
        or not settings.SUPABASE_SERVICE_ROLE_KEY
        or user_id == "00000000-0000-0000-0000-000000000000"
    ):
        items = []
        for a in reversed(list(DEMO_ANALYSES_STORE.values())):
            items.append(AnalysisHistoryItem(
                id=a.id,
                resume_id=a.resume_id,
                job_title=a.job_title,
                overall_score=a.overall_score,
                status=a.status,
                created_at=a.created_at
            ))
        if not items:
            items = [
                AnalysisHistoryItem(
                    id=MOCK_ANALYSIS_ID_1,
                    resume_id=MOCK_RESUME_ID,
                    job_title="Full Stack Engineer",
                    overall_score=82,
                    status="completed",
                    created_at=datetime.now(timezone.utc)
                ),
                AnalysisHistoryItem(
                    id=MOCK_ANALYSIS_ID_2,
                    resume_id=MOCK_RESUME_ID,
                    job_title="Frontend Developer",
                    overall_score=74,
                    status="completed",
                    created_at=datetime.now(timezone.utc)
                )
            ]
        return items

    supabase = get_supabase_client()
    try:
        res = supabase.table("analyses")\
            .select("id, resume_id, job_title, overall_score, status, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        items = []
        rows = res.data if isinstance(res.data, list) else []
        for row in rows:
            if isinstance(row, dict):
                row_dict: dict = dict(row)
                if not row_dict.get("job_title"):
                    row_dict["job_title"] = "Untitled Position"
                items.append(AnalysisHistoryItem(**row_dict))
        return items
    except Exception as e:
        logger.error("Failed to list analyses for user %s: %s", user_id, e)
        return []

async def delete_user_analysis(analysis_id: str, user_id: str) -> dict:
    settings = get_settings()
    if (
        settings.DEMO_MODE
        or not settings.SUPABASE_URL
        or not settings.SUPABASE_SERVICE_ROLE_KEY
        or user_id == "00000000-0000-0000-0000-000000000000"
    ):
        DEMO_ANALYSES_STORE.pop(analysis_id, None)
        return {"status": "deleted", "id": analysis_id}

    supabase = get_supabase_client()
    try:
        check = supabase.table("analyses").select("id").eq("id", analysis_id).eq("user_id", user_id).single().execute()
        if not check or not check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="ANALYSIS_NOT_FOUND",
                    message="Analysis record not found or access denied."
                ).model_dump()
            )
    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e) or "0 rows" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="ANALYSIS_NOT_FOUND",
                    message="Analysis record not found or access denied."
                ).model_dump()
            )
        logger.error("Database query failed while verifying analysis %s: %s", analysis_id, e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DATABASE_ERROR",
                message="Database error while verifying analysis record."
            ).model_dump()
        )

    try:
        supabase.table("analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
        return {"status": "deleted", "id": analysis_id}
    except Exception as e:
        logger.error("Failed to delete analysis %s: %s", analysis_id, e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="DELETE_FAILED",
                message="Failed to delete analysis record."
            ).model_dump()
        )

async def re_evaluate_analysis(
    parent_analysis_id: str,
    new_resume_id: str,
    user_id: str
) -> ReEvaluationResponse:
    """
    Re-evaluates an updated resume against the same job description from a prior analysis.
    Computes score deltas and tracks skill migration (newly matched, resolved gaps).
    """
    # 1. Retrieve the original (parent) analysis
    parent = await get_analysis_by_id(parent_analysis_id, user_id)
    if not parent or not parent.result_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                code="PARENT_ANALYSIS_NOT_FOUND",
                message="Original analysis record not found or has no result data."
            ).model_dump()
        )

    # 2. Run a fresh analysis using the new resume against the same job description
    new_analysis_req = AnalysisCreateRequest(
        resume_id=new_resume_id,
        job_title=parent.job_title,
        job_description=parent.job_description,
        company_name=parent.company_name,
        parent_analysis_id=parent_analysis_id,
    )
    new_analysis = await create_and_run_analysis(new_analysis_req, user_id)

    # 3. Compute score deltas
    overall_delta = (new_analysis.overall_score or 0) - (parent.overall_score or 0)
    skills_delta = (new_analysis.skills_score or 0) - (parent.skills_score or 0)
    keywords_delta = (new_analysis.keyword_score or 0) - (parent.keyword_score or 0)
    experience_delta = (new_analysis.experience_score or 0) - (parent.experience_score or 0)
    education_delta = (new_analysis.education_score or 0) - (parent.education_score or 0)
    quality_delta = (new_analysis.quality_score or 0) - (parent.quality_score or 0)

    # 4. Track skill migrations
    old_missing = set(parent.result_json.missing_skills or [])
    new_missing = set(new_analysis.result_json.missing_skills or []) if new_analysis.result_json else set()
    new_matched_names = set(
        s.skill for s in (new_analysis.result_json.matching_skills or [])
    ) if new_analysis.result_json else set()
    old_matched_names = set(
        s.skill for s in (parent.result_json.matching_skills or [])
    )

    # Skills that were missing before but are now matched
    resolved_missing = list(old_missing & new_matched_names)
    # Skills that are now matched but weren't before
    newly_matched = list(new_matched_names - old_matched_names)

    delta = ScoreDelta(
        overall_delta=overall_delta,
        skills_delta=skills_delta,
        keywords_delta=keywords_delta,
        experience_delta=experience_delta,
        education_delta=education_delta,
        quality_delta=quality_delta,
        newly_matched_skills=newly_matched,
        resolved_missing_skills=resolved_missing
    )

    return ReEvaluationResponse(
        new_analysis=new_analysis,
        parent_analysis_id=parent_analysis_id,
        score_delta=delta
    )
