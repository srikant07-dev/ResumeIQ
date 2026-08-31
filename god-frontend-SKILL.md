---
name: god-frontend
description: "The greatest frontend & UI/UX skill. Use when the user wants a website frontend, landing page, marketing site, portfolio, redesign, or product UI — from a DESIGN.md (VoltAgent format), a screenshot/reference, or just an idea. With no DESIGN.md it researches 3-5 real competitors first, finds their shared cliché, and designs to visibly stand apart — then locks one aesthetic direction + one signature element, applies a conversion-psychology layer (real trust signals only, never fabricated), builds with proven code patterns, verifies by screenshot at 3 viewports, and scores honestly against a 13-dimension rubric before declaring done. Emits AGENTS.md so the rules survive a switch to Cursor/Antigravity/Codex. TRIGGER on: build frontend, design a website, make a landing page, redesign my site, build the UI for, make it look premium, /god-frontend, or any brand/product idea with design intent."
---

# god-frontend

> Award-tier websites that feel different every time. Built with proven code, verified by eye at three viewports, scored honestly against a rubric, shipped only at 8+.

Follow the FLOW in order. Everything needed is in this file — sections appear in execution order, top to bottom, no jumping.

---

## MODES

**MODE A — DESIGN.md provided** (pixel-accurate): parse all 9 sections (see PARSER), use exact values, skip competitive research unless asked.
**MODE B — Idea only**: run STEP 0 first. Never pick an aesthetic from vibes.
**MODE C — Reference/screenshot provided**: open the reference with real browser tooling, extract its system (palette, type, spacing, signature), then decide with the user: faithful match, or "inspired by, better than."
**MODE D — Repair** ("make my existing site look premium"): audit the current build against CRAFT RULES + AI-TELLS first, list violations, fix worst-first. Don't rebuild what already works.

**Execution contexts**: In an agentic coding tool (Claude Code, v0, Cursor agent), build directly — execute and verify each step yourself. In plain chat, output a stepwise copy-paste prompt plan (see CHAT OUTPUT).

---

## THE FLOW

```
0. NO DESIGN.md? → COMPETITIVE INTELLIGENCE (3-5 real competitors, find the shared cliché)
1. READ brief → extract: page kind, brand, audience, price tier, the ONE emotion to win
2. PARSE DESIGN.md if present (9 sections, exact values)
3. PICK aesthetic direction (12 options) → Anti-Repeat + Differentiation checks
4. SET dials V/M/D · PICK stack · PICK exactly ONE signature element
5. PICK section architecture by product type + conversion tactics
6. DECLARE the Design Contract (one screen, before any code)
7. BUILD hero → ═ CHECKPOINT: verify by screenshot ═ → continue
8. BUILD remaining sections (each: build → verify → fix)
9. FULL verification at 3 viewports → SCORE rubric (8+/10 on all 13 dimensions)
10. SHIP (+ AGENTS.md for portability)
```

Steps 7-9 are what separate this from every other skill. Do not skip them.

---

## STEP 0 — COMPETITIVE INTELLIGENCE

The goal isn't "beautiful" — it's making the visitor feel this brand operates on a different level than everything else in its category. That requires knowing what the category actually looks like.

1. **Extract from the brief**: category, buyer, price tier (budget/mid/premium/luxury), the ONE emotion that wins the sale (trust? desire? status? relief?).
2. **Find 3-5 REAL competitors** via web search — direct competitors plus 1-2 aspirational/adjacent brands (a new watch brand should study how Patek *talks*, not just other startups). Queries: `"[category] brands"`, `"best [category] 2026"`, `"[competitor] alternative"`. No search tool available? Ask the user for 2-3 competitor URLs — the one standing exception to the clarifying-question limit.
3. **Visit each homepage** (fetch/browser tool). Log per site: palette, type style, layout pattern, signature move if any, how loud the selling is.
4. **Write the audit** (shown to the user before proceeding):

```
COMPETITORS: [names]
SHARED CLICHÉ: [what 2+ of them all do — e.g. "centered hero, soft gradient, 3 feature cards"]
WHITE SPACE: [an angle/feeling nobody in the category owns]
PRICE-TIER SIGNAL: [does the category look cheap/safe/premium — and must this site look MORE premium than its price to justify it?]
```

