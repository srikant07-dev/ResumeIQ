from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_unauthorized_access_returns_error_response():
    # Calling /api/auth/me without token should return 401 and ErrorResponse format
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    detail = data["detail"]
    assert detail["code"] == "UNAUTHORIZED"
    assert "message" in detail

def test_unauthorized_resumes_list():
    response = client.get("/api/resumes")
    assert response.status_code == 401

def test_unauthorized_analysis_create():
    response = client.post("/api/analyses", json={
        "resume_id": "123",
        "job_title": "Engineer",
        "job_description": "Valid description with enough characters for validation"
    })
    assert response.status_code == 401
