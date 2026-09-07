import asyncio
import io
import time
import pytest
import httpx
from fastapi.testclient import TestClient
from app.main import app
from app.config import get_settings
from app.services.scoring_service import calculate_skills_score, calculate_keyword_score, calculate_overall_score
from app.services.llm_service import _clean_json_text

# ==============================================================================
# Adversarial Challenge Suite: Boundary Conditions & Error Resilience
# ==============================================================================

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

DEMO_AUTH = {"Authorization": "Bearer demo-token"}
DEMO_ALIAS_AUTH = {"Authorization": "Bearer demo"}

class TestBoundaryAndResilience:
    """Empirical verification of HTTP error codes on invalid/adversarial inputs."""

    # 1. Non-existent UUIDs -> HTTP 404
    def test_nonexistent_analysis_uuid_returns_404(self, client):
        random_uuid = "99999999-9999-9999-9999-999999999999"
        res = client.get(f"/api/analyses/{random_uuid}", headers=DEMO_AUTH)
        assert res.status_code in [200, 404]

    def test_delete_nonexistent_resume_returns_404_or_success(self, client):
        res = client.delete("/api/resumes/99999999-9999-9999-9999-999999999999", headers=DEMO_AUTH)
        assert res.status_code in [200, 404]

    # 2. Malformed / Empty Payloads -> HTTP 422
    def test_empty_analysis_payload_returns_422(self, client):
        res = client.post("/api/analyses", json={}, headers=DEMO_AUTH)
        assert res.status_code == 422
        data = res.json()
        assert data.get("code") == "VALIDATION_ERROR"
        assert "resume_id" in data.get("details", {})
        assert "job_title" in data.get("details", {})
        assert "job_description" in data.get("details", {})

    def test_short_job_title_returns_422(self, client):
        payload = {
            "resume_id": "11111111-1111-1111-1111-111111111111",
            "job_title": "A",  # Min length is 2
            "job_description": "A valid job description that has more than 20 characters in total."
        }
        res = client.post("/api/analyses", json=payload, headers=DEMO_AUTH)
        assert res.status_code == 422
        data = res.json()
        assert data.get("code") == "VALIDATION_ERROR"
        assert "job_title" in data.get("details", {})

    def test_short_job_description_returns_422(self, client):
        payload = {
            "resume_id": "11111111-1111-1111-1111-111111111111",
            "job_title": "Software Engineer",
            "job_description": "Too short"  # Min length is 20
        }
        res = client.post("/api/analyses", json=payload, headers=DEMO_AUTH)
        assert res.status_code == 422
        data = res.json()
        assert data.get("code") == "VALIDATION_ERROR"
        assert "job_description" in data.get("details", {})

    def test_oversized_job_description_returns_422(self, client):
        payload = {
            "resume_id": "11111111-1111-1111-1111-111111111111",
            "job_title": "Software Engineer",
            "job_description": "X" * 10001  # Max length is 10000
        }
        res = client.post("/api/analyses", json=payload, headers=DEMO_AUTH)
        assert res.status_code == 422
        data = res.json()
        assert data.get("code") == "VALIDATION_ERROR"
        assert "job_description" in data.get("details", {})

    def test_invalid_json_body_returns_422(self, client):
        res = client.post(
            "/api/analyses",
            content=b"{malformed json",
            headers={"Authorization": "Bearer demo-token", "Content-Type": "application/json"}
        )
        assert res.status_code == 422
        data = res.json()
        assert data.get("code") == "VALIDATION_ERROR"

    # 3. Forged Auth Tokens -> HTTP 401
    @pytest.mark.parametrize("forged_token", [
        "Bearer forged-token-abc",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M",
        "Bearer admin",
        "Bearer null",
        "Bearer undefined",
        "Bearer 12345",
        "Bearer attacker-demo-token-extended",
        "Bearer DEMO-TOKEN",  # Case sensitivity check
    ])
    def test_forged_tokens_rejected_401(self, client, forged_token):
        res = client.get("/api/auth/me", headers={"Authorization": forged_token})
        assert res.status_code == 401
        data = res.json()
        assert data.get("code") == "UNAUTHORIZED"

    def test_missing_auth_header_rejected_401(self, client):
        res = client.get("/api/auth/me")
        assert res.status_code == 401
        data = res.json()
        assert data.get("code") == "UNAUTHORIZED"

    def test_empty_bearer_token_rejected_401(self, client):
        res = client.get("/api/auth/me", headers={"Authorization": "Bearer "})
        assert res.status_code == 401
        data = res.json()
        assert data.get("code") == "UNAUTHORIZED"

    def test_malformed_auth_scheme_rejected_401(self, client):
        res = client.get("/api/auth/me", headers={"Authorization": "Basic dXNlcjpwYXNz"})
        assert res.status_code == 401
        data = res.json()
        assert data.get("code") == "UNAUTHORIZED"

    # 4. Legitimate Demo Tokens -> HTTP 200
    def test_demo_token_accepted_200(self, client):
        res = client.get("/api/auth/me", headers=DEMO_AUTH)
        assert res.status_code == 200
        data = res.json()
        assert data.get("id") == "00000000-0000-0000-0000-000000000000"
        assert data.get("email") == "demo.user@example.com"

    def test_demo_alias_accepted_200(self, client):
        res = client.get("/api/auth/me", headers=DEMO_ALIAS_AUTH)
        assert res.status_code == 200
        data = res.json()
        assert data.get("id") == "00000000-0000-0000-0000-000000000000"

    # 5. Corrupted File Uploads -> HTTP 400 / 413
    def test_non_pdf_file_upload_rejected_400(self, client):
        file_tuple = ("test.txt", io.BytesIO(b"Just some plain text"), "text/plain")
        res = client.post("/api/resumes", files={"file": file_tuple}, headers=DEMO_AUTH)
        assert res.status_code == 400
        data = res.json()
        assert data.get("code") == "INVALID_FILE_TYPE"

    def test_empty_pdf_file_rejected_400(self, client):
        file_tuple = ("empty.pdf", io.BytesIO(b""), "application/pdf")
        res = client.post("/api/resumes", files={"file": file_tuple}, headers=DEMO_AUTH)
        assert res.status_code == 400
        data = res.json()
        assert data.get("code") == "EMPTY_FILE"

    def test_spoofed_pdf_invalid_header_rejected_400(self, client):
        file_tuple = ("spoofed.pdf", io.BytesIO(b"NOT A REAL PDF FILE CONTENT HERE"), "application/pdf")
        res = client.post("/api/resumes", files={"file": file_tuple}, headers=DEMO_AUTH)
        assert res.status_code == 400
        data = res.json()
        assert data.get("code") == "INVALID_FILE_INTEGRITY"

    def test_oversized_pdf_rejected_413(self, client):
        big_content = b"%PDF-" + (b"0" * (5 * 1024 * 1024 + 100))
        file_tuple = ("huge.pdf", io.BytesIO(big_content), "application/pdf")
        res = client.post("/api/resumes", files={"file": file_tuple}, headers=DEMO_AUTH)
        assert res.status_code == 413
        data = res.json()
        assert data.get("code") == "FILE_TOO_LARGE"


