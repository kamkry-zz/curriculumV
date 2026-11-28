# AGENTS.md

## Work tracking in GitHub Issues (HARD RULE)

GitHub Issues are the **source of truth** for what is planned, running and
finished in this repo. No AI session works without a tracked issue. Helper
(stdlib + `gh`): `GT="python3 $HOME/gitRepos/repo-settings/tools/gh_track.py"`;
protocol and stats reference: `~/gitRepos/repo-settings/docs/ISSUE-TRACKING.md`.

1. **Start:** `$GT status` (also lists UNTRACKED issues: `$GT adopt N --model … --effort …`);
   continue the matching issue or create one:
   `$GT open --title … --kind feature|fix|chore|experiment|task --model <id> --effort <level>`
   (`--epic` for a parent, `--parent N` for a child). Bot PRs (Renovate) are exempt.
2. **Model / effort:** recorded at `open`; on every switch run
   `$GT model N --model <id> --effort <level> --reason "…"`.
3. **Branches:** `<kind>/<N>-slug` (`$GT branch N slug --prefix feat|fix|chore|exp [--worktree]`);
   with that name `$GT` infers N and pushes / `gh pr create` are blocked by the hook until it has one.
   PR descriptions say `Refs #N` (CI check `issue-link`).
4. **Parallel work:** each extra session or worktree runs `$GT session N --branch <b> --role <what>`
   (adds the `parallel` label). Several sessions never share one branch.
5. **Milestones:** `$GT milestone N "…"` at plan agreed, first green tests, PR opened,
   CI result, hand-off. It refreshes token, CI and delivery stats in the issue's summary table.
6. **CI:** GitHub Actions runs are collected automatically per branch/PR. Wrap local
   gates: `$GT run N --label local-ci -- <command>` (records time and exit code).
7. **Artifacts:** every deliverable (Claude Design, Docs, Artifact, diagram, screenshot,
   report) goes in with `$GT artifact N --title … (--file PATH | --url URL) [--source-url URL]`;
   text and images are embedded, anything else is linked.
8. **References:** `$GT ref N --kind decision|incident|deploy|doc --text … [--url …]` for design
   decisions, `TROUBLESHOOTING` entries, deploy outcomes (ArgoCD sync/health).
9. **Link & close:** commits/PRs say `Refs #N`; `$GT link N --pr P` (or `--commit SHA` for a
   direct landing). Finish with `$GT refresh N --final` then `$GT close N` — it refuses while a
   PR is open or the openspec change is unarchived.
10. **openspec** (if `openspec/` exists): one issue per change — `$GT open … --openspec <name>`
   *before* writing the proposal; `$GT adopt-openspec --model … --effort …` backfills active
   changes. Archive the change, merge the PR, then close the issue.
11. **Plain `gh` fallback** if the helper is missing: keep the same data by hand (model/effort
   table, CI stats, links) in one comment; never skip the issue. Weekly `digest`/`audit` (repo-settings workflow) flags stale
   issues, branches without an issue and openspec changes without one.

## Project Overview

**curriculumV** — a single-page dark-themed DevOps resume with glassmorphism UI, particle background, 3D animations, and multi-format export (PDF/PNG/JPEG). Served via FastAPI in Docker, deployed on Kubernetes behind Gateway API HTTPRoute.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (HMR, port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run lint` | Oxlint (0 warnings required) |
| `npm test` / `npm run test:coverage` | Vitest (jsdom) / with v8 coverage |
| `npm run preview` | Preview production build |
| `uvicorn app:app --port 8080` | Backend static server for `dist/` (run `npm run build` first; the container uses port 8080) |

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, GSAP, js-yaml, html2canvas + jsPDF
- **Backend:** FastAPI + Uvicorn (static file server only — serves `dist/`)
- **Container:** Multi-stage Docker (`node:26-alpine` → `python:3.15-slim`)
- **Deploy:** Helm chart → Kubernetes, ArgoCD GitOps, `cv.theit.cc`
- **CI:** GitHub Actions — Helm lint, tests, SonarQube, Trivy, Docker push, PR comment

## Architecture

```
src/
├── main.jsx          → React entry, renders <App />
├── index.css         → Tailwind v4 @import, @theme tokens, @keyframes, glass classes, print/capture resets
├── App.jsx           → Root: toolbar, CV, Background, GlassOrbs, Footer, export trigger, export loading modal
├── test-setup.js     → Vitest setup (each module has a sibling `*.test.jsx`/`*.test.js`)
├── components/
│   ├── CV.jsx        → Core CV document (A4 card, 3D tilt, staggered animations, all sections)
│   ├── Background.jsx→ Canvas particle network + rare colorful sparkle stars
│   ├── Footer.jsx    → Image tag, repo link, copyable `docker run` command (`__IMAGE_TAG__`/`__REPO_URL__` build defines)
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
Structure: `name`, `title`, `email`, `phone`, `location`, `website`, `github`, `linkedin`, `patents`, `summary`, `experience[]`, `education[]`, `skills[]`, `languages[]`, `interests[]`. All fields optional — CV renders conditionally. The Docker build overwrites `phone` from the `PHONE_NUMBER` build-arg (CI repo variable) when set.

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

Workflow: `.github/workflows/ci.yml` (trigger: `pull_request` to `main` only) calls reusable `app-ci.yml`: lint-helm → test → sonarqube → trivy FS → docker build/push → Trivy image scan → aggregate PR comment. The image is pushed from the PR run, not on merge. ArgoCD auto-syncs the Helm chart from the repo (`helm/curriculum-v/argocd/`).

## Versioning & PR Rules

- **🏷️ Bump `imageTag`** in `helm/curriculum-v/values.yaml` whenever app code changes (`src/`, `Dockerfile`, `package.json`, `pyproject.toml`). The CI Docker push uses this tag.
- **✅ Tag bump NOT required** when only Helm/K8s configs change (`helm/`, `.github/`).
- **🔒 Every change must come via a PR** — no direct pushes to `main`.
- The PR run builds and pushes `ghcr.io/kamkry-zz/curriculumv:<imageTag>` (no `:latest`); after merge ArgoCD syncs the chart, which pins that tag.
