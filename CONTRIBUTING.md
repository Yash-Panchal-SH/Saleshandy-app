# Contributing

How to work in this repository. New to the project? Start with
[`docs/onboarding.md`](docs/onboarding.md).

## Local development

```bash
pnpm install        # Node 22+, pnpm via corepack
pnpm dev            # dev server → http://localhost:5173
```

Before pushing, run the gates the pre-commit hook enforces:

```bash
pnpm lint           # Biome lint + format check
pnpm typecheck      # tsc -b
pnpm test           # Vitest unit/component tests
pnpm e2e            # Playwright end-to-end tests
```

## Branching

- Branch off `main`; name branches `<author>/<ticket>-<slug>`.
- One logical change per branch; keep them focused and short-lived.
- `main` is the integration branch and must always be green (lint, typecheck,
  test, build). No direct commits to `main` for feature work — open a PR.

## Commit message format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) spec.
Commitlint enforces this automatically on every commit.

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`.

Examples:

```
feat(auth): add OAuth2 login flow
fix(api): handle 429 rate-limit response
chore(deps): bump vite to 8.1.0
```

## Pre-commit hooks

The following checks run automatically on `git commit` via Husky + lint-staged:

1. **Biome check** — lint + format check on staged `*.{ts,tsx,js,jsx,json,css}` files (no auto-fix; commit is rejected on failure).
2. **TypeScript** — `tsc -b` runs once whenever any `*.{ts,tsx}` file is staged.
3. **Commitlint** — the commit message is validated against Conventional Commits.

## Bypassing hooks

`git commit --no-verify` skips all hooks.

**This escape hatch is never acceptable on `main` or `develop`.** It exists only for
emergency situations (e.g. fixing a broken hook itself). Any use on protected branches
must be noted in the PR description and reviewed.

## State management

- **Server state** → TanStack Query. Never `useEffect`-fetch.
- **Global UI state** (theme, sidebar, global modals) → Zustand (`src/app/store/`).
- **Component-local state** → `useState`.
- **URL state** (filters, sort, pagination, active tab) → TanStack Router search params.

Redux is not used. `redux`, `@reduxjs/toolkit`, and `react-redux` imports are
blocked by a Biome `noRestrictedImports` rule.

## Accessibility

Biome's recommended a11y rule set is the automated gate — violations fail
`pnpm lint`. There is no ESLint/`jsx-a11y` layer and no runtime axe scan in CI
(both parked). Automated rules catch only a subset, so every PR is expected to:

- use semantic HTML (`<button>`, `<nav>`, `<main>`, headings in order);
- label every form field (`<label>`, or `aria-label` where no visible label);
- give every `<img>` a meaningful `alt` (empty `alt=""` for decorative images);
- keep interactive elements keyboard-reachable and focus-visible;
- not rely on color alone to convey meaning.

## Logging

Do not call `console.*` in shipped code — Biome's `noConsole` rule blocks it.
Use the `logger` shim (`src/shared/lib/logger.ts`): `logger.debug/info/warn/error`.
`debug`/`info` are no-ops outside development; `warn`/`error` always emit.

## Internationalization

- Strings live in `src/i18n/<locale>/<namespace>.json` (`en`, `fr`; one namespace
  per feature, seeded with `common`).
- Use `useTranslation('<namespace>')`. `en` is the source of truth for the key
  set — unknown keys fail typecheck via `src/i18n/i18next.d.ts`.
- `pnpm i18n:check` extracts keys and reports gaps. It is **warn-only** — it
  always exits 0, even when `fr` keys are missing, and CI does not gate on it.
  This is intentional while `fr` coverage catches up to `en`; flipping it to
  hard-fail is a follow-up ticket.