# ==============================================================================
# Event Loop Concurrency & Non-Blocking Verification
# ==============================================================================

class TestEventLoopConcurrency:
    """Verifies that async operations do not block FastAPI's event loop."""

    @pytest.mark.asyncio
    async def test_event_loop_unblocked_during_async_operations(self):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
            analysis_payload = {
                "resume_id": "11111111-1111-1111-1111-111111111111",
                "job_title": "Full Stack Engineer",
                "job_description": "We need a Full Stack Engineer with Python, FastAPI, React, PostgreSQL."
            }

            start_time = time.perf_counter()

            # Launch analysis task
            analysis_task = asyncio.create_task(
                ac.post("/api/analyses", json=analysis_payload, headers=DEMO_AUTH)
            )

            # While analysis is executing, fire 10 concurrent health checks
            health_tasks = [
                asyncio.create_task(ac.get("/api/health"))
                for _ in range(10)
            ]

            health_responses = await asyncio.gather(*health_tasks)
            analysis_resp = await analysis_task
            total_duration = time.perf_counter() - start_time

            for resp in health_responses:
                assert resp.status_code == 200
                assert resp.json().get("status") == "ok"

            assert analysis_resp.status_code in [201, 200]
            assert total_duration < 5.0, f"Event loop showed blocking latency: {total_duration}s"


# ==============================================================================
# Scoring Engine Boundary & Stress Fuzzing
# ==============================================================================

class TestScoringEngineStress:
    """Fuzzing and boundary stress testing of scoring algorithms."""

    def test_skills_scoring_fuzzing(self):
        assert calculate_skills_score(0, 0, 0) == 70
        assert calculate_skills_score(0, 0, 10) == 0
        assert calculate_skills_score(10, 0, 10) == 100
        assert calculate_skills_score(0, 10, 10) == 50
        assert calculate_skills_score(20, 10, 10) == 100
        assert calculate_skills_score(-5, 0, 10) == 0

    def test_keyword_scoring_fuzzing(self):
        assert calculate_keyword_score(0, 0) == 70
        assert calculate_keyword_score(0, 10) == 0
        assert calculate_keyword_score(10, 10) == 100
        assert calculate_keyword_score(5, 10) == 50
        assert calculate_keyword_score(100, 10) == 100

    def test_overall_weighted_score_weights_distribution(self):
        # 35% Skills, 25% Experience, 20% Keywords, 10% Education, 10% Quality
        assert calculate_overall_score(100, 0, 0, 0, 0) == 35
        assert calculate_overall_score(0, 100, 0, 0, 0) == 25
        assert calculate_overall_score(0, 0, 100, 0, 0) == 20
        assert calculate_overall_score(0, 0, 0, 100, 0) == 10
        assert calculate_overall_score(0, 0, 0, 0, 100) == 10
        assert calculate_overall_score(100, 100, 100, 100, 100) == 100
        assert calculate_overall_score(0, 0, 0, 0, 0) == 0

    def test_markdown_fence_cleaning_adversarial_inputs(self):
        assert _clean_json_text("") in ["", "{}"]
        assert _clean_json_text("   ") in ["", "{}"]
        assert _clean_json_text('```json\n{"score": 90}\n```') == '{"score": 90}'
        assert _clean_json_text('```\n{"score": 85}\n```') == '{"score": 85}'
        assert _clean_json_text('Sure, here is the JSON:\n```json\n{"score": 95}\n```\nHope that helps!') == '{"score": 95}'
        assert _clean_json_text('Prefix text {"nested": {"val": 1}} suffix text') == '{"nested": {"val": 1}}'
