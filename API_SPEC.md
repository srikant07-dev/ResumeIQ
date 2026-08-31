# ResumeIQ — REST API Specification

All backend endpoints are prefixed with `/api` and consume/produce `application/json` (except `/api/resumes` upload which consumes `multipart/form-data`).

---

## 1. Standard Error Schema

Every error response adheres strictly to the `ErrorResponse` schema:

```json
{
  "code": "ERROR_CODE_ENUM",
  "message": "Human-readable explanation.",
  "details": {
    "field": "Optional contextual information"
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED`: Missing or invalid Bearer token.
- `FORBIDDEN`: Attempting to access resources owned by another user.
- `NOT_FOUND`: Resource with given ID does not exist.
- `INVALID_FILE_TYPE`: Uploaded file is not a valid PDF.
- `FILE_TOO_LARGE`: Uploaded PDF exceeds 5MB size limit.
- `PARSING_ERROR`: PDF content could not be read or extracted.
- `VALIDATION_ERROR`: Missing or malformed request payload parameters.
- `AI_SERVICE_ERROR`: Failure communicating with Gemini API or validating AI output.
- `INTERNAL_SERVER_ERROR`: Unhandled server exception.

---

## 2. Endpoints

### 2.1 Health Check
```http
GET /api/health
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "demo_mode": false
}
```

---

### 2.2 Authentication & User
```http
GET /api/auth/me
Headers: Authorization: Bearer <jwt_token>
```
**Response (200 OK):**
```json
{
  "id": "c1f72d62-124b-4ec9-9238-72fa998a44b1",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "created_at": "2026-08-31T12:00:00Z"
}
```

---

### 2.3 Resumes

#### Upload Resume
```http
POST /api/resumes
Headers: Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <binary_pdf_stream>
```
**Response (201 Created):**
```json
{
  "id": "e2a39281-9dfc-4235-86ef-a7e8e192a912",
  "file_name": "jane_doe_resume.pdf",
  "extracted_text_preview": "Summary of qualifications...",
  "created_at": "2026-08-31T12:05:00Z"
}
```

#### List Resumes
```http
GET /api/resumes
Headers: Authorization: Bearer <jwt_token>
```
**Response (200 OK):**
```json
[
  {
    "id": "e2a39281-9dfc-4235-86ef-a7e8e192a912",
    "file_name": "jane_doe_resume.pdf",
    "created_at": "2026-08-31T12:05:00Z"
  }
]
```

#### Delete Resume
```http
DELETE /api/resumes/{resume_id}
Headers: Authorization: Bearer <jwt_token>
```
**Response (200 OK):**
```json
{
  "status": "deleted",
  "id": "e2a39281-9dfc-4235-86ef-a7e8e192a912"
}
```

---

### 2.4 Analyses

#### Create & Execute Analysis
```http
POST /api/analyses
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "resume_id": "e2a39281-9dfc-4235-86ef-a7e8e192a912",
  "job_title": "Full Stack Engineer",
  "job_description": "We are seeking a Full Stack Engineer with 2+ years of React, FastAPI, PostgreSQL..."
}
```
**Response (201 Created):**
```json
{
  "id": "f5832a10-410a-42cc-a084-5a210747120a",
  "resume_id": "e2a39281-9dfc-4235-86ef-a7e8e192a912",
  "job_title": "Full Stack Engineer",
  "job_description": "...",
  "overall_score": 82,
  "skills_score": 88,
  "experience_score": 75,
  "keyword_score": 80,
  "education_score": 95,
  "quality_score": 80,
  "status": "completed",
  "result_json": {
    "score_breakdown": {
      "skills": {
        "score": 88,
        "source": "deterministic",
        "evidence": "Matched 7 of 8 core technical requirements; 1 partial match (PostgreSQL vs general SQL)."
      },
      "experience": {
        "score": 75,
        "source": "ai",
        "evidence": "Candidate has 2 production web projects showing full-stack development, but lacks explicit microservices exposure."
      },
      "keywords": {
        "score": 80,
        "source": "deterministic",
        "evidence": "Found 16 of 20 high-frequency target keywords across technical and domain categories."
      },
      "education": {
        "score": 95,
        "source": "ai",
        "evidence": "B.Tech Computer Science degree matches the requested Bachelor's in CS/related field."
      },
      "quality": {
        "score": 80,
        "source": "ai",
        "evidence": "Clear bullet points with action verbs; could improve by quantifying user metrics."
      }
    },
    "matching_skills": [
      { "skill": "React", "context": "Built complex responsive web clients with React and Tailwind CSS." },
      { "skill": "FastAPI", "context": "Developed high-throughput REST APIs using Python and FastAPI." }
    ],
    "partial_skills": [
      { "skill": "PostgreSQL", "context": "Resume mentions relational databases and SQL queries, but PostgreSQL specifics are not detailed." }
    ],
    "missing_skills": ["Docker", "Kubernetes", "AWS ECS"],
    "keywords_present": ["React", "FastAPI", "Python", "REST APIs", "Git", "Tailwind CSS"],
    "keywords_missing": ["Docker", "Containerization", "CI/CD Pipeline"],
    "keyword_categories": {
      "technical": ["React", "FastAPI", "Python", "PostgreSQL", "Docker"],
      "soft": ["Collaboration", "Agile", "Problem Solving"],
      "domain": ["Cloud SaaS", "API Architecture"]
    },
    "strengths": [
      { "point": "Strong Modern Python/React Stack Match", "evidence": "Primary web frameworks match the exact requirements of the job description." }
    ],
    "weaknesses": [
      { "point": "Missing Containerization & Deployment Evidence", "evidence": "Job lists Docker as mandatory, but resume lacks deployment or container details." }
    ],
    "recommendations": [
      {
        "priority": "HIGH",
        "title": "Highlight Docker and Containerization Experience",
        "description": "The target role explicitly requires containerization skills.",
        "evidence": "Job lists 'Docker & container orchestration' under primary qualifications.",
        "suggested_action": "If you have used Docker in academic or personal projects, add a bullet point detailing how you containerized your FastAPI backend."
      }
    ],
    "summary": "Strong technical foundation with high alignment to core application development requirements; adding DevOps and container details will significantly boost competitiveness."
  },
  "created_at": "2026-08-31T12:06:00Z"
}
```

#### List Analysis History
```http
GET /api/analyses
Headers: Authorization: Bearer <jwt_token>
```
**Response (200 OK):**
```json
[
  {
    "id": "f5832a10-410a-42cc-a084-5a210747120a",
    "resume_id": "e2a39281-9dfc-4235-86ef-a7e8e192a912",
    "job_title": "Full Stack Engineer",
    "overall_score": 82,
    "status": "completed",
    "created_at": "2026-08-31T12:06:00Z"
  }
]
```

#### Get Specific Analysis
```http
GET /api/analyses/{analysis_id}
Headers: Authorization: Bearer <jwt_token>
```

#### Delete Analysis
```http
DELETE /api/analyses/{analysis_id}
Headers: Authorization: Bearer <jwt_token>
```
**Response (200 OK):**
```json
{
  "status": "deleted",
  "id": "f5832a10-410a-42cc-a084-5a210747120a"
}
```