This audit feeds the Differentiation Check (aesthetic pick) and the Conversion Layer (which trust tactics are saturated vs. actually missing). Competitors set the floor; clear it by a wide margin.

---

## PARSER — DESIGN.md (9 sections)

1. **Visual Theme** → brand essence → hero copy + mood
2. **Color** → canvas/surface/ink-primary/ink-mute/accent/border (exact hex/oklch)
3. **Typography** → display/body/mono (names, weights, tracking)
4. **Spacing/Layout** → scale, section padding, max-widths, columns
5. **Components** → button grammar, cards, nav, forms, footer
6. **Visual Motifs** → recognizable signatures (tiles, blocking, gradients)
7. **Interactions/Motion** → hover, scroll, easing, named effects
8. **Design Rationale** → the *why* (most valuable — tells you when to deviate)
9. **Responsive** → breakpoints + per-breakpoint changes

Fallbacks when a value is missing (NEVER leave one blank): border `rgba(255,255,255,0.08)` dark / `rgba(0,0,0,0.08)` light · mono JetBrains Mono · spacing `[4,8,12,16,24,32,48,64,96,128]` · ease `cubic-bezier(0.16,1,0.3,1)` · breakpoints `640/1024`.
DESIGN.md ALWAYS overrides inferred values on conflict.
Raw URL pattern: `https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<slug>/DESIGN.md`

---

## AESTHETIC ENGINE — 12 Directions

| # | Direction | Palette | Type | Feel | Native mode |
|---|---|---|---|---|---|
| 1 | **EDITORIAL-LUXURY** | off-black + cream + 1 metallic | serif display + grotesque | Patek, Vogue | dark or cream |
| 2 | **BRUTALIST** | off-white/black + 1 hard accent | mono/grotesque CAPS | raw, Swiss | either, high contrast |
| 3 | **CINEMATIC** | deep black + 1 saturated hit | tight condensed display | IMAX, Nolan | dark, always |
| 4 | **TECHNICAL-MINIMAL** | cool zinc/slate + 1 accent | Geist/Inter, weight contrast | Linear, Vercel | dark default |
| 5 | **ORGANIC** | warm cream, ochre, terracotta | editorial serif + rounded | paper, indie premium | light, warm |
| 6 | **FUTURIST** | navy/charcoal + iridescent glow | wide geometric + mono | Blade Runner | dark, always |
| 7 | **ARCHIVAL** | aged cream + olive ink, no accent | ultra-light + italic serif | old library | light, aged |
| 8 | **INDUSTRIAL** | charcoal + brown + copper/steel | industrial display + grotesque | hardware, materials | dark, warm metals |
| 9 | **PLAYFUL** | saturated multi-color | rounded sans, generous | Lovable, Figma | light usually |
| 10 | **ETHEREAL** | whisper gradients, pearl, mist | light serif + airy sans | cloud, wellness | light, soft |
| 11 | **MONASTIC** | off-yellow cream + olive-black, zero accent | ultra-light + italic serif + mono | whitepaper, research | light, paper |
| 12 | **MAXIMALIST** | multiple saturated, blocked | heavy + delicate contrast | 90s magazine, Pentagram | either, loud |

Dark/light is a DECISION, not a default — the Native mode column gives the direction's home mode; the brief's emotion can override it (state why if you do).

### Anti-Repeat Check
Before committing: check conversation history and memory for the user's recent aesthetic directions. If recents are known, don't repeat them. If unknown, ask "what did your last 1-2 sites look like?" OR pick the less obvious of two good matches. Never hardcode past project names into this file — they go stale.

**Sibling pivot map** (when the best match collides with a recent one):
EDITORIAL-LUXURY↔ETHEREAL/ARCHIVAL · BRUTALIST↔INDUSTRIAL/MONASTIC · CINEMATIC↔FUTURIST · TECHNICAL-MINIMAL↔ARCHIVAL/MONASTIC · ORGANIC↔ETHEREAL/PLAYFUL · FUTURIST↔CINEMATIC/MAXIMALIST · PLAYFUL↔MAXIMALIST/ORGANIC

### Competitive Differentiation Check
Two checks before locking: does this repeat *your* recent work (above), and does this repeat *the category's* shared cliché (from STEP 0)? If the audit found "everyone does X," the pick must not be the sibling-pivot of X either — go further than one notch. Most B2B skews TECHNICAL-MINIMAL; if the product is genuinely premium, EDITORIAL-LUXURY / CINEMATIC / ORGANIC creates more category-contrast than "a nicer version of the same lane." State in the Design Contract: "Competitors lean [X] — this leans [Y] — that gap sells because [reason]."

