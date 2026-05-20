# ADR 0001 — Adopt Biome for Lint + Format

**Status:** Accepted
**Date:** 2026-05-20
**Ticket:** SCAF-4

---

## Context

The Saleshandy UI rebuild (SCAF-1 onwards) starts with a clean Vite 8 + React 19 + TypeScript 6 scaffold.
ESLint and Prettier were deliberately stripped from the initial scaffold to avoid the dual-tool setup cost
and the friction of keeping ESLint plugins, Prettier plugins, and their configs in sync.

We need a single, fast, opinionated tool that covers:
- Formatting (tabs/spaces, quote style, semicolons, trailing commas, line width)
- Linting (correctness, suspicious patterns, explicit `any`, unused vars/imports)
- Import organising (deterministic import order, no double work)

## Decision

Adopt **Biome** (v2.x) as the sole lint + format tool.

### Rationale

| Criterion | Biome | ESLint + Prettier |
|---|---|---|
| Single install | yes — `@biomejs/biome` only | no — separate packages + plugins |
| Speed | ~10-100x faster (Rust-native) | slower, especially on cold JS workers |
| Native TS/JSX | yes, first-class | requires `@typescript-eslint/*` + parser config |
| Import sorting | built-in (`assist.actions.source.organizeImports`) | needs `eslint-plugin-import` or separate `prettier-plugin-organize-imports` |
| Config surface | single `biome.jsonc` | `eslint.config.js` + `.prettierrc` + multiple plugins |
| IDE integration | official VS Code / JetBrains extensions | widespread |

Biome's speed matters at commit time (lint-staged) and in CI. The reduced config surface lowers the
barrier for contributors and avoids the "which plugin owns this rule" ambiguity.

### Config summary (`biome.jsonc`)

- `formatter.indentStyle: "space"`, `indentWidth: 2`, `lineWidth: 100` — matches existing code style
- `javascript.formatter.quoteStyle: "single"`, `semicolons: "asNeeded"` — matches existing code style
- `linter.rules.recommended: true`
- `suspicious.noExplicitAny: "error"` — explicit `any` is banned (TypeScript strict is already on)
- `correctness.noUnusedVariables / noUnusedImports: "error"` — enforced at lint time, not only tsc
- `css.parser.tailwindDirectives: true` — required for Tailwind v4 `@theme`, `@apply`, `@custom-variant`
- `assist.actions.source.organizeImports: "on"` — deterministic import order on `check --write`

## Accessibility (a11y) rule gap

Biome ships an `a11y` rule group (e.g. `useAltText`, `useHtmlLang`, `useAriaProps`), but it is
**narrower** than `eslint-plugin-jsx-a11y` in some areas:

- `useButtonType` is disabled in this project because shadcn/ui's `Button` component uses an `asChild`
  prop that delegates rendering to a `Slot` (from `radix-ui`). When `asChild` is true the rendered
  element is not a `<button>` at all (e.g. it may be an `<a>`), so requiring `type` would be incorrect.
  Biome cannot see through the Slot abstraction. Tracked in **SCAF-18** which will revisit the full
  a11y strategy (possibly adding a purpose-built a11y linting pass).

## Secret scanning gap

Biome does not scan for secrets (API keys, `*_SECRET`, `*_PRIVATE_KEY`, etc.). This is deferred to a
later ticket that will likely integrate `gitleaks` as a pre-commit hook or CI step. Do not store secrets
in source files in the interim.

## Consequences

- `pnpm lint` → `biome check .` (lint + format check + import order)
- `pnpm format` → `biome format --write .` (format only, no lint changes)
- `pnpm exec biome check --write .` — apply all safe fixes (lint + format + import order)
- No ESLint or Prettier packages in `package.json`
- SCAF-18 revisits the a11y rule gap
- Secret scanning deferred (likely `gitleaks`, future ticket)
