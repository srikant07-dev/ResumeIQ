# ResumeIQ — Product Requirements Document (PRD)

## 1. Product Vision & Goals
ResumeIQ is an AI-powered SaaS product designed to help job seekers (specifically college students, fresh graduates, and tech job seekers) evaluate how well their resumes match specific job descriptions before applying.

### Core Problems Solved
- Ambiguity around why a resume does or does not pass ATS/recruiter screenings.
- Missing technical and domain keywords in project descriptions.
- Over-reliance on generic AI tools that hallucinate random scores with no explanation.
- Difficulty understanding what specific changes make a candidate competitive.

---

## 2. Target Personas
1. **College Student / Campus Placement Aspirant:** Needs clear guidance on what skills and keywords are mandatory for junior roles.
2. **Fresh Graduate / Entry-Level Developer:** Has projects and skills but struggles to tailor bullet points to match job descriptions.
3. **Career Switcher / Experienced Professional:** Needs quick feedback on skill alignment across multiple job opportunities.

---

## 3. Scope & MVP Features

### In-Scope (MVP)
- Email/Password authentication with Supabase Auth.
- PDF resume upload with client and server validation (MIME, max 5MB, integrity).
- Text extraction from multi-page PDFs using PyPDF2.
- Job description input form (with character count & validation).
- Hybrid scoring pipeline (Skills 35%, Experience 25%, Keywords 20%, Education 10%, Quality 10%).
- 2-stage Gemini pipeline (Stage 1: Extract & Compare, Stage 2: Recommendation Generation).
- Structured results dashboard (Overview, Skills, Keywords, Experience, Recommendations).
- Expandable "Why this score?" evidence citations on all sub-scores.
- Historical analysis tracking (list, sort, detail view, delete).
- Demo/Mock mode for local zero-cost testing.

### Out-of-Scope (Deferred to Phase 2/3)
- Automated job board scraping / LinkedIn auto-apply.
- Recruiter portal & batch candidate screening.
- Cover letter or full AI resume generator.
- Payment & subscription integrations.
- Multi-agent orchestration frameworks.

---

## 4. Key Performance & Quality Metrics
- **Analysis Latency:** < 20 seconds for standard resume + job description analysis.
- **Scoring Consistency:** Deterministic mathematical derivation for countable metrics.
- **Accuracy:** Zero hallucinated user experience; truthful recommendation policy.
- **Accessibility:** WCAG AA 4.5:1 contrast, keyboard navigable, responsive down to 360px mobile viewports.
