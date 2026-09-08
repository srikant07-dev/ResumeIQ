# ResumeIQ — AI-Powered Resume Match & Optimization Engine

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_Auth-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285f4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-150%2F150_Passed-10b981)](https://github.com/srikant07-dev/ResumeIQ)

> **Know exactly how well your resume matches the job.**  
> A production-grade, engineer-crafted SaaS application delivering transparent, evidence-grounded resume diagnostics, gap analysis, and interactive optimization.

---

## 🌟 Core Features

### 1. Hybrid Scoring Engine (Deterministic + Grounded AI)
Rather than relying on opaque, hallucination-prone single-number AI scores, ResumeIQ calculates an explainable composite match:
- **Skills Match (35% - Deterministic):** Direct token and semantic intersection across required vs. demonstrated competencies.
- **Experience Relevance (25% - Grounded AI):** Evaluates depth, seniority, and quantifiable impact with required verbatim citations.
- **Keywords Match (20% - Deterministic):** Exact tracking categorized across technical proficiencies, soft skills, and industry domain terminology.
- **Education Alignment (10% - Grounded AI):** Checks degree, certifications, and academic prerequisites.
- **Resume Quality & Formatting (10% - Grounded AI):** Analyzes bullet strength, metric-driven language, and ATS readability.

### 2. "What-If" Skill Simulator & ROI Predictor
Interactive sandbox allowing candidates to toggle missing and partial skills in real time:
- Preview instant score increases before editing their actual resume.
- **1-Click "⚡ Auto-Solve for 80% Match"** to highlight the highest-leverage skills to acquire or emphasize.

### 3. Cognitive Contrast: Side-by-Side Bullet Diffs
- **Before:** Identifies passive, unquantified bullets that fail ATS filters.
- **After:** Provides an optimized, truthful revision incorporating quantifiable achievements and keywords.
- **Evidence Drawer:** Cites verbatim requirements from the target job description explaining *why* the change matters.
- **1-Click Copy:** Instant clipboard copy with visual feedback.

### 4. Multimodal Gemini OCR Fallback
- Dual-tier PDF parser: Fast native text extraction via `PyPDF2` with automatic, seamless fallback to **Google Gemini Vision OCR** for scanned, flattened, or image-heavy resumes.

### 5. Resume Revision & Score Delta Diffing
- Upload an updated version of a resume against an existing job target.
- Automatically calculates overall score delta, individual category shifts, newly matched skills, and resolved gaps.

### 6. Power-User Command Palette (`⌘K` / `Ctrl+K`)
- Keyboard-first command palette for instant navigation (`/dashboard`, `/new`, `/history`, `/settings`), quick actions (`⌘↵` submission), and system status inspection.

### 7. Always-On Mono Status Bar
- Developer-grade status bar in `Geist Mono` showing live system indicators, analysis state, and route context.

### 8. Full Zero-Cost Demo Mode
- Run and explore the complete application offline or locally without configuring Supabase or Gemini API keys (`DEMO_MODE=true`).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Phosphor Icons (`@phosphor-icons/react`), React Router v7, Axios |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2, `google-genai` SDK, PyPDF2, Uvicorn |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS), Supabase Private Storage (`resumes` bucket) |
| **AI Engine** | Google Gemini 3.6 Flash (`gemini-3.6-flash`) with structured output enforcement |
| **Testing** | Vitest (Frontend: 18 suites, 65 tests), Pytest (Backend: 85 tests) |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js:** v20+ and `npm`
- **Python:** 3.11 or 3.13+
- *(Optional for Live Mode)*: Supabase account & Google Gemini API key

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env`:
```ini
PORT=8000
FRONTEND_URL=http://localhost:5173
DEMO_MODE=false # Set to true for offline demo mode

# Supabase Credentials (Required if DEMO_MODE=false)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI Key (Required if DEMO_MODE=false)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.6-flash
```

Start the FastAPI backend:
```bash
uvicorn app.main:app --reload --port 8000
```
- API Root: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `frontend/.env`:
```ini
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

ResumeIQ features a test suite covering boundary cases, adversarial inputs, scoring fidelity, and workflows:

### Backend Pytest Suite (85 Tests)
```bash
cd backend
python -m pytest tests/ -v
```
*Result:* **85 passed (100%)**

### Frontend Vitest Suite (65 Tests)
```bash
cd frontend
npm test
```
*Result:* **18 test files passed, 65 tests passed (100%)**

### Production Build Verification
```bash
cd frontend
npm run build
```
*Result:* Clean compilation with 0 errors.

---

## 📂 Architecture & Directory Layout

```
ResumeAI/
├── frontend/                     # React 19 + Tailwind CSS v4 Client
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── analysis/         # BulletDiffCard, ScoreCard, SkillSimulator, ScoreDeltaModal
│   │   │   ├── common/           # CommandMenu, LegalModal, EmptyState
│   │   │   ├── landing/          # HeroPreviewCard (interactive diagnostic)
│   │   │   ├── layout/           # AppLayout, StatusBar
│   │   │   └── upload/           # FileUpload (drag-drop with validation)
│   │   ├── context/              # AuthContext (Supabase session & demo mode)
│   │   ├── pages/                # Landing, Dashboard, NewAnalysis, AnalysisResult, History, Settings
│   │   ├── services/             # api.js (Axios with interceptors), supabaseClient.js
│   │   └── index.css             # Tailwind v4 tokens & tactile micro-interactions
│   └── src/test/                 # Vitest component & adversarial workflow test suites
│
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/                  # Endpoints (/analyses, /resumes, /auth, /health)
│   │   ├── db/                   # Supabase client singleton
│   │   ├── schemas/              # Pydantic v2 schemas (Analysis, Resume, User, Common)
│   │   ├── services/             # Orchestrators: analysis, llm, pdf_parser, resume, scoring
│   │   └── utils/                # JWT verification, security, file validators
│   └── tests/                    # Pytest test suites (adversarial, OCR, re-evaluation, scoring)
│
├── AGENTS.md                     # Design Contract & Engineering Rules
├── ARCHITECTURE.md               # High-Level Architecture & Data Flows
├── DATABASE.md                   # Supabase Schema, Tables & RLS Policies
├── API_SPEC.md                   # REST API Endpoints Specification
└── PRD.md                        # Product Requirements Document
```

---

## 🛡️ Security Model

1. **Supabase Row-Level Security (RLS):** Defense-in-depth ensures users can only access their own resumes and analysis records.
2. **Explicit User ID Filtering:** Every backend database query explicitly enforces `.eq("user_id", authenticated_user_id)`.
3. **Magic-Byte PDF Validation:** Uploads are verified for `%PDF-` binary magic headers, preventing spoofed extensions.
4. **Error Sanitization:** Production mode strips internal stack traces and database details from client-facing 500 error responses.
5. **Private Storage Isolation:** PDF files are stored in private Supabase Storage buckets under user-scoped paths (`{user_id}/{file_id}.pdf`).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
