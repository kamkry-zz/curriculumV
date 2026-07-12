# AGENTS.md

## Project Overview

**curriculumV** — a single-page dark-themed DevOps resume with glassmorphism UI, particle background, 3D animations, and multi-format export (PDF/PNG/JPEG). Served via FastAPI in Docker, deployed on Kubernetes behind Gateway API HTTPRoute.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (HMR, port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run lint` | Oxlint (0 warnings required) |
| `npm run preview` | Preview production build |
| `python app.py` / `uvicorn app:app` | Backend static server (port 8080) |

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, GSAP, js-yaml, html2canvas + jsPDF
- **Backend:** FastAPI + Uvicorn (static file server only — serves `dist/`)
- **Container:** Multi-stage Docker (`node:22-alpine` → `python:3.13-slim`)
- **Deploy:** Helm chart → Kubernetes, ArgoCD GitOps, `cv.theit.cc`
- **CI:** GitHub Actions — lint, build, SonarQube, Trivy, AI PR review, Docker push

## Architecture

```
src/
├── main.jsx          → React entry, renders <App />
├── index.css         → Tailwind v4 @import, @theme tokens, @keyframes, glass classes, print/capture resets
├── App.jsx           → Root: toolbar, CV, Background, GlassOrbs, export trigger, export loading modal
├── components/
│   ├── CV.jsx        → Core CV document (A4 card, 3D tilt, staggered animations, all sections)
│   ├── Background.jsx→ Canvas particle network + rare colorful sparkle stars
│   └── GlassOrbs.jsx → 5 large blurred violet/silver floating orbs (CSS-animated)
├── data/
│   ├── resume.yaml   → All CV content (parsed via js-yaml + Vite ?raw import)
│   └── me.jpg        → Profile photo (imported as URL by Vite)
└── utils/
    └── export.js     → exportPDF, exportPNG, exportJPEG using html2canvas + jsPDF
```

## Key Patterns

### Data-Driven CV (`resume.yaml`)
The entire CV content lives in `src/data/resume.yaml`. Parsed in `App.jsx` via:
```js
import { load } from "js-yaml";
import raw from "./data/resume.yaml?raw";
const resume = load(raw);
```
Structure: `name`, `title`, `email`, `phone`, `location`, `website`, `github`, `linkedin`, `summary`, `experience[]`, `education[]`, `skills[]`, `languages[]`, `interests[]`. All fields optional — CV renders conditionally.

### Color System (Tailwind v4 @theme)
Defined in `src/index.css`. Custom tokens: `canvas` (#09090b), `surface` (#131318), `accent` (#8b5cf6), `accent-light` (#a78bfa), `silver` (#d4d4d8). Fonts: `font-heading` (Space Grotesk), `font-mono` (JetBrains Mono). Body font: Inter.

### Animations
- **GSAP** for 3D card tilt and name magnetic hover (CV.jsx)
- **CSS @keyframes** for staggered section entrance, glass sweep, orb float, glow pulse
- **Canvas requestAnimationFrame** for particle network + sparkle stars (Background.jsx)
- All respect `prefers-reduced-motion` — disable animations, show static frame

### Export Pipeline
1. PNG/JPEG: html2canvas captures full CV element at 2x scale
2. PDF: Individual `[data-export-block]` elements captured separately → composed into A4 pages with content-aware page breaks (no mid-block slicing)
3. `onclone` callback strips filters, gradients, animations from cloned DOM to avoid html2canvas crashes
4. Dark background preserved in all exports (#131318)

### Export Blocks
Elements marked with `data-export-block` in CV.jsx are captured individually for PDF: header, summary, each experience item, education, skills, languages, interests. Adding/removing sections requires updating these attributes.

## Quality Gates (pre-commit)

- **🧪 Test coverage is mandatory for all new code.** Every new component, function, or branch must have corresponding tests. Run `npm test` and `npm run test:coverage` before committing.
- **🔍 SonarQube issues must be checked and fixed before commit.** Use the `sonarqube-mcp` tools to inspect `new_code` issues on the PR branch. No unresolved SQ issues (bugs, vulnerabilities, code smells) should remain.
- **✅ `npm run lint` must pass with 0 warnings.**

## Conventions

- **Inline styles** for colors/effects (not Tailwind utility classes) — html2canvas compatibility
- **No emojis as icons** — use SVG or CSS shapes
- **Font:** Space Grotesk (headings), Inter (body), JetBrains Mono (data/contact)
- **Touch targets** ≥44pt, `prefers-reduced-motion` respected
- **Print:** `print:` variants hide toolbar, remove shadows, switch to full width

## CI/CD

Workflow: `.github/workflows/ci.yml` calls reusable `app-ci.yml`. On PR: lint-helm → build → sonarqube → trivy FS → AI summary → aggregate PR comment. On push to main: same + Docker build/push + Trivy image scan. ArgoCD auto-syncs Helm chart from repo.

## Versioning & PR Rules

- **🏷️ Bump `imageTag`** in `helm/curriculum-v/values.yaml` whenever app code changes (`src/`, `Dockerfile`, `package.json`, `pyproject.toml`). The CI Docker push uses this tag.
- **✅ Tag bump NOT required** when only Helm/K8s configs change (`helm/`, `.github/`).
- **🔒 Every change must come via a PR** — no direct pushes to `main`.
- On merge to `main`, CI builds and pushes `ghcr.io/<owner>/curriculum-v:<imageTag>` + `:latest`, ArgoCD syncs automatically.
