import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ==============================================================================
# Tier 1: Feature Coverage (Analysis Creation, History, Detail & Deletion)
# ==============================================================================

def test_create_analysis_success(auth_headers, sample_jd):
    """
    Verifies creating an analysis in demo mode with valid payload.
    Returns HTTP 201 with completed status and full score breakdown.
    """
    payload = {
        "resume_id": "11111111-1111-1111-1111-111111111111",
        "job_title": "Full Stack Engineer",
        "job_description": sample_jd
    }
    response = client.post("/api/analyses", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["job_title"] == "Full Stack Engineer"
    assert data["status"] == "completed"
    assert data["overall_score"] is not None
    assert data["result_json"] is not None
    assert "score_breakdown" in data["result_json"]

def test_list_analyses_history(auth_headers):
    """Verifies listing previous analyses history."""
    response = client.get("/api/analyses", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "id" in data[0]
        assert "job_title" in data[0]
        assert "status" in data[0]

def test_get_analysis_detail_mock(auth_headers):
    """Verifies retrieving detail for demo analysis record."""
    # Test with standard demo analysis ID
    response = client.get("/api/analyses/22222222-2222-2222-2222-222222222221", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["result_json"] is not None

# ==============================================================================
# Tier 2: Boundary & Corner Cases (Validation, Non-Existent IDs, Missing Fields)
# ==============================================================================

def test_create_analysis_short_job_title_rejected(auth_headers, sample_jd):
    """Verifies that job_title < 2 characters triggers HTTP 422 validation error."""
    payload = {
        "resume_id": "11111111-1111-1111-1111-111111111111",
        "job_title": "A",
        "job_description": sample_jd
    }
    response = client.post("/api/analyses", json=payload, headers=auth_headers)
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"

def test_create_analysis_short_job_description_rejected(auth_headers):
    """Verifies that job_description < 20 characters triggers HTTP 422 validation error."""
    payload = {
        "resume_id": "11111111-1111-1111-1111-111111111111",
        "job_title": "Software Engineer",
        "job_description": "Too short JD"
    }
    response = client.post("/api/analyses", json=payload, headers=auth_headers)
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"

def test_get_nonexistent_analysis_returns_404(auth_headers):
    """
    Verifies that requesting a non-existent analysis returns clean HTTP 404 instead of HTTP 500 (DEF-01).
    """
    non_existent_id = "00000000-9999-9999-9999-000000000000"
    response = client.get(f"/api/analyses/{non_existent_id}", headers=auth_headers)
    assert response.status_code == 404
    data = response.json()
    assert data["code"] == "ANALYSIS_NOT_FOUND"

def test_delete_analysis_endpoint(auth_headers):
    """Verifies analysis deletion endpoint response."""
    test_id = "22222222-2222-2222-2222-222222222222"
    response = client.delete(f"/api/analyses/{test_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "deleted"

