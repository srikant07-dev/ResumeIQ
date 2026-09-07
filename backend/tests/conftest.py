import os
os.environ["DEMO_MODE"] = "true"

import io
import pytest
from app.config import get_settings
get_settings.cache_clear()
get_settings().DEMO_MODE = True

from fastapi.testclient import TestClient
from app.main import app

# Minimal valid PDF file content with proper PDF header and EOF
VALID_PDF_BYTES = (
    b"%PDF-1.4\n"
    b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
    b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
    b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n"
    b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
)

SAMPLE_RESUME_TEXT = """
Srikant Sriniwasan
Full Stack Engineer & Software Architect
Email: srikant@example.com | GitHub: github.com/srikant-dev

PROFESSIONAL SUMMARY:
Results-driven Full Stack Engineer with 4+ years building high-performance web applications using FastAPI, Python, React, PostgreSQL, and Cloud Infrastructure. Designed and deployed RESTful APIs processing over 100k requests/day.

TECHNICAL SKILLS:
Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3
Backend: FastAPI, Django, Node.js, Express, REST APIs, Microservices, AsyncIO
Frontend: React, Vite, Tailwind CSS, Next.js, Redux, State Management
Databases & Cloud: PostgreSQL, Supabase, Redis, Docker, AWS, CI/CD, Git

EXPERIENCE:
Senior Full Stack Engineer | TechNova Solutions (2022 - Present)
- Architected and built scalable backend microservices using FastAPI and PostgreSQL, reducing latency by 45%.
- Developed reactive client dashboards using React, Vite, and Tailwind CSS with real-time WebSocket state updates.
- Spearheaded automated testing with pytest and Vitest, achieving 95% code coverage across repositories.

Software Engineer | AlphaCloud Systems (2020 - 2022)
- Built enterprise RESTful APIs in Python and integrated third-party payment and auth webhooks.
- Maintained relational databases and optimized complex SQL queries for 10M+ row tables.

EDUCATION:
Bachelor of Technology in Computer Science & Engineering (2016 - 2020)
Top Tier Institute | GPA: 8.8/10.0
"""

SAMPLE_JOB_DESCRIPTION = """
We are seeking a Senior Full Stack Engineer to join our core product team.
Key Responsibilities:
- Design, build, and maintain scalable web services and RESTful APIs using Python, FastAPI, and PostgreSQL.
- Build responsive, modern web frontends using React, TypeScript, and modern CSS frameworks (Tailwind CSS).
- Collaborate with product and design teams to create high-performance user interfaces.
- Ensure system reliability, security, automated testing, and CI/CD best practices.

Requirements:
- 3+ years experience with Python and web frameworks (FastAPI / Django).
- 3+ years experience with React, JavaScript/TypeScript, and modern frontend tools.
- Strong knowledge of PostgreSQL database modeling, indexing, and query optimization.
- Experience with Docker, cloud deployments, and automated testing (pytest).
- Excellent communication and problem-solving skills.
"""

@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient session fixture."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def auth_headers():
    """Valid demo token authorization headers."""
    return {"Authorization": "Bearer demo-token"}

@pytest.fixture
def invalid_auth_headers():
    """Invalid token authorization headers."""
    return {"Authorization": "Bearer invalid-secret-token-12345"}

@pytest.fixture
def sample_pdf():
    """Returns valid PDF bytes fixture."""
    return VALID_PDF_BYTES

@pytest.fixture
def sample_pdf_file():
    """Returns an UploadFile-compatible tuple for TestClient multipart upload."""
    return ("resume.pdf", io.BytesIO(VALID_PDF_BYTES), "application/pdf")

@pytest.fixture
def sample_resume():
    return SAMPLE_RESUME_TEXT

@pytest.fixture
def sample_jd():
    return SAMPLE_JOB_DESCRIPTION
