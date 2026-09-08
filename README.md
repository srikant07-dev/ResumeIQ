# ResumeIQ — AI-Powered Resume Match & Optimization Engine

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_Auth-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285f4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-212%2F212_Passed-10b981)](https://github.com/srikant07-dev/ResumeIQ)

> **Know exactly how well your resume matches the job.**  
> A production-grade, engineer-crafted SaaS application delivering transparent, evidence-grounded resume diagnostics, gap analysis, interactive optimization, and real-time market intelligence.

---

## 🌟 Core Features

### 1. Hybrid Scoring Engine (Deterministic + Grounded AI)
Rather than relying on opaque, hallucination-prone single-number AI scores, ResumeIQ calculates an explainable composite match:
- **Skills Match (35% - Deterministic):** Direct token and semantic intersection across required vs. demonstrated competencies.
- **Experience Relevance (25% - Grounded AI):** Evaluates depth, seniority, and quantifiable impact with required verbatim citations.
- **Keywords Match (20% - Deterministic):** Exact tracking categorized across technical proficiencies, soft skills, and industry domain terminology.
- **Education Alignment (10% - Grounded AI):** Checks degree, certifications, and academic prerequisites.
- **Resume Quality & Formatting (10% - Grounded AI):** Analyzes bullet strength, metric-driven language, and ATS readability.

### 2. Market Intelligence & Competitive Research Engine
Interactive market telemetry and company research built directly into the analysis dashboard:
- **Dual-Engine Research Pipeline:**
  - **⚡ Fast Analysis (15–20s):** Multi-tier search cascade (**Tavily API** → **DuckDuckGo** → **Grounded Gemini 3.6 Synthesis**) to extract company tech stack, culture, consensus hiring requirements, and competitive positioning without rate limit bottlenecks.
  - **🔬 Deep Dive Research (1–3m):** Autonomous multi-step research agent running on the **Gemini Interactions API** (`gemini-deep-research-pro`) with dedicated API key quota isolation, generating 10,000+ words of evidence-backed company hiring intelligence.
- **Company Profile:** Live telemetry on domain, verified tech stack, peer competitors, engineering culture, and hiring bar summaries.
- **Consensus vs. Edge Skills:** Identifies table-stakes skills (appearing in 70%+ of target JDs) vs. differentiator skills that command senior compensation.
- **Pointwise Competitive Strategy:** Tailored, tactical action items ranked by priority (`CRITICAL`, `HIGH`, `MEDIUM`) and effort (`QUICK_WIN`, `SHORT_TERM`, `LONG_TERM`).

### 3. "What-If" Skill Simulator & ROI Predictor
Interactive sandbox allowing candidates to toggle missing and partial skills in real time:
- Preview instant score increases before editing their actual resume.
- **1-Click "⚡ Auto-Solve for 80% Match"** to highlight the highest-leverage skills to acquire or emphasize.

### 4. Cognitive Contrast: Side-by-Side Bullet Diffs
- **Before:** Identifies passive, unquantified bullets that fail ATS filters.
- **After:** Provides an optimized, truthful revision incorporating quantifiable achievements and keywords.
- **Evidence Drawer:** Cites verbatim requirements from the target job description explaining *why* the change matters.
- **1-Click Copy:** Instant clipboard copy with visual feedback.

### 5. Multimodal Gemini OCR Fallback
- Dual-tier PDF parser: Fast native text extraction via `PyPDF2` with automatic, seamless fallback to **Google Gemini Vision OCR** for scanned, flattened, or image-heavy resumes.

### 6. Resume Revision & Score Delta Diffing
- Upload an updated version of a resume against an existing job target.
- Automatically calculates overall score delta, individual category shifts, newly matched skills, and resolved gaps.

### 7. Power-User Command Palette (`⌘K` / `Ctrl+K`)
- Keyboard-first command palette for instant navigation (`/dashboard`, `/new`, `/history`, `/settings`), quick actions (`⌘↵` submission), and system status inspection.

### 8. Always-On Mono Status Bar
- Developer-grade status bar in `Geist Mono` showing live system indicators, engine labels, active analysis state, and route context.

### 9. Full Zero-Cost Demo Mode
- Run and explore the complete application offline or locally without configuring Supabase or Gemini API keys (`DEMO_MODE=true`).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Phosphor Icons (`@phosphor-icons/react`), React Router v7, Axios |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2, `google-genai` SDK, PyPDF2, Uvicorn |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS), Supabase Private Storage (`resumes` bucket) |
| **AI Engine** | Google Gemini 3.6 Flash (`gemini-3.6-flash`) with structured JSON schema enforcement |
| **Deep Research** | Gemini Interactions API (`gemini-deep-research-pro-preview-12-2025`) |
| **Search Providers** | Tavily Search API (Tier 1) + DuckDuckGo Search (Tier 2 Fallback) |
| **Testing** | Vitest (Frontend: 19 suites, 74 tests), Pytest (Backend: 106 tests), Adversarial Harness (32 tests) |

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

# Google Gemini AI Keys
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.6-flash
GEMINI_DEEP_RESEARCH_API_KEY=your-deep-research-api-key  # Optional: dedicated key for Deep Dive mode

# Web Search Provider (Optional — enhances Fast Market Intel)
TAVILY_API_KEY=your-tavily-api-key  # Free tier: 1,000 calls/month
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

ResumeIQ features comprehensive automated test coverage across boundary cases, adversarial injections, scoring fidelity, and workflow interactions:

### Backend Pytest Suite (106 Tests)
```bash
cd backend
python -m pytest tests/ -v
```
*Result:* **106 passed (100%)**

### Adversarial Security & Ingestion Harness (32 Tests)
```bash
cd backend
python tests/run_adversarial_harness.py
```
*Result:* **32 passed (100%)**

### Frontend Vitest Suite (74 Tests)
```bash
cd frontend
npm test
```
*Result:* **19 test suites passed, 74 tests passed (100%)**

### Production Bundle Build Verification
```bash
cd frontend
npm run build
```
*Result:* Clean compilation with 0 warnings or errors.

---

## 📂 Architecture & Directory Layout

```
ResumeAI/
├── frontend/                     # React 19 + Tailwind CSS v4 Client
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── analysis/         # BulletDiffCard, ScoreCard, SkillSimulator, MarketIntelligenceTab
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
│   │   ├── api/                  # Endpoints (/analyses, /resumes, /auth, /health, /market-intelligence)
│   │   ├── db/                   # Supabase client singleton with fail-fast initialization
│   │   ├── schemas/              # Pydantic v2 schemas (Analysis, Resume, User, MarketIntelligence)
│   │   ├── services/             # Orchestrators: analysis, llm, pdf_parser, resume, scoring, search_provider, market_intelligence
│   │   └── utils/                # JWT verification, security, file validators
│   └── tests/                    # Pytest test suites (adversarial, OCR, re-evaluation, scoring, search)
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
3. **Fail-Fast Credential Verification:** Backend validates Supabase URL and service role keys on startup, halting with descriptive errors rather than silently degrading into 500 runtime faults.
4. **Magic-Byte PDF Validation:** Uploads are verified for `%PDF-` binary magic headers, preventing spoofed extensions or malicious script payloads.
5. **Production Error Sanitization:** Production mode strips internal stack traces, model names, and database connection strings from client-facing HTTP 500/502 responses.
6. **Private Storage Isolation:** PDF files are stored in private Supabase Storage buckets under user-scoped paths (`{user_id}/{file_id}.pdf`).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
