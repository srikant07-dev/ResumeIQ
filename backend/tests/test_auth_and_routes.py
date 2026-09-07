from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ==============================================================================
# Tier 1: Feature Coverage (Authentication & Protected Route Enforcement)
# ==============================================================================

def test_unauthorized_access_returns_error_response():
    """
    Verifies that unauthenticated calls return HTTP 401 with standard ErrorResponse JSON format (DEF-06).
    """
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"
    assert "message" in data
    assert "details" in data

def test_unauthorized_resumes_list():
    """Verifies that accessing resumes without auth returns HTTP 401."""
    response = client.get("/api/resumes")
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"

def test_unauthorized_analysis_create():
    """Verifies that creating analysis without auth returns HTTP 401."""
    response = client.post("/api/analyses", json={
        "resume_id": "11111111-1111-1111-1111-111111111111",
        "job_title": "Software Engineer",
        "job_description": "Valid job description with enough characters for validation."
    })
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"

def test_unauthorized_analysis_detail():
    """Verifies that getting analysis details without auth returns HTTP 401."""
    response = client.get("/api/analyses/22222222-2222-2222-2222-222222222221")
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"

def test_unauthorized_analysis_delete():
    """Verifies that deleting an analysis without auth returns HTTP 401."""
    response = client.delete("/api/analyses/22222222-2222-2222-2222-222222222221")
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"

# ==============================================================================
# Tier 2: Boundary & Corner Cases (Malformed Tokens, Header Formats, Invalid Tokens)
# ==============================================================================

def test_malformed_auth_header_missing_bearer():
    """Verifies that headers not prefixed with 'Bearer ' are rejected with HTTP 401."""
    response = client.get("/api/auth/me", headers={"Authorization": "Basic dXNlcjpwYXNz"})
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"
    assert "Bearer" in data["message"]

def test_demo_token_authentication_success(auth_headers):
    """Verifies that 'Bearer demo-token' successfully authenticates."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert data["email"] == "demo.user@example.com"
    assert data["full_name"] == "Demo Candidate"

def test_demo_token_alias_success():
    """Verifies that 'Bearer demo' alias successfully authenticates."""
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer demo"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "demo.user@example.com"

def test_forged_token_rejected(invalid_auth_headers):
    """Verifies that arbitrary forged tokens are rejected with HTTP 401 UNAUTHORIZED (DEF-07)."""
    response = client.get("/api/auth/me", headers=invalid_auth_headers)
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"

def test_empty_bearer_token_rejected():
    """Verifies that empty Bearer token is rejected with HTTP 401."""
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer "})
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"