### Signature Element — pick exactly ONE
The unforgettable detail. One per site; extra wow-moments dilute the one that matters. Restraint everywhere else is what makes it land.

- **EDITORIAL-LUXURY**: letter-by-letter type pour · sticky horizontal parallax · magnetic cursor on imagery · kinetic variable-font headline (weight mapped to scroll)
- **BRUTALIST**: live mono counter · grid-lines draw on scroll · reverse CAPS marquee · viewport-scaled kinetic type (edge-to-edge, compresses on scroll)
- **CINEMATIC**: letterbox bars at scene boundaries · depth-of-field shift on scroll · long scroll-scrub sequence
- **TECHNICAL-MINIMAL**: always-on mono status bar · copy-feedback code blocks · live data ticker
- **ORGANIC**: drifting grain · hand-drawn underline on scroll · ink-trail cursor · soft-pressed tactile buttons
- **FUTURIST**: multi-layer magnetic cursor · mouse-tracking iridescent mesh · glowing panel edges
- **ARCHIVAL**: anchor-linked footnotes · fade-in marginalia · section date stamps
- **INDUSTRIAL**: diagonal hash dividers · slide-out specs panel · mechanical loader · crosshair cursor
- **PLAYFUL**: bouncy stagger · color-shift hover · cursor pet at delay · CTA confetti
- **ETHEREAL**: drift-only motion · soft mouse glow · slow-rotating bg gradient · page-fade transitions
- **MONASTIC**: 1px reading-progress bar · italic pull-quotes fade up · footnote tooltips · near-zero motion
- **MAXIMALIST**: opposing marquees · overlapping text layers · color-shift per section

---

## THE DIALS

```
DESIGN_VARIANCE 1-10 (symmetric→chaos) · MOTION_INTENSITY 1-10 (static→cinematic) · VISUAL_DENSITY 1-10 (airy→packed)
```

Defaults: EDITORIAL-LUXURY 8/7/3 · BRUTALIST 9/2/5 · CINEMATIC 7/9/3 · TECHNICAL-MINIMAL 5/4/6 · ORGANIC 8/5/4 · FUTURIST 8/8/4 · ARCHIVAL 6/2/7 · INDUSTRIAL 7/5/5 · PLAYFUL 9/8/5 · ETHEREAL 6/4/2 · MONASTIC 4/1/5 · MAXIMALIST 10/9/9

