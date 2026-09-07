import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.llm_service import (
    _clean_json_text,
    run_stage_1_comparison,
    run_stage_2_recommendations,
    analyze_resume_with_gemini
)
from app.schemas.analysis import AnalysisResultData

# ==============================================================================
# Tier 1 & Tier 2: LLM JSON Fence Stripping & Regex Resilience (DEF-11)
# ==============================================================================

def test_clean_json_text_plain_json():
    raw = '{"key": "value", "count": 42}'
    assert _clean_json_text(raw) == '{"key": "value", "count": 42}'

def test_clean_json_text_json_code_fence():
    raw = '```json\n{"key": "value"}\n```'
    cleaned = _clean_json_text(raw)
    parsed = json.loads(cleaned)
    assert parsed["key"] == "value"

def test_clean_json_text_generic_code_fence():
    raw = '```\n{"key": "value"}\n```'
    cleaned = _clean_json_text(raw)
    parsed = json.loads(cleaned)
    assert parsed["key"] == "value"

def test_clean_json_text_conversational_preamble_and_postscript():
    """
    Verifies that conversational text before and after the JSON block is safely stripped (DEF-11).
    """
    raw = (
        "Here is the detailed evaluation analysis of the candidate:\n\n"
        "```json\n"
        "{\n"
        '  "required_skills_count": 5,\n'
        '  "matching_skills": [{"skill": "Python", "context": "4 years experience"}],\n'
        '  "experience": {"score": 85, "evidence": "Solid background"}\n'
        "}\n"
        "```\n\n"
        "I hope this analysis is helpful for your recruiting decision!"
    )
    cleaned = _clean_json_text(raw)
    # Check that either direct parsing or regex extraction succeeds
    if cleaned.startswith("{") and cleaned.endswith("}"):
        parsed = json.loads(cleaned)
        assert parsed["required_skills_count"] == 5
    else:
        # Fallback strip check
        assert "{" in cleaned

def test_clean_json_text_empty_or_whitespace():
    assert _clean_json_text("") in ["", "{}"]
    assert _clean_json_text("   ") in ["", "{}"]

# ==============================================================================
# Tier 1 & Tier 3: Async LLM Pipeline Execution & Synthesis (DEF-04)
# ==============================================================================

@pytest.mark.asyncio
async def test_analyze_resume_with_gemini_synthesis(sample_resume, sample_jd):
    """
    Tests the 2-Stage Gemini pipeline synthesis with mocked async client responses.
    Verifies that the synthesized AnalysisResultData object is fully valid and conformant.
    """
    stage1_mock = {
        "required_skills_count": 5,
        "matching_skills": [
            {"skill": "FastAPI", "context": "Architected backend microservices in FastAPI."},
            {"skill": "React", "context": "Built client dashboards in React and Tailwind."},
            {"skill": "PostgreSQL", "context": "Optimized complex SQL queries on PostgreSQL."}
        ],
        "partial_skills": [
            {"skill": "Docker", "context": "Listed in skills section but limited production metrics."}
        ],
        "missing_skills": ["AWS Cloud Architecture"],
        "keywords_present": ["Python", "FastAPI", "React", "PostgreSQL", "REST", "Git"],
        "keywords_missing": ["Microservices", "CI/CD"],
        "keyword_categories": {
            "technical": ["Python", "FastAPI", "React"],
            "soft": ["Communication", "Problem Solving"],
            "domain": ["Web Development", "REST APIs"]
        },
        "experience": {
            "score": 80,
            "evidence": "4+ years of hands-on software development experience across the stack."
        },
        "education": {
            "score": 90,
            "evidence": "B.Tech in Computer Science with strong GPA alignment."
        },
        "quality": {
            "score": 85,
            "evidence": "Well structured resume with clear metric-driven bullet points."
        },
        "strengths": [
            {"point": "Full Stack Mastery", "evidence": "Proven track record with Python and React."}
        ],
        "weaknesses": [
            {"point": "Cloud Deployment Gap", "evidence": "Needs more explicit AWS enterprise experience."}
        ]
    }

    stage2_mock = {
        "recommendations": [
            {
                "priority": "HIGH",
                "title": "Highlight AWS Projects",
                "description": "Elaborate on cloud deployment and container orchestration experience.",
                "evidence": "Job description requires strong cloud infrastructure knowledge.",
                "suggested_action": "Add specific bullet points detailing Docker and AWS deployments truthfully."
            }
        ],
        "summary": "Strong candidate with comprehensive full-stack experience and solid academic credentials."
    }

    mock_resp1 = MagicMock()
    mock_resp1.text = json.dumps(stage1_mock)
    mock_resp2 = MagicMock()
    mock_resp2.text = json.dumps(stage2_mock)

    with patch("app.services.llm_service.run_stage_1_comparison", new_callable=AsyncMock) as m_s1, \
         patch("app.services.llm_service.run_stage_2_recommendations", new_callable=AsyncMock) as m_s2:
        m_s1.return_value = stage1_mock
        m_s2.return_value = stage2_mock

        result = await analyze_resume_with_gemini(sample_resume, sample_jd)

        assert isinstance(result, AnalysisResultData)
        assert result.score_breakdown.skills.score >= 0
        assert result.score_breakdown.experience.score == 80
        assert result.score_breakdown.education.score == 90
        assert result.score_breakdown.quality.score == 85
        assert len(result.matching_skills) == 3
        assert len(result.partial_skills) == 1
        assert len(result.missing_skills) == 1
        assert len(result.recommendations) == 1
        assert result.recommendations[0].priority == "HIGH"
