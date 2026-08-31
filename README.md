# ResumeIQ — AI-Powered Resume Analysis SaaS

> **Know exactly how well your resume matches the job.**
> A production-grade full-stack SaaS application built with **React**, **Tailwind CSS v4**, **FastAPI**, **Supabase**, and **Google Gemini AI**.

---

## 🌟 Overview

ResumeIQ gives job seekers clear, transparent, and actionable feedback by analyzing their PDF resumes against specific job descriptions. Instead of relying on opaque AI scores, ResumeIQ uses a **hybrid scoring engine** combining deterministic metric calculations with semantic LLM evaluations.

### Key Capabilities
- **Hybrid Match Scoring:** 
  - **Skills Match (40%):** Deterministic evaluation based on matched, partial, and missing requirements.
  - **Keywords Match (15%):** Deterministic tracking across technical, soft skills, and domain keywords.
  - **Experience Relevance (25%):** AI-evaluated with concrete citation evidence.
  - **Education Alignment (10%):** AI-evaluated requirement satisfaction.
  - **Resume Quality (10%):** Action-oriented bullet formatting and impact metrics.
- **Granular Evidence ("Why this score?"):** Every score item exposes exact justification citations.
- **Deep Skill Gap Analysis:** Categorized into Strong Matches, Partial Matches (with explanation), and Missing Skills.
- **Actionable Recommendations:** Prioritized items (High / Medium / Low) with evidence citations and truthful rewrite guidance.
- **Persistent History & Analytics:** Track improvement over time across different job targets.
- **Mock/Demo Mode:** Full zero-cost offline exploration supported out-of-the-box.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 (using `@tailwindcss/vite` CSS-first architecture)
- **Design System:** TECHNICAL-MINIMAL (Outfit Display, Geist Body, Geist Mono Data)
- **Icons:** Phosphor Icons (`@phosphor-icons/react`)
- **Routing & Networking:** React Router v7, Axios
- **State & Auth:** Supabase Auth Client, React Context

### Backend
- **Framework:** FastAPI (Python 3.13+)
- **Validation & Serialization:** Pydantic v2
- **Document Processing:** PyPDF2
- **AI Intelligence:** Google Gemini API (`gemini-2.0-flash`) via `google-genai` SDK
- **Database & Storage:** Supabase PostgreSQL + Supabase Private Storage

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v20+) & npm
- Python (3.11+)
- Supabase account & Google Gemini API key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY

uvicorn app.main:app --reload --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your VITE_API_URL and VITE_SUPABASE keys

npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📂 Project Structure
```
ResumeAI/
├── frontend/             # React 19 + Tailwind v4 Client
│   ├── src/
│   │   ├── components/   # Modular, design-system compliant UI components
│   │   ├── context/      # Authentication & global session state
│   │   ├── pages/        # Dashboard, Analysis, Results, History, Auth
│   │   ├── services/     # Axios client & Supabase integration
│   │   └── index.css     # CSS-first Tailwind v4 tokens
├── backend/              # FastAPI Application
│   ├── app/
│   │   ├── api/          # Route handlers (auth, resumes, analyses, health)
│   │   ├── db/           # Supabase client wrapper
│   │   ├── schemas/      # Pydantic request/response & error contracts
│   │   ├── services/     # Business logic (PDF parser, scoring, LLM, mock)
│   │   └── utils/        # Security, JWT auth, validation
│   └── tests/            # Automated test suite (pytest)
├── AGENTS.md             # Design Contract & Engineering Rules
├── ARCHITECTURE.md       # High-level architecture & data flows
├── DATABASE.md           # Schema, RLS policies, storage config
└── API_SPEC.md           # REST API endpoints & error formats
```
