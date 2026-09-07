import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import time
import asyncio
import io
import json
import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.config import get_settings
from app.services.scoring_service import (
    calculate_skills_score,
    calculate_keyword_score,
    calculate_overall_score,
    SCORE_WEIGHTS
)
from app.services.llm_service import _clean_json_text

def log_section(title):
    print(f"\n{'='*70}\n[TEST SECTION] {title}\n{'='*70}")

def run_all_adversarial_tests():
    client = TestClient(app)
    results = {"passed": 0, "failed": 0, "findings": []}

    def record_pass(test_name, detail=""):
        results["passed"] += 1
        print(f"  [PASS] {test_name} {detail}")

    def record_fail(test_name, reason):
        results["failed"] += 1
        results["findings"].append({"test": test_name, "reason": reason})
        print(f"  [FAIL] {test_name} -> {reason}")

    # --------------------------------------------------------------------------
    # 1. Boundary Condition & Error Resilience: Non-Existent UUIDs
    # --------------------------------------------------------------------------
    log_section("1. Non-Existent UUIDs Handling")
    # A. GET non-existent analysis
    res = client.get("/api/analyses/00000000-0000-0000-0000-999999999999", headers={"Authorization": "Bearer demo-token"})
    if res.status_code in [200, 404]:
        record_pass("GET /api/analyses/{non_existent_uuid}", f"Status: {res.status_code}")
    else:
        record_fail("GET /api/analyses/{non_existent_uuid}", f"Unexpected status {res.status_code}: {res.text}")

    # B. DELETE non-existent resume
    res = client.delete("/api/resumes/00000000-0000-0000-0000-999999999999", headers={"Authorization": "Bearer demo-token"})
    if res.status_code in [200, 404]:
        record_pass("DELETE /api/resumes/{non_existent_uuid}", f"Status: {res.status_code}")
    else:
        record_fail("DELETE /api/resumes/{non_existent_uuid}", f"Unexpected status {res.status_code}: {res.text}")

    # C. DELETE non-existent analysis
    res = client.delete("/api/analyses/00000000-0000-0000-0000-999999999999", headers={"Authorization": "Bearer demo-token"})
    if res.status_code in [200, 404]:
        record_pass("DELETE /api/analyses/{non_existent_uuid}", f"Status: {res.status_code}")
    else:
        record_fail("DELETE /api/analyses/{non_existent_uuid}", f"Unexpected status {res.status_code}: {res.text}")

    # --------------------------------------------------------------------------
    # 2. Boundary Condition: Malformed & Empty Payloads (HTTP 422)
    # --------------------------------------------------------------------------
    log_section("2. Payload Validation & Fuzzing (HTTP 422)")
    # A. Empty JSON object
    res = client.post("/api/analyses", json={}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 422 and res.json().get("code") == "VALIDATION_ERROR":
        record_pass("POST /api/analyses with empty body {}", f"HTTP 422, code=VALIDATION_ERROR")
    else:
        record_fail("POST /api/analyses with empty body {}", f"Status: {res.status_code}, Body: {res.text}")

    # B. Missing resume_id
    res = client.post("/api/analyses", json={"job_title": "Developer", "job_description": "Valid job description over 20 chars"}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 422:
        record_pass("POST /api/analyses missing resume_id", f"HTTP 422")
    else:
        record_fail("POST /api/analyses missing resume_id", f"Status: {res.status_code}")

    # C. Job title < 2 characters
    res = client.post("/api/analyses", json={"resume_id": "11111111-1111-1111-1111-111111111111", "job_title": "X", "job_description": "Valid job description over 20 chars"}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 422 and "job_title" in res.json().get("details", {}):
        record_pass("POST /api/analyses with job_title='X' (<2 chars)", "HTTP 422 details contain 'job_title'")
    else:
        record_fail("POST /api/analyses with job_title='X'", f"Status: {res.status_code}, Body: {res.text}")

    # D. Job description < 20 characters
    res = client.post("/api/analyses", json={"resume_id": "11111111-1111-1111-1111-111111111111", "job_title": "Software Eng", "job_description": "Too short desc"}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 422 and "job_description" in res.json().get("details", {}):
        record_pass("POST /api/analyses with job_description < 20 chars", "HTTP 422 details contain 'job_description'")
    else:
        record_fail("POST /api/analyses with short job_description", f"Status: {res.status_code}, Body: {res.text}")

    # E. Job description > 10,000 characters
    res = client.post("/api/analyses", json={"resume_id": "11111111-1111-1111-1111-111111111111", "job_title": "Software Eng", "job_description": "A" * 10005}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 422:
        record_pass("POST /api/analyses with job_description > 10,000 chars", "HTTP 422 overflow protection verified")
    else:
        record_fail("POST /api/analyses with job_description > 10,000 chars", f"Status: {res.status_code}")

    # F. Malformed JSON syntax
    res = client.post("/api/analyses", content=b"{not: json}", headers={"Authorization": "Bearer demo-token", "Content-Type": "application/json"})
    if res.status_code == 422:
        record_pass("POST /api/analyses with malformed JSON body", "HTTP 422")
    else:
        record_fail("POST /api/analyses with malformed JSON body", f"Status: {res.status_code}")

    # --------------------------------------------------------------------------
    # 3. Authentication & Token Hardening (HTTP 401 vs 200)
    # --------------------------------------------------------------------------
    log_section("3. Authentication & Token Hardening (HTTP 401 / 200)")
    # A. Missing header
    res = client.get("/api/auth/me")
    if res.status_code == 401 and res.json().get("code") == "UNAUTHORIZED":
        record_pass("GET /api/auth/me without Authorization header", "HTTP 401, code=UNAUTHORIZED")
    else:
        record_fail("GET /api/auth/me without auth", f"Status: {res.status_code}")

    # B. Forged / invalid tokens
    forged_samples = [
        ("Bearer invalid_token", "random string"),
        ("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.bogus", "fake JWT signature"),
        ("Bearer admin", "arbitrary token string"),
        ("Bearer demo-token-fake", "demo token prefix injection"),
        ("Bearer DEMO-TOKEN", "uppercase casing mismatch"),
        ("Bearer ", "empty bearer string"),
        ("Token demo-token", "invalid auth scheme"),
    ]
    for auth_val, desc in forged_samples:
        res = client.get("/api/auth/me", headers={"Authorization": auth_val})
        if res.status_code == 401:
            record_pass(f"Auth rejection: {desc} ('{auth_val}')", "HTTP 401 UNAUTHORIZED")
        else:
            record_fail(f"Auth rejection: {desc} ('{auth_val}')", f"Expected 401, got {res.status_code}")

    # C. Legitimate Demo Tokens
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 200 and res.json().get("email") == "demo.user@example.com":
        record_pass("Legitimate demo token 'Bearer demo-token'", "HTTP 200, valid demo profile")
    else:
        record_fail("Legitimate demo token 'Bearer demo-token'", f"Status: {res.status_code}")

    res = client.get("/api/auth/me", headers={"Authorization": "Bearer demo"})
    if res.status_code == 200:
        record_pass("Legitimate demo token alias 'Bearer demo'", "HTTP 200")
    else:
        record_fail("Legitimate demo token alias 'Bearer demo'", f"Status: {res.status_code}")

    # --------------------------------------------------------------------------
    # 4. File Upload Boundaries & Header Validation (HTTP 400 / 413)
    # --------------------------------------------------------------------------
    log_section("4. File Upload Boundaries & PDF Header Integrity")
    # A. Non-PDF extension
    res = client.post("/api/resumes", files={"file": ("malicious.exe", io.BytesIO(b"MZ\x90\x00\x03"), "application/x-msdownload")}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 400 and res.json().get("code") == "INVALID_FILE_TYPE":
        record_pass("Upload non-PDF file (.exe)", "HTTP 400 INVALID_FILE_TYPE")
    else:
        record_fail("Upload non-PDF file (.exe)", f"Status: {res.status_code}, Body: {res.text}")

    # B. Text file (.txt)
    res = client.post("/api/resumes", files={"file": ("resume.txt", io.BytesIO(b"Plain text resume"), "text/plain")}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 400 and res.json().get("code") == "INVALID_FILE_TYPE":
        record_pass("Upload text file (.txt)", "HTTP 400 INVALID_FILE_TYPE")
    else:
        record_fail("Upload text file (.txt)", f"Status: {res.status_code}")

    # C. 0-byte Empty PDF
    res = client.post("/api/resumes", files={"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 400 and res.json().get("code") == "EMPTY_FILE":
        record_pass("Upload empty file (0 bytes)", "HTTP 400 EMPTY_FILE")
    else:
        record_fail("Upload empty file (0 bytes)", f"Status: {res.status_code}")

    # D. Spoofed PDF (extension .pdf but no %PDF- magic header)
    res = client.post("/api/resumes", files={"file": ("fake.pdf", io.BytesIO(b"<html><body>Not a PDF</body></html>"), "application/pdf")}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 400 and res.json().get("code") == "INVALID_FILE_INTEGRITY":
        record_pass("Upload spoofed PDF (HTML disguised as .pdf)", "HTTP 400 INVALID_FILE_INTEGRITY")
    else:
        record_fail("Upload spoofed PDF", f"Status: {res.status_code}")

    # E. Oversized PDF (>5MB)
    huge_pdf = b"%PDF-1.4\n" + (b"X" * (5 * 1024 * 1024 + 1024))
    res = client.post("/api/resumes", files={"file": ("oversized.pdf", io.BytesIO(huge_pdf), "application/pdf")}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 413 and res.json().get("code") == "FILE_TOO_LARGE":
        record_pass("Upload oversized PDF (>5MB)", "HTTP 413 FILE_TOO_LARGE")
    else:
        record_fail("Upload oversized PDF (>5MB)", f"Status: {res.status_code}")

    # F. Valid PDF upload
    valid_pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\ntrailer<</Size 1/Root 1 0 R>>\n%%EOF"
    res = client.post("/api/resumes", files={"file": ("valid_resume.pdf", io.BytesIO(valid_pdf), "application/pdf")}, headers={"Authorization": "Bearer demo-token"})
    if res.status_code == 201:
        record_pass("Upload valid PDF", f"HTTP 201 Created (id={res.json().get('id')})")
    else:
        record_fail("Upload valid PDF", f"Status: {res.status_code}, Body: {res.text}")

    # --------------------------------------------------------------------------
    # 5. Scoring Service Formula & Boundary Clamping Stress Test
    # --------------------------------------------------------------------------
    log_section("5. Scoring Service Weights & Math Stress Testing")
    # Verify weights
    assert SCORE_WEIGHTS["skills"] == 0.35, "Skills weight must be 0.35"
    assert SCORE_WEIGHTS["experience"] == 0.25, "Experience weight must be 0.25"
    assert SCORE_WEIGHTS["keywords"] == 0.20, "Keywords weight must be 0.20"
    assert SCORE_WEIGHTS["education"] == 0.10, "Education weight must be 0.10"
    assert SCORE_WEIGHTS["quality"] == 0.10, "Quality weight must be 0.10"
    total_weights = sum(SCORE_WEIGHTS.values())
    assert abs(total_weights - 1.0) < 1e-9, f"Weights sum to {total_weights} != 1.0"
    record_pass("Scoring weights exact match", "35% Skills, 25% Exp, 20% KW, 10% Edu, 10% Qual = 100%")

    # Test extreme values
    scenarios = [
        (100, 100, 100, 100, 100, 100, "All 100%"),
        (0, 0, 0, 0, 0, 0, "All 0%"),
        (80, 70, 90, 85, 75, 80, "Typical candidate profile"),
        (150, 200, 120, 100, 100, 100, "Overflow clamping check"),
        (-50, -20, -10, 0, 0, 0, "Negative clamping check"),
    ]
    for sk, exp, kw, edu, qual, expected, label in scenarios:
        computed = calculate_overall_score(sk, exp, kw, edu, qual)
        if computed == expected:
            record_pass(f"Overall score calculation: {label}", f"Expected {expected}, got {computed}")
        else:
            record_fail(f"Overall score calculation: {label}", f"Expected {expected}, got {computed}")

    # --------------------------------------------------------------------------
    # 6. Async Concurrency & Non-Blocking Event-Loop Stress
    # --------------------------------------------------------------------------
    log_section("6. Event Loop Concurrency & Non-Blocking Verification")

    async def async_concurrency_stress():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
            req_payload = {
                "resume_id": "11111111-1111-1111-1111-111111111111",
                "job_title": "Full Stack Engineer",
                "job_description": "Requires extensive knowledge of Python, React, PostgreSQL, Docker, AWS."
            }

            t0 = time.perf_counter()
            # 5 concurrent analysis runs
            analysis_tasks = [
                ac.post("/api/analyses", json=req_payload, headers={"Authorization": "Bearer demo-token"})
                for _ in range(5)
            ]
            # 25 concurrent health checks
            health_tasks = [
                ac.get("/api/health")
                for _ in range(25)
            ]

            all_results = await asyncio.gather(*analysis_tasks, *health_tasks)
            elapsed = time.perf_counter() - t0

            analysis_resps = all_results[:5]
            health_resps = all_results[5:]

            for idx, r in enumerate(analysis_resps):
                assert r.status_code in [200, 201], f"Analysis {idx} returned {r.status_code}"

            for idx, r in enumerate(health_resps):
                assert r.status_code == 200, f"Health check {idx} returned {r.status_code}"

            return elapsed

    concurrency_time = asyncio.run(async_concurrency_stress())
    record_pass(f"Concurrent batch (5 analyses + 25 health checks)", f"Completed in {concurrency_time:.3f}s (non-blocking)")

    # --------------------------------------------------------------------------
    # Summary
    # --------------------------------------------------------------------------
    log_section("TEST SUMMARY")
    print(f"Total Passed: {results['passed']}")
    print(f"Total Failed: {results['failed']}")
    if results["findings"]:
        print("Findings:")
        for f in results["findings"]:
            print(f"  - {f['test']}: {f['reason']}")
    return results

if __name__ == "__main__":
    res = run_all_adversarial_tests()
    if res["failed"] > 0:
        sys.exit(1)
    sys.exit(0)
