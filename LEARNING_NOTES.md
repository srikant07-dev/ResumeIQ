# ResumeIQ — Technical Learning Notes & Concepts

## 1. Pydantic v2 & Data Validation
- **What it is:** Python's most popular data validation and parsing library based on Python type hints.
- **Why we use it:** To enforce type safety, bounds checks (e.g., `Field(ge=0, le=100)`), and parse LLM JSON responses reliably.
- **Key Pattern:**
  ```python
  from pydantic import BaseModel, Field
  from typing import Literal

  class ScoreEvidence(BaseModel):
      score: int = Field(ge=0, le=100)
      source: Literal["deterministic", "ai"]
      evidence: str = Field(min_length=5)
  ```

---

## 2. FastAPI Dependency Injection
- **What it is:** A declarative system for injecting shared dependencies (database sessions, authentication checks, parameter parsing).
- **Why we use it:** To enforce token validation (`get_current_user`) uniformly across protected endpoints.
- **Key Pattern:**
  ```python
  @router.get("/api/analyses")
  async def list_analyses(current_user_id: str = Depends(get_current_user)):
      # current_user_id is guaranteed valid and authenticated
      return await analysis_service.list_user_analyses(current_user_id)
  ```

---

## 3. Tailwind CSS v4 CSS-First Architecture
- **What it is:** The modern release of Tailwind CSS which eliminates `tailwind.config.js` and `postcss.config.js` in favor of native CSS `@theme` directives and Vite plugin integration (`@tailwindcss/vite`).
- **Why we use it:** Eliminates configuration drift and integrates smoothly with CSS variables.
- **Key Pattern:**
  ```css
  @import "tailwindcss";

  @theme {
    --font-display: "Outfit", sans-serif;
    --font-body: "Geist", sans-serif;
    --font-mono: "Geist Mono", monospace;
    --color-accent: #10b981;
  }
  ```

---

## 4. Row Level Security (RLS) in PostgreSQL
- **What it is:** A PostgreSQL security feature that allows database engines to filter rows visible or modifiable per user role/token.
- **Why we use it:** Ensures zero data leakage between user tenants, even in complex multi-user deployments.
- **Key Pattern:**
  ```sql
  CREATE POLICY "analyses_select_own" ON public.analyses
    FOR SELECT USING (auth.uid() = user_id);
  ```

---

## 5. Structured Outputs with LLMs
- **What it is:** Constraining LLM responses to strict, parseable JSON representations rather than freeform text.
- **Why we use it:** Ensures predictable application state and eliminates UI rendering errors.
- **Key Pattern:** Instructing the model with JSON schemas and validating the resulting JSON directly with Pydantic.
