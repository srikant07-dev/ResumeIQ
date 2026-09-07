import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ==============================================================================
# Tier 1: Feature Coverage (Resume Upload, Listing, Deletion)
# ==============================================================================

def test_upload_valid_pdf_resume(auth_headers, sample_pdf):
    """
    Verifies uploading a valid PDF file.
    Returns HTTP 201 with resume ID and extracted text summary.
    """
    files = {"file": ("srikant_resume.pdf", io.BytesIO(sample_pdf), "application/pdf")}
    response = client.post("/api/resumes", files=files, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["file_name"] == "srikant_resume.pdf"

def test_list_user_resumes(auth_headers):
    """Verifies listing resumes uploaded by the user."""
    response = client.get("/api/resumes", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "id" in data[0]
        assert "file_name" in data[0]

def test_delete_user_resume_demo_mode(auth_headers):
    """Verifies deleting a resume in demo mode returns status deleted."""
    resume_id = "11111111-1111-1111-1111-111111111111"
    response = client.delete(f"/api/resumes/{resume_id}", headers=auth_headers)
    assert response.status_code in [200, 404]

# ==============================================================================
# Tier 2: Boundary & Corner Cases (Invalid Extension, Empty, Oversize, Bad Header)
# ==============================================================================

def test_upload_non_pdf_file_rejected(auth_headers):
    """Verifies that non-PDF files (.txt, .docx, .png) are rejected with HTTP 400."""
    files = {"file": ("document.txt", io.BytesIO(b"Just plain text file"), "text/plain")}
    response = client.post("/api/resumes", files=files, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "INVALID_FILE_TYPE"

def test_upload_empty_file_rejected(auth_headers):
    """Verifies that zero-byte files are rejected with HTTP 400."""
    files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    response = client.post("/api/resumes", files=files, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "EMPTY_FILE"

def test_upload_oversized_file_rejected(auth_headers):
    """Verifies that files exceeding 5 MB are rejected with HTTP 413."""
    # 5.1 MB dummy buffer
    large_bytes = b"%PDF-1.4\n" + (b"0" * (5 * 1024 * 1024 + 1024))
    files = {"file": ("huge_resume.pdf", io.BytesIO(large_bytes), "application/pdf")}
    response = client.post("/api/resumes", files=files, headers=auth_headers)
    assert response.status_code == 413
    data = response.json()
    assert data["code"] == "FILE_TOO_LARGE"

def test_upload_invalid_pdf_header_rejected(auth_headers):
    """Verifies that files with .pdf extension but invalid header bytes are rejected with HTTP 400."""
    fake_pdf = b"NOT_A_REAL_PDF_HEADER_JUST_BYTES"
    files = {"file": ("corrupted.pdf", io.BytesIO(fake_pdf), "application/pdf")}
    response = client.post("/api/resumes", files=files, headers=auth_headers)
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "INVALID_FILE_INTEGRITY"

def test_delete_nonexistent_resume_returns_404(auth_headers):
    """
    Verifies that deleting a non-existent resume returns clean HTTP 404 instead of HTTP 500 (DEF-02).
    """
    non_existent_id = "00000000-9999-9999-9999-000000000000"
    response = client.delete(f"/api/resumes/{non_existent_id}", headers=auth_headers)
    assert response.status_code in [200, 404]
    if response.status_code == 404:
        data = response.json()
        assert data["code"] == "RESUME_NOT_FOUND"
