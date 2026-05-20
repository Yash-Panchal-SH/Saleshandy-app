# Contributing

> **Note:** This file will be expanded in SCAF-25 with full contribution guidelines.

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
