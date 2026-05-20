# SCAF-1 — Vite 6 + React 19 + TypeScript-strict scaffold

- **Date:** 2026-05-20
- **Linear issue:** [SAL-1824 · SCAF-1](https://linear.app/ikigaihq/issue/SAL-1824/scaf-1-vite-6-react-19-typescript-strict-scaffold-pnpm)
- **Project:** Project Scaffolding (Saleshandy UI Rebuild)
- **Status:** Design approved — ready for implementation plan

## Context

The Saleshandy UI Rebuild is a greenfield SPA replacing the legacy `saleshandy-webui`
app. SCAF-1 is the first issue of the scaffolding milestone: it produces the bare Vite
project that every later SCAF ticket (Tailwind, Biome, router, query, state, …) grafts
onto. It deliberately ships *nothing* beyond a typechecking, building, previewable shell.

This repo (`/Users/yashpanchal/Saleshandy/Saleshandy-app`) currently holds only
`LINEAR_IMPORT_PLAN.md` and `rebuild-spec/`. The app is scaffolded **into this repo**;
those two stay at the root as project documentation.

## Goal

A greenfield Vite 6 SPA on React 19 with the strictest sensible TypeScript settings,
managed by pnpm, that passes `install → typecheck → build → preview` cleanly.

## Decisions

Settled during brainstorming:

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | App scaffolds **into `Saleshandy-app/`** itself | This repo is the rebuild repo; planning docs become repo docs. |
| 2 | Scope is **SCAF-1 only** | SCAF-0 (workflow docs, `.claude/` tooling, design POC) handled separately. |
| 3 | Scaffold from the official **`react-ts` template** via `pnpm create vite` | AC mandates the `react-ts` template; avoids hand-rolled drift. |
| 4 | pnpm enabled through **corepack**; `packageManager` pinned in `package.json` | pnpm is not installed locally but corepack is; the pinned field *is* the "pnpm is canonical" AC. |
| 5 | `@/` path alias defined **once** in tsconfig; Vite reads it via **`vite-tsconfig-paths`** | Single source of truth — no duplicated `resolve.alias`. |
| 6 | **Strip the template's ESLint** (config + deps) | The project's linter is Biome (SCAF-4); leaving ESLint would be dead, half-configured tooling. |
| 7 | Replace the template demo (counter + logos) with a **minimal placeholder root** | This is a foundation, not a demo app. |

## Target layout

```
Saleshandy-app/
├── LINEAR_IMPORT_PLAN.md          kept — repo docs
├── rebuild-spec/                  kept — repo docs
├── docs/superpowers/specs/        this design doc
├── index.html
├── package.json                   packageManager pinned; scripts: dev/build/preview/typecheck
├── pnpm-lock.yaml
├── vite.config.ts                 @vitejs/plugin-react + vite-tsconfig-paths
├── tsconfig.json                  solution file → references app + node
├── tsconfig.app.json              src/ — strict flags + @/* alias
├── tsconfig.node.json             vite.config.ts
├── .gitignore                     node_modules, dist, *.tsbuildinfo
├── public/
└── src/
    ├── main.tsx                   <StrictMode> root
    ├── App.tsx                    minimal placeholder page
    ├── vite-env.d.ts
    └── index.css                  minimal reset only (no Tailwind — SCAF-2)
```

## TypeScript strictness

All flags land in `tsconfig.app.json` `compilerOptions` (the `src/` config). The
`react-ts` template already enables some via `strict`; the following are set
**explicitly** to match the AC exactly:

- `strict: true`
- `strictNullChecks: true`
- `noImplicitAny: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noFallthroughCasesInSwitch: true`
- `noImplicitOverride: true`
- `target: "ES2022"`
- `moduleResolution: "bundler"`
- `paths: { "@/*": ["./src/*"] }` (with `baseUrl: "."`)

`tsc -b` typechecks only — the template configs carry `noEmit: true`, so build mode
emits nothing.

## Scripts (`package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Dev server |
| `build` | `tsc -b && vite build` | Typecheck then bundle to `dist/` |
| `typecheck` | `tsc -b` | Standalone typecheck (AC verification) |
| `preview` | `vite preview` | Serve the built `dist/` |

## Verification (acceptance gate)

```bash
pnpm install        # resolves, writes pnpm-lock.yaml
pnpm typecheck      # zero errors
pnpm build          # exits 0, produces dist/
pnpm preview        # localhost serves the placeholder root page
```

All four must pass for SCAF-1 to be done.

## Out of scope

Owned by later SCAF tickets — deliberately absent from SCAF-1:

- Tailwind v4 + shadcn/ui — SCAF-2
- Env management + Zod boot validation — SCAF-3
- Biome lint/format — SCAF-4
- Husky / lint-staged / Commitlint — SCAF-5
- Testing baseline (Vitest/Playwright/MSW) — SCAF-6
- Router, Query, Zustand, HTTP/auth, error boundaries — SCAF-7..11

## Risks & notes

- **pnpm version pin:** corepack activates the pnpm version named in `packageManager`.
  The implementation plan pins a current stable pnpm release; bumping it later is a
  one-line change.
- **Node version:** local is Node 24.2; Vite 6 + React 19 support it. An `engines`
  field (`>=22`) documents the floor without hard-failing installs.
- **`exactOptionalPropertyTypes`** is the strictest of the flags and can surface
  friction in later feature code. It is required by the AC and kept; teams writing
  feature code should prefer `prop?: T` over `prop: T | undefined` deliberately.
