"""
Unit Tests for Market Intelligence Service & Routes
===================================================
Tests all 11 scenarios specified in the Master Implementation Plan:
1. Schema validation: MarketIntelligenceResult with missing/null fields
2. extract_grounding_sources() with None metadata, empty chunks, valid chunks
3. Dual client initialization: verify _get_deep_research_client() uses dedicated key
4. Dual client fallback: verify fallback to primary key when deep research key is empty
5. Rate limit enforcement: 4th request in a day returns 429
6. Demo mode guard: trigger returns 403
7. Missing company_name guard: trigger returns 400
8. Missing deep research key guard: deep mode returns 503
9. Already running guard: trigger returns { status: "running" }
10. Orchestrator happy path: mock Gemini calls, verify DB gets updated to "completed"
11. Orchestrator error path: mock Gemini failure, verify DB gets updated to "failed"
12. Quota endpoint: verify GET /analyses/{id}/market-intel/quota returns correct payload
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import ValidationError

from app.schemas.analysis import (
    CompanyIntelligence,
    MarketBenchmark,
    SkillFrequency,
    CompetitiveStrategy,
    StrategyPoint,
    ActionItem,
    MarketIntelligenceResult,
    WebSource,
    MarketIntelTriggerRequest,
    MarketIntelQuotaResponse,
    AnalysisResponse,
)
from app.services.market_intelligence_service import (
    extract_grounding_sources,
    _get_primary_client,
    _get_deep_research_client,
    _clean_json_text,
    run_full_market_intelligence,
)
from app.config import get_settings


# ==============================================================================
# 1. Schema Validation Tests
# ==============================================================================

def test_market_intelligence_result_schema_validation():
    """Verify MarketIntelligenceResult serializes and deserializes properly."""
    ci = CompanyIntelligence(
        company_name="Stripe",
        domain="fintech",
        peer_companies=["Adyen", "PayPal"],
        tech_stack=["Ruby", "Go"],
        engineering_culture=["High autonomy", "Documentation first"],
        hiring_bar_summary="High technical bar.",
        sources=[WebSource(title="Stripe Careers", uri="https://stripe.com/jobs")],
    )

    mb = MarketBenchmark(
        consensus_skills=["Python", "PostgreSQL"],
        edge_skills=["Distributed Systems"],
        skill_frequency_map=[
            SkillFrequency(skill="Python", frequency="10/12 JDs", present_in_resume=True),
            SkillFrequency(skill="Kubernetes", frequency="6/12 JDs", present_in_resume=False),
        ],
        common_experience_range="3-5 years",
        jds_analyzed_count=12,
        sources=[WebSource(title="JD Search", uri="https://example.com/jds")],
    )

    cs = CompetitiveStrategy(
        market_position="Top 25%",
        competitive_advantages=[StrategyPoint(title="FastAPI experience", detail="Strong alignment")],
        critical_gaps=[StrategyPoint(title="Kubernetes", detail="Expected at Stripe")],
        strategic_gaps=[],
        company_fit_score=82,
        company_fit_signals=["Strong Python background", "Matches culture"],
        pointwise_strategy=[
            ActionItem(
                action="Highlight distributed systems projects",
                why="Stripe processes billions in volume",
                impact="Increases interview shortlist probability",
                priority="HIGH",
                effort="QUICK_WIN",
            )
        ],
    )

    result = MarketIntelligenceResult(
        company_intelligence=ci,
        market_benchmark=mb,
        competitive_strategy=cs,
        mode="fast",
        deep_research_report=None,
    )

    data = result.model_dump()
    assert data["mode"] == "fast"
    assert data["company_intelligence"]["company_name"] == "Stripe"
    assert data["competitive_strategy"]["company_fit_score"] == 82
    assert len(data["market_benchmark"]["skill_frequency_map"]) == 2

    # Verify deserialization
    reconstructed = MarketIntelligenceResult(**data)
    assert reconstructed.company_intelligence.company_name == "Stripe"
    assert reconstructed.competitive_strategy.pointwise_strategy[0].effort == "QUICK_WIN"


def test_schema_validation_company_fit_score_range():
    """Verify company_fit_score must be between 0 and 100."""
    with pytest.raises(ValidationError):
        CompetitiveStrategy(company_fit_score=105)

    with pytest.raises(ValidationError):
        CompetitiveStrategy(company_fit_score=-1)


# ==============================================================================
# 2. extract_grounding_sources() Tests
# ==============================================================================

def test_extract_grounding_sources_none_metadata():
    """Returns empty list when response has no grounding_metadata."""
    mock_candidate = MagicMock()
    mock_candidate.grounding_metadata = None
    mock_response = MagicMock()
    mock_response.candidates = [mock_candidate]

    sources = extract_grounding_sources(mock_response)
    assert sources == []


def test_extract_grounding_sources_empty_chunks():
    """Returns empty list when grounding_chunks is empty."""
    mock_metadata = MagicMock()
    mock_metadata.grounding_chunks = []
    mock_candidate = MagicMock()
    mock_candidate.grounding_metadata = mock_metadata
    mock_response = MagicMock()
    mock_response.candidates = [mock_candidate]

    sources = extract_grounding_sources(mock_response)
    assert sources == []


def test_extract_grounding_sources_valid_chunks():
    """Extracts title and URI correctly from valid web chunks."""
    chunk1 = MagicMock()
    chunk1.web = MagicMock(title="Stripe Engineering", uri="https://stripe.com/blog")
    chunk2 = MagicMock()
    chunk2.web = MagicMock(title="Similar Jobs", uri="https://jobs.example.com")
    chunk_no_web = MagicMock()
    chunk_no_web.web = None

    mock_metadata = MagicMock()
    mock_metadata.grounding_chunks = [chunk1, chunk2, chunk_no_web]
    mock_candidate = MagicMock()
    mock_candidate.grounding_metadata = mock_metadata
    mock_response = MagicMock()
    mock_response.candidates = [mock_candidate]

    sources = extract_grounding_sources(mock_response)
    assert len(sources) == 2
    assert sources[0] == {"title": "Stripe Engineering", "uri": "https://stripe.com/blog"}
    assert sources[1] == {"title": "Similar Jobs", "uri": "https://jobs.example.com"}


def test_extract_grounding_sources_malformed_response():
    """Safely handles non-response objects or malformed candidates."""
    assert extract_grounding_sources(None) == []
    assert extract_grounding_sources("not a response") == []
    assert extract_grounding_sources(MagicMock(candidates=[])) == []


# ==============================================================================
# 3 & 4. Dual Client Initialization & Fallback Tests
# ==============================================================================

def test_dual_client_initialization_dedicated_key():
    """Verify _get_deep_research_client() uses GEMINI_DEEP_RESEARCH_API_KEY when set."""
    settings = get_settings()
    original_deep = settings.GEMINI_DEEP_RESEARCH_API_KEY
    original_primary = settings.GEMINI_API_KEY

    try:
        settings.GEMINI_DEEP_RESEARCH_API_KEY = "test-dedicated-deep-key"
        settings.GEMINI_API_KEY = "test-primary-key"

        with patch("app.services.market_intelligence_service.genai.Client") as mock_client:
            _get_deep_research_client()
            mock_client.assert_called_once_with(api_key="test-dedicated-deep-key")
    finally:
        settings.GEMINI_DEEP_RESEARCH_API_KEY = original_deep
        settings.GEMINI_API_KEY = original_primary


def test_dual_client_fallback_to_primary():
    """Verify _get_deep_research_client() falls back to primary key when dedicated is empty."""
    settings = get_settings()
    original_deep = settings.GEMINI_DEEP_RESEARCH_API_KEY
    original_primary = settings.GEMINI_API_KEY

    try:
        settings.GEMINI_DEEP_RESEARCH_API_KEY = ""
        settings.GEMINI_API_KEY = "test-primary-key-fallback"

        with patch("app.services.market_intelligence_service.genai.Client") as mock_client:
            _get_deep_research_client()
            mock_client.assert_called_once_with(api_key="test-primary-key-fallback")
    finally:
        settings.GEMINI_DEEP_RESEARCH_API_KEY = original_deep
        settings.GEMINI_API_KEY = original_primary


# ==============================================================================
# 5. Rate Limit Enforcement (429) Test
# ==============================================================================

def test_rate_limit_enforcement_429(client, auth_headers):
    """Verifies that exceeding daily market intelligence limit returns HTTP 429."""
    from app.main import app
    from app.utils.security import get_current_user

    settings = get_settings()
    original_demo = settings.DEMO_MODE
    settings.DEMO_MODE = False
    app.dependency_overrides[get_current_user] = lambda: "test-user-id"

    fake_analysis = AnalysisResponse(
        id="test-analysis-limit-id",
        resume_id="test-resume-id",
        job_title="Backend Developer",
        job_description="Python backend",
        company_name="Google",
    )

    try:
        with patch("app.api.analyses.get_analysis_by_id", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = fake_analysis
            with patch("app.api.analyses.count_user_market_intel_today", new_callable=AsyncMock) as mock_count:
                # User has already run 3 today (limit is 3)
                mock_count.return_value = 3

                response = client.post(
                    "/api/analyses/test-analysis-limit-id/market-intel/trigger",
                    json={"mode": "fast"},
                    headers=auth_headers,
                )

                assert response.status_code == 429
                data = response.json()
                assert data["code"] == "RATE_LIMIT"
                assert "Daily market intelligence limit reached" in data["message"]
    finally:
        settings.DEMO_MODE = original_demo
        app.dependency_overrides.clear()


# ==============================================================================
# 6. Demo Mode Guard (403) Test
# ==============================================================================

def test_demo_mode_guard_403(client, auth_headers):
    """Verifies trigger returns HTTP 403 when DEMO_MODE is True."""
    settings = get_settings()
    original_demo = settings.DEMO_MODE
    settings.DEMO_MODE = True

    try:
        response = client.post(
            "/api/analyses/22222222-2222-2222-2222-222222222221/market-intel/trigger",
            json={"mode": "fast"},
            headers=auth_headers,
        )
        assert response.status_code == 403
        data = response.json()
        assert data["code"] == "DEMO_MODE"
    finally:
        settings.DEMO_MODE = original_demo


# ==============================================================================
# 7. Missing company_name Guard (400) Test
# ==============================================================================

def test_missing_company_name_guard_400(client, auth_headers):
    """Verifies trigger returns HTTP 400 when analysis has no company_name."""
    from app.main import app
    from app.utils.security import get_current_user

    settings = get_settings()
    original_demo = settings.DEMO_MODE
    settings.DEMO_MODE = False
    app.dependency_overrides[get_current_user] = lambda: "test-user-id"

    fake_analysis_no_company = AnalysisResponse(
        id="test-analysis-no-company",
        resume_id="test-resume-id",
        job_title="Software Engineer",
        job_description="Python developer",
        company_name=None,  # No company name set
    )

    try:
        with patch("app.api.analyses.get_analysis_by_id", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = fake_analysis_no_company

            response = client.post(
                "/api/analyses/test-analysis-no-company/market-intel/trigger",
                json={"mode": "fast"},
                headers=auth_headers,
            )

            assert response.status_code == 400
            data = response.json()
            assert data["code"] == "NO_COMPANY_NAME"
    finally:
        settings.DEMO_MODE = original_demo
        app.dependency_overrides.clear()


# ==============================================================================
# 8. Missing Deep Research Key Guard (503) Test
# ==============================================================================

def test_missing_deep_research_key_guard_503(client, auth_headers):
    """Verifies trigger in deep mode returns HTTP 503 if dedicated key is not configured."""
    from app.main import app
    from app.utils.security import get_current_user

    settings = get_settings()
    original_demo = settings.DEMO_MODE
    original_deep_key = settings.GEMINI_DEEP_RESEARCH_API_KEY

    settings.DEMO_MODE = False
    settings.GEMINI_DEEP_RESEARCH_API_KEY = ""  # Not configured
    app.dependency_overrides[get_current_user] = lambda: "test-user-id"

    try:
        response = client.post(
            "/api/analyses/test-id/market-intel/trigger",
            json={"mode": "deep"},
            headers=auth_headers,
        )
        assert response.status_code == 503
        data = response.json()
        assert data["code"] == "DEEP_RESEARCH_NOT_CONFIGURED"
    finally:
        settings.DEMO_MODE = original_demo
        settings.GEMINI_DEEP_RESEARCH_API_KEY = original_deep_key
        app.dependency_overrides.clear()


# ==============================================================================
# 9. Already Running Guard Test
# ==============================================================================

def test_already_running_guard(client, auth_headers):
    """Verifies trigger returns status running without spawning another task if already running."""
    from app.main import app
    from app.utils.security import get_current_user

    settings = get_settings()
    original_demo = settings.DEMO_MODE
    settings.DEMO_MODE = False
    app.dependency_overrides[get_current_user] = lambda: "test-user-id"

    running_analysis = AnalysisResponse(
        id="test-analysis-running",
        resume_id="test-resume-id",
        job_title="Backend Developer",
        job_description="Python backend",
        company_name="Netflix",
        market_intel_status="running",
    )

    try:
        with patch("app.api.analyses.get_analysis_by_id", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = running_analysis

            response = client.post(
                "/api/analyses/test-analysis-running/market-intel/trigger",
                json={"mode": "fast"},
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "running"
            assert "already in progress" in data["message"]
    finally:
        settings.DEMO_MODE = original_demo
        app.dependency_overrides.clear()


# ==============================================================================
# 10. Orchestrator Happy Path Test
# ==============================================================================

@pytest.mark.asyncio
async def test_orchestrator_happy_path():
    """Verify run_full_market_intelligence coordinates stages and sets DB to completed."""
    fake_analysis = MagicMock()
    fake_analysis.company_name = "Stripe"
    fake_analysis.job_title = "Backend Engineer"
    fake_analysis.job_description = "Python and Go"
    fake_analysis.result_json = MagicMock()
    fake_analysis.result_json.matching_skills = [MagicMock(skill="Python")]
    fake_analysis.result_json.missing_skills = ["Ruby"]

    mock_ci = CompanyIntelligence(company_name="Stripe", domain="fintech")
    mock_mb = MarketBenchmark(consensus_skills=["Python"], jds_analyzed_count=10)
    mock_cs = CompetitiveStrategy(market_position="top 20%", company_fit_score=80)

    with patch("app.services.analysis_service.get_analysis_by_id", new_callable=AsyncMock) as mock_get_analysis:
        mock_get_analysis.return_value = fake_analysis
        with patch("app.services.market_intelligence_service.run_company_intelligence", new_callable=AsyncMock) as mock_stage_a:
            mock_stage_a.return_value = mock_ci
            with patch("app.services.market_intelligence_service.run_market_jd_analysis", new_callable=AsyncMock) as mock_stage_b:
                mock_stage_b.return_value = mock_mb
                with patch("app.services.market_intelligence_service.generate_competitive_strategy", new_callable=AsyncMock) as mock_stage_c:
                    mock_stage_c.return_value = mock_cs
                    with patch("app.services.market_intelligence_service._update_market_intel_in_db", new_callable=AsyncMock) as mock_db_update:
                        await run_full_market_intelligence("analysis-123", "user-456", mode="fast")

                        mock_db_update.assert_called_once()
                        args = mock_db_update.call_args[0]
                        assert args[0] == "analysis-123"
                        assert args[1] == "user-456"
                        assert args[2] == "completed"
                        assert isinstance(args[3], MarketIntelligenceResult)
                        assert args[3].company_intelligence.company_name == "Stripe"


# ==============================================================================
# 11. Orchestrator Error Path Test
# ==============================================================================

@pytest.mark.asyncio
async def test_orchestrator_error_path():
    """Verify run_full_market_intelligence catches failures and sets DB to failed."""
    fake_analysis = MagicMock()
    fake_analysis.company_name = "Stripe"
    fake_analysis.job_title = "Backend Engineer"
    fake_analysis.job_description = "Python and Go"
    fake_analysis.result_json = MagicMock()

    with patch("app.services.analysis_service.get_analysis_by_id", new_callable=AsyncMock) as mock_get_analysis:
        mock_get_analysis.return_value = fake_analysis
        with patch("app.services.market_intelligence_service.run_company_intelligence", side_effect=RuntimeError("AI search timeout")):
            with patch("app.services.market_intelligence_service._update_market_intel_in_db", new_callable=AsyncMock) as mock_db_update:
                await run_full_market_intelligence("analysis-123", "user-456", mode="fast")

                mock_db_update.assert_called_once()
                args, kwargs = mock_db_update.call_args
                assert args[0] == "analysis-123"
                assert args[1] == "user-456"
                assert args[2] == "failed"
                assert "AI search timeout" in kwargs.get("error_msg", "")


# ==============================================================================
# 12. Quota Endpoint Test
# ==============================================================================

def test_get_market_intel_quota_endpoint(client, auth_headers):
    """Verifies GET /analyses/{id}/market-intel/quota returns correct usage and limit."""
    with patch("app.api.analyses.count_user_market_intel_today", new_callable=AsyncMock) as mock_count:
        mock_count.return_value = 1

        response = client.get(
            "/api/analyses/test-id/market-intel/quota",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["used"] == 1
        assert data["limit"] == 3
        assert data["remaining"] == 2
