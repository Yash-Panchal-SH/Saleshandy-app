# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## What this is

The Saleshandy web app — a greenfield rebuild. Vite 8 + React 19 + TypeScript 6
(strict), pnpm. See `README.md` for the full stack and `rebuild-spec/` for the
governing specification.

## Commands

- `pnpm dev` — dev server · `pnpm build` — typecheck + prod build
- `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm e2e`
- `pnpm gen:routes` — regenerate the route tree after adding/renaming routes

The pre-commit hook runs Biome + `tsc` on staged files; commit messages are
Conventional Commits (commitlint). Do not `--no-verify` on protected branches.

## Conventions

- **Folder layout** — `src/app/` (providers, router, store), `src/routes/`
  (file-based route tree), `src/features/<feature>/` (self-contained modules),
  `src/shared/` (cross-feature code). Absolute imports via `@/*`. No barrel files.
- **TypeScript** — strict; `verbatimModuleSyntax` is on, so type-only imports
  must use `import type`. `noImplicitOverride` is on. No `any`.
- **State** — server state → TanStack Query; global UI state → Zustand
  (`src/app/store/`); local → `useState`; URL state → router search params.
- **Logging** — never `console.*` in shipped code; use `logger`
  (`src/shared/lib/logger.ts`). Biome enforces this.
- **Errors** — route through `reportError` (`src/shared/lib/error/report.ts`).
- **Styling** — Tailwind v4 only; no inline styles, no CSS-in-JS.
- **i18n** — user-facing strings go through `useTranslation`; keys live in
  `src/i18n/<locale>/<namespace>.json`.

## Before finishing a change

Run `pnpm lint`, `pnpm typecheck`, and `pnpm test`. They must all pass — the
same gates run in the pre-commit hook.

## Decisions

Architecture decisions are recorded in `docs/adr/`. Read the relevant ADR
before changing routing, HTTP, theming, lint tooling, or the provider tree.
