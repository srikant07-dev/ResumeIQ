"""
Tests for the resume re-evaluation endpoint and score delta computation.
Uses Demo Mode for zero-dependency testing.
"""
import pytest
from unittest.mock import patch, AsyncMock
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisResultData,
    ScoreBreakdown,
    ScoreEvidence,
    SkillMatch,
    CategorizedKeywords,
    EvidencePoint,
    Recommendation,
    ScoreDelta,
    ReEvaluationResponse
)
from app.services.analysis_service import re_evaluate_analysis
from datetime import datetime, timezone


def _make_mock_analysis(
    analysis_id: str,
    overall: int,
    skills: int,
    keywords: int,
    experience: int,
    education: int,
    quality: int,
    matching_skills: list[str],
    missing_skills: list[str],
    partial_skills: list[str] = None,
) -> AnalysisResponse:
    """Helper to build a fully populated AnalysisResponse for testing."""
    result_data = AnalysisResultData(
        score_breakdown=ScoreBreakdown(
            skills=ScoreEvidence(score=skills, source="deterministic", evidence="test"),
            experience=ScoreEvidence(score=experience, source="ai", evidence="test"),
            keywords=ScoreEvidence(score=keywords, source="deterministic", evidence="test"),
            education=ScoreEvidence(score=education, source="ai", evidence="test"),
            quality=ScoreEvidence(score=quality, source="ai", evidence="test"),
        ),
        matching_skills=[SkillMatch(skill=s, context="matched") for s in matching_skills],
        partial_skills=[SkillMatch(skill=s, context="partial") for s in (partial_skills or [])],
        missing_skills=missing_skills,
        keywords_present=["Python", "React"],
        keywords_missing=["Docker"],
        keyword_categories=CategorizedKeywords(technical=["Python"], soft=["Communication"], domain=[]),
        strengths=[EvidencePoint(point="Strong backend", evidence="FastAPI experience")],
        weaknesses=[EvidencePoint(point="Missing Docker", evidence="Not mentioned")],
        recommendations=[Recommendation(
            priority="HIGH", title="Add Docker", description="Learn Docker",
            evidence="Required", suggested_action="Take course"
        )],
        summary="Test summary"
    )
    return AnalysisResponse(
        id=analysis_id,
        resume_id="11111111-1111-1111-1111-111111111111",
        job_title="Test Engineer",
        job_description="We need a test engineer with Python, React, Docker, and FastAPI.",
        overall_score=overall,
        skills_score=skills,
        experience_score=experience,
        keyword_score=keywords,
        education_score=education,
        quality_score=quality,
        status="completed",
        result_json=result_data,
        created_at=datetime.now(timezone.utc)
    )


@pytest.mark.asyncio
async def test_score_delta_calculation():
    """Verify that score deltas are correctly computed between parent and new analysis."""
    parent = _make_mock_analysis(
        "parent-001", overall=68, skills=60, keywords=70,
        experience=75, education=85, quality=70,
        matching_skills=["Python", "React"],
        missing_skills=["Docker", "FastAPI"]
    )
    new = _make_mock_analysis(
        "new-001", overall=82, skills=80, keywords=75,
        experience=80, education=85, quality=75,
        matching_skills=["Python", "React", "Docker", "FastAPI"],
        missing_skills=[]
    )

    with patch("app.services.analysis_service.get_analysis_by_id",
               new_callable=AsyncMock, return_value=parent), \
         patch("app.services.analysis_service.create_and_run_analysis",
               new_callable=AsyncMock, return_value=new):
        result = await re_evaluate_analysis("parent-001", "new-resume-id", "test-user")

    assert isinstance(result, ReEvaluationResponse)
    assert result.parent_analysis_id == "parent-001"
    assert result.score_delta.overall_delta == 14  # 82 - 68
    assert result.score_delta.skills_delta == 20   # 80 - 60
    assert result.score_delta.keywords_delta == 5  # 75 - 70


@pytest.mark.asyncio
async def test_skill_migration_tracking():
    """Verify that resolved missing skills and newly matched skills are tracked."""
    parent = _make_mock_analysis(
        "parent-002", overall=65, skills=55, keywords=65,
        experience=70, education=80, quality=70,
        matching_skills=["Python"],
        missing_skills=["Docker", "FastAPI", "Kubernetes"]
    )
    new = _make_mock_analysis(
        "new-002", overall=78, skills=75, keywords=70,
        experience=72, education=80, quality=72,
        matching_skills=["Python", "Docker", "FastAPI"],
        missing_skills=["Kubernetes"]
    )

    with patch("app.services.analysis_service.get_analysis_by_id",
               new_callable=AsyncMock, return_value=parent), \
         patch("app.services.analysis_service.create_and_run_analysis",
               new_callable=AsyncMock, return_value=new):
        result = await re_evaluate_analysis("parent-002", "new-resume-id", "test-user")

    delta = result.score_delta
    # Docker and FastAPI were missing before but now matched
    assert "Docker" in delta.resolved_missing_skills
    assert "FastAPI" in delta.resolved_missing_skills
    # Kubernetes should still be missing
    assert "Kubernetes" not in delta.resolved_missing_skills
    # Docker and FastAPI are newly matched
    assert "Docker" in delta.newly_matched_skills
    assert "FastAPI" in delta.newly_matched_skills


@pytest.mark.asyncio
async def test_zero_delta_when_unchanged():
    """When the new analysis produces the same scores, deltas should all be 0."""
    analysis = _make_mock_analysis(
        "same-001", overall=75, skills=70, keywords=72,
        experience=78, education=85, quality=72,
        matching_skills=["Python", "React"],
        missing_skills=["Docker"]
    )

    with patch("app.services.analysis_service.get_analysis_by_id",
               new_callable=AsyncMock, return_value=analysis), \
         patch("app.services.analysis_service.create_and_run_analysis",
               new_callable=AsyncMock, return_value=analysis):
        result = await re_evaluate_analysis("same-001", "same-resume-id", "test-user")

    assert result.score_delta.overall_delta == 0
    assert result.score_delta.skills_delta == 0
    assert result.score_delta.keywords_delta == 0
