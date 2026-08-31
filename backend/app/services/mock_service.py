from app.schemas.analysis import (
    AnalysisResultData,
    ScoreBreakdown,
    ScoreEvidence,
    SkillMatch,
    CategorizedKeywords,
    EvidencePoint,
    Recommendation
)

def get_mock_analysis_result(job_title: str, resume_preview: str = "") -> AnalysisResultData:
    """
    Provides a rich, deterministic mock analysis dataset for offline testing,
    UI demonstrations, and fallback modes.
    """
    return AnalysisResultData(
        score_breakdown=ScoreBreakdown(
            skills=ScoreEvidence(
                score=84,
                source="deterministic",
                evidence="Matched 6 of 7 core technical competencies (React, FastAPI, Python, PostgreSQL, Git, REST APIs); 1 partial match (Docker vs basic container concepts)."
            ),
            experience=ScoreEvidence(
                score=78,
                source="ai",
                evidence="Demonstrated strong full-stack project execution and API design, but lacks explicit high-scale production metrics."
            ),
            keywords=ScoreEvidence(
                score=82,
                source="deterministic",
                evidence="Found 14 of 17 high-priority technical and domain keywords across the resume."
            ),
            education=ScoreEvidence(
                score=95,
                source="ai",
                evidence="B.Tech in Computer Science satisfies the required Bachelor's degree in engineering/computer science."
            ),
            quality=ScoreEvidence(
                score=80,
                source="ai",
                evidence="Clear section hierarchy, bulleted achievements, and strong technical vocabulary."
            )
        ),
        matching_skills=[
            SkillMatch(skill="React", context="Built dynamic web dashboards with React hooks and modern state management."),
            SkillMatch(skill="Python", context="Developed asynchronous backend microservices and data processing scripts."),
            SkillMatch(skill="FastAPI", context="Architected RESTful endpoints with Pydantic validation and JWT authentication."),
            SkillMatch(skill="PostgreSQL", context="Designed relational database schemas with indexed queries and migrations."),
            SkillMatch(skill="REST APIs", context="Integrated third-party APIs and created standard OpenAPI specifications."),
            SkillMatch(skill="Git", context="Used Git branching workflows and GitHub pull requests for collaboration.")
        ],
        partial_skills=[
            SkillMatch(skill="Docker", context="Mentions virtual environments and container basics, but lacks explicit Dockerfile / multi-stage build examples."),
            SkillMatch(skill="CI/CD", context="Configured GitHub Actions for unit testing, but no automated deployment pipeline detailed.")
        ],
        missing_skills=[
            "Kubernetes",
            "AWS ECS / Cloud Architecture",
            "Redis Caching"
        ],
        keywords_present=[
            "React", "Python", "FastAPI", "PostgreSQL", "REST APIs",
            "Git", "Tailwind CSS", "JSON", "JWT Auth", "Unit Testing",
            "Agile", "Problem Solving", "Database Indexing", "Async IO"
        ],
        keywords_missing=[
            "Kubernetes", "Redis", "Microservices Architecture"
        ],
        keyword_categories=CategorizedKeywords(
            technical=["React", "Python", "FastAPI", "PostgreSQL", "Docker", "Git", "Redis"],
            soft=["Problem Solving", "Agile Collaboration", "Technical Writing"],
            domain=["REST Architecture", "Database Optimization", "SaaS Engineering"]
        ),
        strengths=[
            EvidencePoint(
                point="Direct Framework Match",
                evidence="The candidate's core stack (React + FastAPI + PostgreSQL) matches the primary tech stack in the job description."
            ),
            EvidencePoint(
                point="Clear Project-Based Evidence",
                evidence="Resume contains well-defined full-stack project examples with concrete functionality descriptions."
            )
        ],
        weaknesses=[
            EvidencePoint(
                point="Absence of Cloud Infrastructure & Containerization",
                evidence="The job emphasizes containerized deployment with Docker/AWS, which is not clearly demonstrated in project bullets."
            ),
            EvidencePoint(
                point="Limited Quantifiable Business Impact",
                evidence="Project descriptions focus on technical actions rather than measurable results (e.g., query speedup, user volume, latency reduction)."
            )
        ],
        recommendations=[
            Recommendation(
                priority="HIGH",
                title="Add Dockerfile and Containerization Details",
                description="The target position considers containerization a foundational requirement.",
                evidence="Job listing specifies 'Containerization with Docker' under Mandatory Qualifications.",
                suggested_action="If you have used Docker for your FastAPI or React projects, add a bullet specifying container image optimization and local orchestration."
            ),
            Recommendation(
                priority="MEDIUM",
                title="Quantify Engineering Impact in Bullet Points",
                description="Resume bullets currently describe features built without highlighting performance or scale.",
                evidence="Evaluator noted absence of performance or volume metrics across project sections.",
                suggested_action="Incorporate honest metrics such as 'Reduced API response times by optimizing SQL queries' or 'Handled 50+ concurrent requests in local benchmarking'."
            ),
            Recommendation(
                priority="LOW",
                title="Highlight Redis / Caching Exposure",
                description="The job lists caching mechanisms under preferred skills.",
                evidence="Job description mentions 'Familiarity with in-memory caches (Redis/Memcached) is a plus.'",
                suggested_action="If you have implemented caching for authentication sessions or frequently queried data, mention it explicitly in a backend bullet."
            )
        ],
        summary="Candidate presents a solid 82% match with strong alignment across core Python/React development. Enhancing the resume with truthful Docker containerization details and measurable impact metrics will strongly improve interview conversion."
    )
