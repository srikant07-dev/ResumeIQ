# ResumeIQ — Interview Preparation Guide

## 1. Project Elevator Pitch (30-Second Version)
> "ResumeIQ is a full-stack SaaS application that evaluates resumes against specific job descriptions using a hybrid scoring pipeline. Built with React, Tailwind CSS v4, FastAPI, and Supabase PostgreSQL, it replaces black-box AI scores with deterministic skill and keyword metrics alongside evidence-backed LLM evaluations. The system enforces strict user isolation through verified JWTs and Row Level Security, with sub-20 second analysis speeds and zero hallucinated claims."

---

## 2. Common Architectural Questions & Strong Answers

### Q1: Why did you separate the frontend and backend instead of using an all-in-one framework like Next.js?
**Answer:** "Separating React and FastAPI provides clear domain boundaries and prevents vendor lock-in. FastAPI is purpose-built for high-performance Python asynchronous APIs, allowing direct integration with native Python data-science and AI libraries (PyPDF2, Google GenAI SDK, Pydantic). This separation also ensures backend API keys (Gemini, Supabase service-role) are physically isolated on the server and cannot leak into client bundles."

### Q2: Why did you choose a Hybrid Scoring model instead of letting the LLM compute the final score?
**Answer:** "LLMs are probabilistic and notoriously inconsistent when scoring numerical metrics—a resume evaluated twice might score 65% and 85% randomly. In ResumeIQ:
1. **Deterministic Layer:** Calculates skill match percentage `(matched + 0.5*partial)/total` and keyword presence deterministically.
2. **AI Layer:** Focuses on qualitative semantic tasks (experience relevance, education parity, resume bullet impact) with strict 0–100 Pydantic bounds and mandatory textual evidence citations.
3. **Synthesis:** Combines these via configurable mathematical weights (40% skills, 25% experience, 15% keywords, 10% education, 10% quality). This ensures reproducible, defensible scoring."

### Q3: How do you handle security and multi-tenancy?
**Answer:** "We employ defense-in-depth:
1. **Client-Side:** Supabase Auth manages sessions and JWT tokens.
2. **API Layer:** FastAPI dependency verifies the JWT signature and extracts the `user_id`. Every single database query strictly filters by `WHERE user_id = :authenticated_user_id`.
3. **Database Layer:** PostgreSQL Row Level Security (RLS) policies and Storage bucket policies restrict access so users can only CRUD their own records even if an edge case arose."

### Q4: Why 2 LLM stages instead of 4 sequential prompts or 1 monolithic prompt?
**Answer:** "A 4-stage pipeline introduces high latency and 4 separate failure points. A single monolithic prompt causes context degradation and lower JSON adherence. A 2-stage architecture is the sweet spot:
- **Stage 1 (Extract & Compare):** The model analyzes both documents simultaneously in context.
- **Deterministic Calculation:** Exact math executes instantly in Python without AI delay.
- **Stage 2 (Recommendations):** The model generates tailored actions conditioned on the exact score breakdown and gap analysis."

### Q5: How do you handle AI failures or malformed outputs?
**Answer:** "We implement strict Pydantic schema validation for all LLM responses. If the model returns invalid JSON or fails range checks, the backend executes an automatic single retry with format clarification. If it still fails, it gracefully transitions the analysis record to `status = 'failed'` with an informative error message, ensuring user experience is preserved."
