# ResumeIQ — Design Contract & Engineering Rules

> This file acts as the persistent single source of truth for design, styling, and engineering quality across all agents and IDE sessions.

---

## 1. Aesthetic Direction: TECHNICAL-MINIMAL (Linear / Vercel Class)

- **Audience:** Job seekers, college students, and fresh graduates looking for precise, high-trust resume optimization.
- **Tone:** Professional, precise, restrained, data-focused, engineer-grade craft.
- **Design Dials:**
  - `DESIGN_VARIANCE: 5` (mostly symmetric with structured asymmetric data accents)
  - `MOTION_INTENSITY: 5` (native CSS view-timeline reveals, 150-200ms cubic-bezier transitions, 0 jank)
  - `VISUAL_DENSITY: 6` (compact multi-column layouts, generous 8pt padding, no empty spaces)
- **Signature Element:** **Always-on mono status bar** in `Geist Mono` displaying live contextual data, active analysis state, or system mode.
- **Theme:** Dark theme by default (with seamless light support via CSS variables).

---

## 2. Typography — 2+1 System

| Role | Font Family | Weights | Usage |
|---|---|---|---|
| **Display** | **Outfit** | 500, 600 | Page titles, major headers, hero headline |
| **Body** | **Geist** | 400, 500 | UI copy, labels, descriptions, inputs |
| **Mono** | **Geist Mono** | 400, 500 | Scores, numbers, statistics, status bar, code, tags |

### Typography Rules
- `font-variant-numeric: tabular-nums` on all score numbers, percentages, and counters.
- `-0.02em` letter spacing on display text > 32px.
- `0.05em` to `0.15em` tracking on mono tags and uppercase labels.
- `text-wrap: balance` on headers; `text-wrap: pretty` on paragraphs.
- **BANNED FONTS:** Inter (as sole font), Roboto, Arial, Open Sans, Comic Sans.
- **NO ITALICS:** Use size, color contrast, or weight for hierarchy.
- **NO WEIGHTS > 600:** Avoid 800/900/black fonts.

---

## 3. Color Tokens — Tinted Zinc Palette

All styles must use CSS variables / `@theme` tokens:

```css
@theme {
  --color-canvas: #09090b;        /* zinc-950 */
  --color-surface: #18181b;       /* zinc-900 */
  --color-surface-raised: #27272a;/* zinc-800 */
  --color-border: rgba(255, 255, 255, 0.08);

  --color-ink-primary: #fafafa;   /* zinc-50 */
  --color-ink-muted: #a1a1aa;     /* zinc-400 */

  --color-accent: #10b981;        /* emerald-500 */
  --color-accent-hover: #059669;  /* emerald-600 */
  --color-accent-muted: rgba(16, 185, 129, 0.15);

  --color-score-strong: #10b981;  /* emerald >= 75 */
  --color-score-partial: #f59e0b; /* amber 50-74 */
  --color-score-weak: #ef4444;    /* rose < 50 */
  --color-error: #ef4444;
}
```

### Color Rules
- **No pure #000000.** Use `#09090b`.
- **No purple-to-blue AI gradients.**
- **No background gradients.** All backgrounds are flat surfaces with clean 1px borders.
- **Text gradient allowed only on hero heading** (`#FFFFFF` to `#71717a`).

---

## 4. The 25 AI-Tells (DO NOT BUILD)

1. ❌ Purple-to-blue hero mesh gradient
2. ❌ 3 identical equal-height cards side-by-side
3. ❌ Icon tile centered above a heading
4. ❌ Blurry glassmorphism everywhere
5. ❌ Default browser Inter font exclusively
6. ❌ Saturated `#7C3AED` or `#3B82F6` accents
7. ❌ Continuous bouncing / infinite pulsing micro-animations
8. ❌ Nested card-inside-card syndrome
9. ❌ Em-dash overuse in copy
10. ❌ Cliche AI phrases ("Elevate", "Seamless", "Unleash", "Game-changing")
11. ❌ Fake simulated progress timers
12. ❌ Border-left-2 side-tabs
13. ❌ Custom laggy cursors
14. ❌ Floating badge pill hovering over hero
15. ❌ Empty grid cells with no content
16. ❌ Serif body fonts on data dashboards
17. ❌ Dark blurry colored card glow shadows
18. ❌ Random unlabelled icons as decoration
19. ❌ Bento grids for simple text lists
20. ❌ Fabricated user counts or fake urgency
21. ❌ Buttons with zero hover/active/focus feedback
22. ❌ Raw hex codes scattered throughout components
23. ❌ Invisible focus rings on tab navigation
24. ❌ Missing empty, loading, or error states
25. ❌ "Oops! Something went wrong" vague error alerts

---

## 5. Engineering & Security Architecture

1. **Frontend:** React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`) + Phosphor Icons + Axios + React Router.
2. **Backend:** FastAPI + Pydantic + Supabase Python SDK + PyPDF2 + Google Gemini API.
3. **Database:** Supabase PostgreSQL + Row Level Security (RLS) + Private Storage (`resumes` bucket).
4. **Backend Security Model:** Backend uses Supabase service-role key to query data, but **MUST explicitly filter every query by the authenticated `user_id`** extracted from verified JWTs. RLS is maintained in PostgreSQL as defense-in-depth.
5. **AI Pipeline:** Minimized 2-stage Gemini pipeline (Stage 1: Extract & Compare, Stage 2: Recommendations with scores context).
6. **Scoring Model:** Hybrid scoring — Skills and Keywords are deterministic; Experience, Education, and Quality are validated AI signals with required evidence strings.
7. **Mock / Demo Mode:** Supported via `DEMO_MODE=true` for local development or offline presentation without API costs.
