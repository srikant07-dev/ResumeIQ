# ResumeIQ — Architecture & System Design

## 1. System Overview

ResumeIQ employs a clean separated architecture:

```
[ React 19 Frontend ] (Vite + Tailwind v4 + Phosphor Icons)
        │
        ├── Supabase Auth Client (Signup, Login, Token Management)
        │
        └── Axios REST Client (with Bearer Token)
                │
                ▼
        [ FastAPI Backend ] (Python 3.13)
        ├── Security & JWT Verification (Extracts user_id from token)
        ├── Validators (File integrity, size <= 5MB, format checks)
        ├── PDF Parser (PyPDF2 Text Extraction)
        ├── 2-Stage Gemini Pipeline (Structured JSON Generation)
        ├── Hybrid Scoring Engine (Deterministic Math + Validated AI Signals)
        └── Supabase DB & Storage Wrapper (User-isolated queries)
                │
         ┌──────┴──────────────────────┐
         ▼                             ▼
[ Google Gemini API ]         [ Supabase Cloud ]
 (gemini-2.0-flash)            ├── PostgreSQL (RLS + Constraints)
                               ├── Auth System (User identity)
                               └── Storage (Private resumes bucket)
```

---

## 2. 2-Stage AI Pipeline

Rather than issuing 4 slow sequential LLM calls or 1 fragile mega-call, ResumeIQ uses a 2-stage pipeline:

```
                  Resume Text + Job Description
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │  STAGE 1: Extract, Normalize & Compare      │
         │  Prompt: Parse both texts into structured    │
         │  requirements, match skills, extract keywords│
         │  and assess qualitative alignment.           │
         └──────────────────────────────────────────────┘
                                │
                                ▼ (Structured JSON)
                     Pydantic Schema Validation
                                │
                                ▼
                    Deterministic Math Layer
            (Skills Match Score + Keywords Match Score)
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │  STAGE 2: Contextual Recommendations        │
         │  Prompt: Given the computed scores & gaps,   │
         │  generate prioritized, evidence-backed       │
         │  recommendations without fabricating claims. │
         └──────────────────────────────────────────────┘
                                │
                                ▼ (Final JSON Output)
                  Database Save & Frontend Delivery
```

---

## 3. Hybrid Scoring Engine

Final Match Score:
$$\text{Overall Score} = 0.35 \times \text{Skills} + 0.25 \times \text{Experience} + 0.20 \times \text{Keywords} + 0.10 \times \text{Education} + 0.10 \times \text{Quality}$$

- **Skills Score (Deterministic):**
  $$\text{Skills Score} = \min\left(100, \text{round}\left(\frac{\text{Strong Matches} + 0.5 \times \text{Partial Matches}}{\max(1, \text{Total Required Skills})} \times 100\right)\right)$$
- **Keywords Score (Deterministic):**
  $$\text{Keywords Score} = \min\left(100, \text{round}\left(\frac{\text{Present Keywords}}{\max(1, \text{Total Identified Keywords})} \times 100\right)\right)$$
- **Experience, Education, Quality (AI-Derived Signals):**
  - Evaluated on a 0–100 scale.
  - Strict Pydantic range validation (`ge=0, le=100`).
  - Required non-empty `evidence` citation strings.

---

## 4. Security & Data Protection Model

- **Frontend Isolation:** Client handles tokens solely through Supabase Auth. No backend API keys or service role secrets are ever compiled into the frontend bundle.
- **Backend Authorization:** While the backend connects via `SUPABASE_SERVICE_ROLE_KEY` to execute administrative tasks, **every single database query explicitly filters by `user_id == current_user.id`**.
- **Defense in Depth:** PostgreSQL Row Level Security (RLS) is enabled on all tables and storage objects as an independent perimeter.
- **File Validation:** Files are verified at the byte header level, size-checked (<= 5MB), and checked for extraction readability.
