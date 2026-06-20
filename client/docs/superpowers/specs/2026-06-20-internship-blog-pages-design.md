---
name: internship-blog-pages
description: Design spec for internship blog pages (Synthesis & Coca-Cola) accessible via company icon clicks and a new View My Work dropdown
metadata:
  type: project
---

# Internship Blog Pages — Design Spec

**Date:** 2026-06-20  
**Scope:** Add per-company internship blog pages, React Router, and a "View My Work" dropdown to the portfolio.

---

## 1. Routing

Install `react-router-dom`. Wrap `App.jsx` in `<BrowserRouter>`. Define routes:

| Path | Component |
|---|---|
| `/` | Existing single-page layout (unchanged) |
| `/experience/synthesis` | `ExperiencePage` with Synthesis data |
| `/experience/coke` | `ExperiencePage` with Coca-Cola data |

`ExperiencePage` is a single reusable component that accepts a company ID and resolves its data from a shared `EXPERIENCE_DATA` object (same source of truth used by `Experience.jsx`).

---

## 2. Navigation Changes

### 2a. Company Icons → Link
In `Experience.jsx`, the clickable icon `<div>` for each `TimelineNode` is replaced with a `<Link to="/experience/{exp.id}">` from react-router-dom. The hover card and all animations remain unchanged. Only the click target changes from no-op to navigation.

### 2b. "View My Work" Dropdown (Intro.jsx)
The `<a href="#projects">View My Work</a>` button becomes a `<button>` that toggles a dropdown panel.

**Dropdown items:**

| Label | Icon | Action |
|---|---|---|
| Synthesis | Synthesis logo img (same src as Experience.jsx) | `<Link to="/experience/synthesis">` |
| The Coca-Cola Company | Coca-Cola logo img (same src as Experience.jsx) | `<Link to="/experience/coke">` |
| Personal Projects | Grid/tile icon (e.g. `⊞` or simple SVG) | Smooth-scroll to `#projects` then close dropdown |

**Dropdown styling:**
- Positioned absolutely below the button
- `background: var(--bg-card)`, `border: 1px solid var(--border)`, `box-shadow: var(--shadow-md)`
- `border-radius: 10px`, `padding: 0.5rem`
- Each item: `padding: 0.6rem 1rem`, `border-radius: 6px`, hover background `var(--accent-dim)`
- Logo images: 20×20px, `border-radius: 4px`
- Close on: item click, click outside (via `useEffect` + `mousedown` listener on `document`)
- Works identically on mobile

---

## 3. ExperiencePage Component

Single file: `src/components/ExperiencePage.jsx`

Data-driven via a `BLOG_DATA` object keyed by company ID (`synthesis`, `coke`). Each entry contains all placeholder content. Real content will be filled in later.

### 3a. Page Structure (top → bottom)

#### Hero Strip
- Full-width section with a tinted background using the company's `accentColor` at ~8% opacity over `var(--bg-surface)`
- Left: back arrow `←` as a `<Link to="/#experience">` styled as a subtle button
- Centre/left content: company logo icon (reuse `SynthesisIcon` / `LiquidColaIcon` at a larger size, or just the img), role title, period badge, one-line tagline
- Framer Motion fade-in on mount

#### Overview
- `section-label` eyebrow: "Overview"
- `h2` heading
- 2–3 `<p>` paragraphs (placeholder lorem ipsum)
- Max-width `740px`, centred

#### Tech Stack
- `section-label` eyebrow: "Tech Stack"
- Pills grouped by category (e.g. Languages, Cloud, AI/ML)
- Same pill style as existing tag chips in `Experience.jsx`: `background: {accentColor}10`, `color: accentColor`, `border: 1px solid {accentColor}22`
- Category label in `var(--text-muted)` above each group

#### Key Projects
- `section-label` eyebrow: "Key Projects"
- 2–3 cards in a responsive grid (`repeat(auto-fit, minmax(280px, 1fr))`)
- Each card: project name (h3), short description, 2–3 outcome bullets (`•`), tech tag row
- Same card style as existing cards: `var(--bg-card)`, `var(--border)`, `var(--shadow-sm)`, `border-radius: 10px`
- Hover: `border-color` shifts to `accentColor`, `var(--shadow-md)`

#### Key Takeaways
- `section-label` eyebrow: "Key Takeaways"
- 3–4 items, each with a numbered badge (styled circle with `accentColor`) and a short paragraph
- Single-column, max-width `640px`

### 3b. Placeholder Content

**Synthesis:**
- Tagline: "AI-powered tools & ETL pipelines for strategic client insights"
- Projects: "Client Intelligence Pipeline", "Open-Source Data Scraper", "Recommendation Engine"
- Stack: Python, SQL, BigQuery, Vertex AI, GCP
- Takeaways: 3 placeholder bullets

**Coca-Cola:**
- Tagline: "Agentic systems & LLM pipelines to automate internal workflows"
- Projects: "Workflow Automation Agent", "RAG Knowledge System", "NLP Classification Pipeline"
- Stack: Python, SQL, LangGraph, Azure, OpenAI, NLP, RAG, Databricks
- Takeaways: 3 placeholder bullets

### 3c. Animation
- All sections use `useInView` + Framer Motion fade-up (same pattern as the rest of the site)
- Staggered delays between sections

### 3d. Responsive
- Mobile: hero stacks vertically, project cards go single-column, tags wrap naturally
- Navbar still visible at top (Navbar component rendered on the experience page too)

---

## 4. File Changes Summary

| File | Change |
|---|---|
| `package.json` | Add `react-router-dom` |
| `src/main.jsx` | Wrap with `<BrowserRouter>` (or wrap in App.jsx) |
| `src/App.jsx` | Add `<Routes>`: `/` → existing layout, `/experience/:id` → `ExperiencePage` |
| `src/components/Intro.jsx` | Replace View My Work `<a>` with dropdown `<button>` |
| `src/components/Experience.jsx` | Wrap icon click target with `<Link>` |
| `src/components/ExperiencePage.jsx` | New file — blog page component |

---

## 5. Out of Scope

- Real content (filled in by user later)
- Animations beyond existing site patterns
- SEO / meta tags
- Comments/contact form on blog page