**V**: ≤4 symmetric+centered OK · 5-7 mostly symmetric with asymmetric accents · 8+ asymmetric, CENTERED HERO BANNED, edge-bleed allowed.
**M**: ≤3 essential only, near-static · 4-6 reveals+stagger via native CSS scroll-driven animations (zero JS — see CODE PATTERNS), Lenis optional polish only · 7-8 GSAP ScrollTrigger scrub/parallax/magnetic/pin (native CSS can't pin/scrub yet) · 9-10 full GSAP scenes, 3D, multi-layer depth.
**D**: ≤3 `py-24 lg:py-32` max-w-5xl big type · 4-5 `py-16 lg:py-24` max-w-7xl · 6-7 `py-12` multi-col · 8+ `py-8` tight, NO generic cards (use `border-t`/`divide-y`).

### Depth Toolkit (what makes V>6 pages look designed, not assembled)
- **Overlap**: image bleeds under the next section's heading; text block overlaps an image edge by 2-4rem
- **Ghost numerals**: oversized section indices (01, 02) at 10-20% opacity behind content
- **Edge-bleed**: at V>6, at least one element per major section breaks the container
- **Oversized type**: one word per page may hit `clamp(4rem, 12vw, 12rem)`
- **Z-layers**: 3 planes max (bg texture / content / floating accent) — more reads as chaos
- **Micro-rotation**: ±1-2° on ORGANIC/PLAYFUL imagery only, never on text
- **Rhythm break**: after 2-3 same-width sections, one full-bleed or ultra-narrow section resets the eye

---

## STACK

**A: Vite+Vanilla+GSAP+Lenis** → luxury/marketing/brand/portfolio/cinematic. `npm create vite@latest [p] -- --template vanilla && npm i gsap lenis` (package is `lenis` — `@studio-freight/*` is retired; React: `import Lenis from 'lenis/react'`, use `syncTouch:true` not the old `smoothTouch`.)
**B: Next.js+shadcn/ui+Motion** → product/SaaS/dashboard/SEO/auth. `npx create-next-app@latest [p] --typescript --tailwind --app && npx shadcn@latest init && npm i motion lucide-react sonner next-themes`
**C: Vite+React+shadcn/ui+Motion** → component-heavy/interactive. `npm create vite@latest [p] -- --template react-ts && npx shadcn@latest init && npm i motion lucide-react sonner`

shadcn/ui defaults to Tailwind v4 (OKLCH tokens via `@theme`). Style preset by D dial: `new-york` for most · an airy preset for D≤5 · a dense preset for D≥7.
Deploy default: Vercel (zero config for all three stacks). Cloudflare Pages if the user asks: `public/_headers`, `public/_redirects` (`/* /index.html 200`), `NODE_VERSION=20`.

---

## SECTION ARCHITECTURE BY PRODUCT TYPE

Page order drives conversion as much as visuals. The right order depends on what's sold and how aware the visitor is.

- **LUXURY/BRAND** (being seduced, not comparison-shopping): Hero (signature moment) → Heritage/Story → Craft/Detail → Gallery → sparse Testimony (1-2 quotes, never a wall) → quiet CTA. Selling implied, never argued.
- **E-COMMERCE** (buying intent, needs reassurance fast): Hero w/ price+CTA above fold → 3-4 key benefits → Social proof HIGH in the page → How it works/specs → Trust signals near CTA (shipping, returns, guarantee) → FAQ/objections → Final CTA repeats the guarantee.
- **SaaS** (aware, comparing options): Hero (ONE value prop) → Trusted-by logos → Problem→Solution → Feature walkthrough → Pricing → Testimonials w/ specifics → FAQ → CTA.
- **COLD-TRAFFIC** (landed from an ad, unaware): Problem→Agitate→Solve BEFORE pitching. Name the pain plainly, let it sit, then introduce the product as the obvious answer.
- **PORTFOLIO/AGENCY**: Hero → Work grid → Process → About → Testimonials → Contact.

Confirm the section list with the user (or state it in the Design Contract when running agentically) before building past the hero.

### CONVERSION LAYER (the difference between admired and bought)
These rules sit *underneath* the aesthetic — premium brands persuade quietly.

- **Cognitive ease wins.** The visitor decides to stay in seconds. A vague or clever-for-its-own-sake headline burns the trust the polish just bought. Clear beats clever, always.
- **Trust signals sit NEAR the CTA** — reviews, guarantees, certifications beside the button, not in the footer.
- **Price transparency** reduces abandonment. Real costs upfront; concrete savings ("Save ₹4,000" beats "Sale").
- **One primary CTA per viewport**, action-specific copy ("Reserve yours", "Start the fitting" — never "Learn More" everywhere). Secondary actions visually subordinate.
- **Forms ask the minimum.** Every extra field is a reason to leave. Multi-step beats one long form.
- **Mobile CTA lives in the thumb zone** — sticky bottom bar on long mobile pages.
- **NEVER fabricate social proof.** No invented review counts, fake "X people viewing," or countdown timers tied to nothing. Build the real structure (review layout, badge row, testimonial slots) with an HTML comment (`<!-- insert real testimonial -->`) for the user's real data. Fake trust signals are themselves an AI-tell.
- **Restraint still wins.** Use the minimum tactic that removes real hesitation, not the maximum available.

---

## COPY SYSTEM (write from the rationale, not adjectives)

**Banned**: "Elevate your X" · "Seamless/effortless" · "Built for the next generation" · "Revolutionary/game-changing" · "Unlock the power of" · "Take X to the next level" · "Where X meets Y" · "Reimagine/redefine" · "best-in-class" · "supercharge".

### Hero anatomy (concrete blueprint)
- **Eyebrow** (optional): ≤4 words, small caps or mono, sets category context
- **Headline**: 2-8 words. Formulas that aren't generic: (a) bold claim — "Time, measured in lifetimes." (b) plain truth — "Run LLMs on your own laptop." (c) provocation — "Your watch is lying to you." (d) noun phrase — "Seventy years of precision."
- **Subhead**: ≤20 words, does the explaining the headline refused to do. Concrete: what it is, for whom, the one differentiator.
- **CTA pair**: primary (action-specific) + ghost secondary. Never two solid buttons.
- **Proof line** (only where honest data exists): one specific stat or quote beneath the CTAs.

**The 5-second test**: cover everything but the hero. Can a stranger say what this is, who it's for, and what to do next? If not, rewrite before styling further.

**Rules**: specific noun beats vague adjective ("Hand-assembled over 3 days" > "premium quality") · name the material, number, place, year · microcopy says the action ("Enquire", "See the movement") · no em-dash overuse · vary sentence length; let some be short · read the DESIGN.md Rationale and write from the brand's actual values.

---

## IMAGERY STRATEGY (premium sites live on imagery)

- **Generate real images** when an image-generation tool is available (heroes, products): detailed prompts — subject + setting + lighting + angle + lens + mood + aspect ratio + "no text, no watermark". Only fall back to `/images/[slug].jpg` placeholders when no generation tool exists, and say so explicitly.
- **Stock** (people/lifestyle): Unsplash/Pexels, picked for consistent color grading across the whole page.
- **Aspect ratios**: hero 16:9 or 21:9 · product cards 3:4 · gallery 1:1 · full-bleed 16:9.
- **Text-over-image overlay**: `linear-gradient(to bottom, rgba(canvas,0.7) 0%, transparent 25%, transparent 60%, rgba(canvas,0.85) 100%)`.
- **Loading**: hero eager + `fetchpriority="high"` + preload; rest `loading="lazy"`. Always width/height (no CLS). AVIF/WebP, `<picture>` + `srcset`.
- **Treatment by direction**: EDITORIAL/CINEMATIC = full-bleed, dark overlay, subtle scale-on-load · ORGANIC = slight rotation + grain · TECHNICAL = screenshots in device frames. Never stretch, never low-res.

---

## CRAFT RULES — Non-Negotiables

**Color**: ❌ pure `#000000` (use `#0A0A0A`/oklch) · purple→blue AI gradients · saturated `bg-blue-500` · gray-on-color text · gradient text on big headings · >2 accents. ✅ oklch for new tokens · tinted neutrals (warm or cool, never flat gray) · border `rgba(...,0.06-0.10)` · ONE accent carries 90% of interactions.

**Type — the 2+1 system** (resolves all font-count questions): exactly 1 display family + 1 body family (may be one variable superfamily), plus mono ONLY when the direction demands it (TECHNICAL/BRUTALIST/MONASTIC/INDUSTRIAL). Never more than 2 loaded families + optional mono; subset + preload + `font-display:swap`; 3-4 weights max total. For kinetic/scroll-mapped type use ONE variable font file (animated weight/width) — lighter AND it enables the effect.
❌ Inter-only (use Geist/Outfit/Cabinet/Satoshi/Bricolage) · Roboto/Open Sans · display+body identical with no weight contrast · screaming H1 · serif body on dashboards · CAPS body · centered paragraphs. ✅ `-0.02em` tracking on display >40px · `0.15em+` on small caps · body line-height 1.5-1.7 · measure 45-55ch · `text-wrap: balance` on headings · `font-variant-numeric: tabular-nums` on any counting/price/data numbers.

**Layout**: ❌ card-in-card · rounded icon tile above every heading · empty grid cells · three equal cards · centered hero at V>6 · `space-x/y-*` (use gap) · section padding <py-12 · borders everywhere. ✅ 8pt grid · asymmetry at V>6 · bento only when content justifies it (verify the 1-col mobile collapse) · `grid-auto-flow:dense`.

**Motion** (Emil Kowalski school): ❌ `transition:all` · `ease-in` on UI · `ease-in-out` hovers · bounce on UI · >800ms hovers · 360° spinners · infinite loops · scroll-jacking · dark glows. ✅ hover 150-200ms · scroll reveals via native `animation-timeline: view()` first (M4-6, zero JS) · entrances 800-1200ms · animate ONLY transform+opacity · springs stiffness 400 / damping 30 · GSAP `scrub:1` for M7+ only · Lenis 1.2-1.6 (polish, not reveals) · stagger 0.08-0.15s · respect `prefers-reduced-motion` on EVERYTHING.

**A11y** (Vercel Web Interface Guidelines): ✅ targets ≥44px · visible focus ring on EVERY interactive element · WCAG AA contrast · semantic HTML · visible form labels · errors `aria-live` · skip-link · alt text · sequential headings · full keyboard path (tab order, Esc closes overlays). ❌ hover-only nav · `outline:none` without replacement · color-only state indicators · autoplay with sound.

**Components** (shadcn projects): ✅ search the registry first · semantic tokens · `cn()` · `className` for layout only · `size-*` when w=h · `Field` for forms · full Card composition · Dialog/Sheet always have a Title · `sonner` for toasts. ❌ raw div for semantic elements · custom pulse (use Skeleton) · custom status (use Badge) · manual `dark:` overrides · raw `<hr>` (Separator).

**Code**: ✅ surgical changes · verify deps before importing · loading+error+empty states on anything async. ❌ over-engineering · `TODO:` in final output · mock data presented as real · dead code.

### Details pass (the last 5% that reads as craft)
Custom `::selection` color from the palette · styled scrollbar on dark sites · `:focus-visible` styling distinct from hover · every interactive element has a hover state · consistent icon stroke-width throughout · a favicon that isn't the framework default.

---

## THE 25 AI-TELLS (inject as "DO NOT" into every build step)

purple→blue hero · 3 equal cards · icon-tile-above-heading · glassmorphism-everywhere · Inter-only · centered-on-mesh-gradient · `from-purple-600 to-blue-600` · `#7C3AED` accent · infinite micro-animations · card-in-card · em-dash overuse · "the next generation of X" · `border-l-2` side-tabs · bounce hovers · custom cursor on a SaaS site · floating badge on hero · pill-tags under CTA · "QUESTION 05" section labels · invisible button text on hover · empty grid cells · serif-body dashboards · dark card glows · buzzword copy · random Lucide icons as decoration · bento-grid-for-everything (boxes for boxes' sake).

---

## CODE PATTERNS (proven — use these, don't reinvent)

**Reduced-motion guard** (wraps ALL JS motion):
```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) { /* animate */ }
```

**Native CSS scroll reveal** (M4-6, THE DEFAULT — reach for this before any JS):
```css
.reveal { opacity: 1; translate: 0; }
@supports (animation-timeline: view()) {
  .reveal { animation: fade-up linear both; animation-timeline: view(); animation-range: entry 0% entry 50%; }
}
@keyframes fade-up { from { opacity: 0; translate: 0 40px; } }
/* No @supports match = renders in final state. No JS, no FOUC, works with JS disabled. */
```

**GSAP scroll reveal** (Stack A, M7+):
```js
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export const fadeUp = (els) => gsap.from(els, {
  y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
  scrollTrigger: { trigger: els[0], start: 'top 80%' } });
```

**Lenis + GSAP sync** (M≥5 polish layer, separate from reveals):
```js
import Lenis from 'lenis'; // NOT @studio-freight/lenis — retired scope
const lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), syncTouch: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
// disable on touch + reduced-motion
```

**Kinetic variable-font headline** (signature — EDITORIAL/BRUTALIST/CINEMATIC):
```js
import { SplitText } from 'gsap/SplitText'; // free since GSAP 3.13
gsap.registerPlugin(SplitText, ScrollTrigger);
const split = new SplitText('.kinetic-h1', { type: 'chars' });
gsap.fromTo(split.chars, { fontVariationSettings: "'wght' 900" },
  { fontVariationSettings: "'wght' 100", stagger: 0.02,
    scrollTrigger: { trigger: '.kinetic-h1', start: 'top center', end: 'bottom top', scrub: 1 } });
// requires ONE variable font file — see Type rules
```

**Motion (Framer) reveal** (Stack B/C):
```jsx
<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
// interactive: whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
```

**Magnetic cursor** (lerp ring + dot — hide on `(hover:none)` + reduced-motion):
```js
let mx = 0, my = 0, rx = 0, ry = 0;
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
const raf = () => { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(raf); }; raf();
```

**Preloader** (no spinner): `await document.fonts.ready;` then fade out and remove.

**Scroll-scrubbed sticky section** (M≥7): GSAP `scrollTrigger: { trigger, start:'top top', end:'bottom bottom', scrub:1, pin:'.sticky-left' }`.

---

## BUILD SEQUENCE

Every step carries this header:
```
PROJECT:[Brand] · AESTHETIC:[Direction] · DIALS:V[X]/M[Y]/D[Z] · STACK:[Stack] · SIGNATURE:[element]
DO NOT: #000000 · Inter-only · purple→blue · card-in-card · icon-tiles · transition:all ·
empty grid cells · targets<44px · fabricated reviews/urgency · the 25 AI-TELLS.
MUST: focus states · semantic HTML · prefers-reduced-motion · loading/error/empty states.
```

1. **Scaffold** — exact commands, confirm the dev server runs. Write project-root `AGENTS.md` (see PORTABILITY).
2. **Design System** — tokens (color, 2+1 type, scale, spacing, ease). Base reset + type. Must look intentional immediately.
3. **Nav** — fixed, transparent→blur at 100px, hide-on-scroll-down, mobile overlay. Asymmetric if V>6. Mono status bar if TECHNICAL.
4. **Hero** — layout by V, copy via hero anatomy, entrance by M. **Implement the signature here.** Run the 5-second test.
   → **═══ CHECKPOINT ═══** Agentic: screenshot the hero, self-critique against CRAFT RULES + AI-TELLS, fix, show the user the result, continue. Chat mode: ask the user to screenshot and paste back before continuing.
5. **Section plan** — confirm architecture + conversion tactics (from the Design Contract).
6-12. **Sections** — layout by V, padding by D, motion by M. Build → verify → fix each. Apply the Depth Toolkit; rhythm-break every 2-3 sections.
13. **Footer** — top border, asymmetric if V>6, brand + nav + social, copyright strip.
14. **Scroll animations** — native CSS `animation-timeline: view()` for M4-6; GSAP/Motion only for M7+ scrub/pin/sync. Reduced-motion safe.
15. **Lenis** (M≥5) — duration 1.4, GSAP-synced, off on touch + reduced-motion.
16. **Magnetic cursor** (only if the signature needs it).
17. **Mobile pass** — grids→1col, sticky→stacked, kill magnetic + heavy parallax, `overflow-x:hidden`, targets ≥44px, sticky thumb-zone CTA on long pages.
18. **Polish** — details pass · preloader · SEO block · favicon · lazy/responsive images · no console errors · no FOUC · keyboard pass · AI-crawler check (is the real copy in the initial HTML, or only JS-revealed?).
19. **Deploy** — platform config, `.gitignore`, git push.

`git commit` after EVERY step (`feat: [step]`) — enables the Recovery Protocol.
Conditional add-ons: 3D (Three.js/R3F) · audio (Tone.js) · carousel (Embla) · contact form (validation + all states).

---

## VISUAL VERIFICATION LOOP (the differentiator)

After the hero, and after the full build:

1. Screenshot the running page with real browser tooling at **three viewports: 390px (mobile), 768px (tablet), 1440px (desktop)** — in the site's actual color mode.
2. **Look at each screenshot** and critique like a senior designer: type hierarchy clear? 8pt spacing rhythm? any AI-tell present? accent carrying interactions? signature visible and singular? contrast passing? anything overflowing, overlapping, or orphaned at any viewport?
3. List everything wrong → fix worst-first → re-screenshot. Repeat until clean.
4. In plain chat (no browser tooling): instruct the user — "Run `npm run dev`, screenshot the hero at desktop + mobile, paste both back. I'll critique against the craft rules before we continue."

NEVER declare done without at least one full 3-viewport pass. A clean compile is not verification.

---

## PERFORMANCE BUDGET (hard gates)

LCP <2.5s · CLS <0.1 · INP <200ms · initial JS <150kb gzipped (code-split, lazy below-fold) · fonts preload + `font-display:swap` + subset (2 families + optional mono, 3-4 weights total) · images AVIF/WebP responsive lazy with dimensions · no render-blocking JS · Lighthouse Perf/A11y/Best-Practices/SEO all ≥90 (aim 100 a11y). Measure with real browser vitals tooling when available — never claim scores that weren't measured.

---

## SEO + SHARE

One `<h1>`, sequential headings, `<nav>/<main>/<article>/<footer>`. Title `[Brand] — [value, 4-6 words]` ≤60 chars. Description ≤155 chars, specific. OG/Twitter: og:title/description/image (1200×630), `twitter:card=summary_large_image`. JSON-LD (Organization/Product/WebSite). `sitemap.xml` + `robots.txt` + canonical. Favicon: SVG brand mark + `.ico` + apple-touch-icon.
**AI-crawler visibility**: ChatGPT/Perplexity-style crawlers read initial HTML only — no scroll-triggers, no accordion clicks. Any fact the brand needs cited (pricing, specs, claims) must exist in the server-rendered HTML.

---

## RECOVERY PROTOCOL

Dev error → read the actual error, fix that file, don't rebuild. Dependency conflict → use the stack-preset versions. Next.js hydration error → find the client/server mismatch (`Date`/`Math.random`/browser API in a Server Component → move to a `'use client'` leaf). Resume after interruption → check last commit, read file state, continue. Failed verification → revert that step's commit, re-attempt with the specific fix named.

---

## PORTABILITY — AGENTS.md

SKILL.md auto-triggers only in tools that scan skill folders. Cursor, Antigravity, and Codex all natively read a plain `AGENTS.md` at project root instead. **Whenever this skill scaffolds a project (Build step 1), also write `AGENTS.md`** containing a condensed, tool-agnostic version of: the Design Contract (direction + dials + signature + type/color decisions), the Anti-Pattern list, the CRAFT RULES, and the 25 AI-TELLS. Strip tool-specific phrasing. Result: reopening the project in any agent inherits the same palette, motion budget, and anti-slop rules without re-briefing.

---

## CHAT OUTPUT FORMAT (plain-chat mode only)

One markdown plan, presented in full:
```
# [Brand] Frontend — Execution Plan
## Design Contract (one screen: thesis · direction+why · dials · signature · type/color · mode)
## Competitive Audit (competitors, shared cliché, the gap this design owns)
## Section Architecture + Conversion tactics
## Anti-Pattern Diff (what this site WILL NOT do)
## Execution Map (table)
## STEP 1…19 (each: context header + copy-paste-ready prompt)
## CHECKPOINT note after the hero step
## Closing: preview · deploy · the rubric
```

---

## SCORING RUBRIC (objective "done" gate — 13 dimensions)

Score 1-10 each. **All must hit 8+ before done.** Score against the definitions, not your effort — the failure mode is optimistic scoring, and a dishonest 8 ships a mediocre site. If any dimension is <8, name the gap, fix it, re-score. A 7 is not done.

| Dimension | 8+ looks like |
|---|---|
| **Typography** | 2+1 system, hierarchy via weight+size, correct tracking, no default-stack fonts |
| **Color** | tinted neutrals, one confident accent, no banned colors, AA contrast |
| **Space** | 8pt rhythm, generous and intentional, asymmetry where V demands |
| **Motion** | purposeful, correct durations/easing, reduced-motion safe, zero jank |
| **Hierarchy** | eye knows where to go; one focal point per section |
| **Depth** | at least two Depth Toolkit moves in play; page has layers, not stacked blocks |
| **Originality** | distinct direction, zero AI-tells, unlike the user's last project |
| **Differentiation** | visibly NOT the category's shared cliché — a competitor's customer would notice |
| **Trust/Conversion** | a stranger has enough real reassurance near the CTA to act; nothing fabricated, nothing pushy |
| **Accessibility** | keyboard-complete, focus visible, semantic, AA, alt text |
| **Performance** | budget met: LCP<2.5s, CLS<0.1, JS<150kb |
| **Copy** | passes the 5-second test; specific, zero buzzwords, microcopy intentional |
| **Signature** | the ONE unforgettable element present and prominent — nothing competing with it |

---

## FORBIDDEN

- More than 1 clarifying question, unless the design read genuinely diverges (asking for competitor URLs when no search tool exists is the standing exception).
- Any output before the Design Contract.
- A site that could be any brand → if it could, restart the direction.
- Reusing hero/color-logic/animation from a previous project.
- Skipping: Competitive Intelligence (when no DESIGN.md), the Checkpoint, the 3-viewport Verification, or the Rubric.
- `TODO:` / "customize this" / visible placeholder language in final output.
- Fabricated trust signals of any kind — structure for real data via code comments; never invent numbers.
- More than ONE signature element per site.

## THE TEST

*"Would a senior designer at a top agency believe another senior designer built this — not an AI?"* If no, it's wrong. Fix before shipping.

> Restraint is the feature. Add the right things at the right moments — verified by eye at three viewports, scored honestly, shipped only at 8+.

