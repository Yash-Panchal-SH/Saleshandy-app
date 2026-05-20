# SCAF-2 — Tailwind v4 + shadcn/ui Scaffold

- **Date:** 2026-05-20
- **Linear issue:** [SAL-1825 · SCAF-2](https://linear.app/ikigaihq/issue/SAL-1825/scaf-2-tailwind-v4-shadcnui-scaffold)
- **Project:** Project Scaffolding (Saleshandy UI Rebuild)
- **Status:** DRAFT — pending human brainstorming review

## Context

SCAF-2 builds directly on SCAF-1's output: a Vite 6 + React 19 SPA managed by pnpm via
corepack, with strict TypeScript and the `@/` → `src/` path alias wired through
`vite-tsconfig-paths`. SCAF-1 left `src/index.css` as a bare reset with no Tailwind — it
explicitly deferred styling to this ticket.

This ticket wires the styling substrate: Tailwind CSS v4 (CSS-first, zero runtime config
file) and the shadcn/ui copy-paste folder at `src/shared/components/ui/`. Every subsequent
Atoms / Molecules / Organisms ticket writes components into that folder.

**Token strategy (from ticket):** Stay on shadcn defaults in this issue. Custom design
tokens (color scales, typography, spacing, motion, z-index) land in the Atoms project
Issue #1. SCAF-2 does NOT define a custom token system — it only wires the infrastructure
that will hold those tokens later.

## Goal

A running Vite build in which Tailwind v4 utility classes appear in the emitted CSS, the
`src/shared/components/ui/` directory is correctly understood by the shadcn CLI, and a
single smoke-test component (`<Button variant="default">`) renders with Tailwind-generated
styles — proving the full chain (Vite plugin → CSS → shadcn component) works end to end.

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Tailwind v4 installed via **`@tailwindcss/vite`** plugin, not PostCSS | This is the official zero-config Vite integration for Tailwind v4; avoids a PostCSS config file entirely. |
| 2 | CSS entry file is **`src/styles/globals.css`** | The AC names this exact path. It replaces (or imports) `src/index.css`; `src/index.css` is kept as the mount-point but replaced to import globals. |
| 3 | Tailwind activated via **`@import "tailwindcss"`** directive inside `globals.css` | This is the Tailwind v4 CSS-first activation — no `tailwind.config.js`, no `@tailwind base/components/utilities` directives. |
| 4 | Dark-mode strategy: **`[data-theme="dark"]` attribute on `<html>`** | Matches AC, the design system spec (`03-design-system.md`), and the Atoms Issue #1 plan. Supports both `prefers-color-scheme` media query and manual override via JS. Documented in `docs/adr/0003-theming.md`. |
| 5 | shadcn/ui initialized via **`pnpm dlx shadcn@latest init`** | Official CLI path; produces `components.json` with all project-specific settings baked in. |
| 6 | `components.json` targets **`src/shared/components/ui/`** | Matches the AC verbatim and aligns with the LINEAR_IMPORT_PLAN.md entry for App-Shared ("shadcn/ui copy-paste at `shared/components/ui/`"). |
| 7 | `cn()` utility lives at **`src/shared/lib/utils.ts`** | shadcn CLI default; all components import from this single location. |
| 8 | `clsx` + `tailwind-merge` added as **runtime dependencies** | `cn()` composes these two; they are needed at runtime, not just in dev. |
| 9 | `src/shared/components/ui/` is **`.gitkeep`'d** after CLI init | The AC says no components are copied in the scaffold — they arrive in the Atoms project — so only `.gitkeep` lives there initially. The smoke-test `button.tsx` is the exception (one copy-in to prove the chain, then it stays as the seed). |
| 10 | **One sample component: Button** | Sufficient to prove the entire chain (Tailwind class generation → shadcn CSS variable mapping → component render). More components arrive in Atoms. |
| 11 | **`prefers-reduced-motion` guard** added as a global CSS block in `globals.css` | Required by AC and by `14-frontend-principles.md`; disables all transitions/animations at the CSS layer for users who opt out. |
| 12 | ADR for theming written at **`docs/adr/0003-theming.md`** | AC requires it; `docs/adr/` does not exist yet and will be created by this ticket. |

## Target layout

```
Saleshandy-app/
├── src/
│   ├── styles/
│   │   └── globals.css                 @import "tailwindcss" + CSS-var layer + prefers-reduced-motion
│   ├── index.css                        now: @import "@/styles/globals.css" (or replaced entirely)
│   ├── shared/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── .gitkeep            present after init; button.tsx added for smoke test
│   │   │       └── button.tsx          shadcn Button, copied in to prove the pipeline
│   │   └── lib/
│   │       └── utils.ts                cn() = clsx + tailwind-merge
│   ├── App.tsx                         updated: renders <Button variant="default">
│   └── main.tsx                        unchanged from SCAF-1
├── components.json                     shadcn CLI config
├── vite.config.ts                      updated: @tailwindcss/vite plugin added
├── docs/
│   └── adr/
│       └── 0003-theming.md             dark-mode strategy ADR
└── src/shared/components/ui/__smoke__.test.tsx   (placeholder path for smoke test — Vitest arrives in SCAF-6)
```

**Note on `__smoke__.test.tsx`:** The AC verification command references
`pnpm test src/shared/components/ui/__smoke__.test.tsx` but Vitest is wired in SCAF-6.
SCAF-2 creates this file as a clearly-commented stub (empty `describe` block) so the path
is correct when SCAF-6 wires Vitest. The build + manual preview gates are the operative
SCAF-2 acceptance tests.

## CSS-first config

Tailwind v4 requires no `tailwind.config.js`. The entire configuration lives in CSS.
`globals.css` structure:

```css
/* 1. Activate Tailwind v4 (replaces @tailwind base/components/utilities) */
@import "tailwindcss";

/* 2. CSS-variable layer for future design tokens (populated in Atoms Issue #1) */
@layer base {
  :root {
    /* shadcn/ui default tokens — do not customise here; Atoms Issue #1 owns this */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... shadcn full default set ... */
    --radius: 0.5rem;
  }

  [data-theme="dark"] {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... shadcn dark defaults ... */
  }
}

/* 3. prefers-reduced-motion guard (AC requirement; 14-frontend-principles.md) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The `@layer base` block containing shadcn CSS variable defaults is not customisation — it
is the shadcn CLI's standard output from `init`. Custom tokens from the design system spec
(color scales, typography scale, motion tokens, z-index tiers, etc.) are added in Atoms
Issue #1.

## shadcn/ui `components.json`

Key fields:

| Field | Value | Notes |
|-------|-------|-------|
| `style` | `"new-york"` | shadcn's current default; open question — see below |
| `rsc` | `false` | SPA, no React Server Components |
| `tsx` | `true` | Project is TypeScript |
| `tailwind.css` | `"src/styles/globals.css"` | Points to the CSS entry |
| `tailwind.baseColor` | `"slate"` | shadcn default; Atoms will override |
| `tailwind.cssVariables` | `true` | Required — tokens are CSS variables, not hardcoded classes |
| `aliases.components` | `"@/shared/components"` | Maps to `src/shared/components/` via `@/` alias |
| `aliases.ui` | `"@/shared/components/ui"` | Where CLI copies UI components |
| `aliases.utils` | `"@/shared/lib/utils"` | Where `cn()` lives |
| `aliases.hooks` | `"@/shared/hooks"` | shadcn default hook location |
| `aliases.lib` | `"@/shared/lib"` | shadcn default lib location |

## `cn()` utility

`src/shared/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Smoke test component

`src/App.tsx` is updated to render the shadcn Button, making the end-to-end chain
testable by simply running `pnpm dev` or `pnpm build`:

```tsx
import { Button } from '@/shared/components/ui/button'

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button variant="default">Saleshandy</Button>
    </main>
  )
}
```

If the build succeeds and the button renders with a visible Tailwind background colour in
the browser, the chain is proven.

## Verification (acceptance gate)

```bash
pnpm build
# Tailwind classes appear in dist/assets/*.css — verified by grepping for "bg-primary" or
# any class used in the Button component

# Manual: open pnpm preview → button renders with background colour
# Manual: set data-theme="dark" on <html> in DevTools → background CSS variable flips

pnpm test src/shared/components/ui/__smoke__.test.tsx
# This passes trivially (empty describe block) until SCAF-6 wires Vitest.
# The path is established here so SCAF-6 can fill it in without path churn.
```

Full SCAF-2 gate:
1. `pnpm install` — exit 0, lock unchanged after install
2. `pnpm typecheck` — zero errors (button.tsx + utils.ts must be type-clean)
3. `pnpm build` — exit 0, `dist/assets/*.css` contains Tailwind output
4. `pnpm preview` — Button renders visibly styled at `localhost:4173`
5. Manual dark-mode toggle — CSS variable flips correctly

## Out of scope

Deliberately absent from SCAF-2 — handled by later tickets:

- **Custom design tokens** (color scales, typography, spacing, radius, motion, z-index) — Atoms Issue #1
- **Full shadcn component set** (Button, Input, Dialog, etc.) — Atoms Issue #2+
- **Dark-mode full parity** across all components — Atoms Issue #2+
- **Storybook setup** — Atoms project
- **Vitest / jest-axe / component tests** — SCAF-6 wires Vitest; Atoms adds per-component tests
- **Icon library (Lucide)** — Atoms icon system
- **Inter / WOFF2 font preloading** — SCAF-20 asset pipeline
- **Biome lint** — SCAF-4
- **Env management** — SCAF-3
- **Router, Query, Zustand** — SCAF-7+
- **PostCSS config** — not needed with `@tailwindcss/vite`
- **`tailwind.config.js`** — does not exist in Tailwind v4 CSS-first mode

## Risks & notes

- **`@tailwindcss/vite` stability:** Tailwind v4 is production-released (v4.0+ as of early
  2025); the Vite plugin is the official integration path. However the v4 API is newer than
  v3 and some shadcn component styles may reference v3-era Tailwind class names — verify
  the shadcn CLI version matches v4-compatible component templates.
- **shadcn CLI style choice (`new-york` vs `default`):** The two shadcn styles differ in
  border-radius and component density. `new-york` is the current default. This is flagged
  as an open question.
- **`__smoke__.test.tsx` stub:** The file must be syntactically valid TypeScript even
  without Vitest wired. Use a no-op comment block or empty export so `pnpm typecheck`
  passes. Actual test logic arrives in SCAF-6.
- **shadcn CSS variable defaults in `globals.css`:** The full shadcn default token set
  (all `--background`, `--foreground`, etc.) must be included for the Button to render
  correctly with `cssVariables: true`. The implementation plan includes the complete
  shadcn default block; it will be overwritten by Atoms Issue #1.

## Open questions for human review

1. **shadcn style: `"new-york"` vs `"default"`?** The two styles differ visually (radius,
   density). Which aligns with the Saleshandy design direction? This decision is baked into
   `components.json` and is hard to change later without re-copying all components.

2. **Exact CSS entry file path:** The AC specifies `src/styles/globals.css`. Should
   `src/index.css` be deleted and `main.tsx` updated to import `@/styles/globals.css`
   directly, or should `src/index.css` be kept and rewritten to `@import "./styles/globals.css"`?
   Both work; the plan currently proposes keeping `src/index.css` as a thin redirector.

3. **`__smoke__.test.tsx` stub format:** Should this be an empty TypeScript module
   (`export {}`) or a minimal Vitest-shaped `describe()` block with a no-op test? The
   latter is closer to the final shape but will require Vitest types in `tsconfig.app.json`
   before SCAF-6 wires Vitest.

4. **shadcn base color (`tailwind.baseColor`):** The AC does not specify. `"slate"` is the
   shadcn default and is used here. Atoms Issue #1 will replace the CSS variable values
   anyway, but the base color affects what shadcn generates into component files at copy
   time. Confirm or override.

5. **`@tailwindcss/vite` package version pin:** The plan uses `@tailwindcss/vite` at its
   latest stable release. Should a specific minor version be pinned in `package.json` for
   reproducibility, or is `^4.x` acceptable?

6. **`docs/adr/` numbering:** The theming ADR is proposed as `0003-theming.md`. Is
   `0001` and `0002` reserved, or should the first ADR be `0001`? No ADR directory exists
   yet — confirm the numbering convention before writing.

7. **`components.json` `aliases.hooks` and `aliases.lib`:** shadcn CLI expects
   `@/shared/hooks` and `@/shared/lib`. These directories do not exist yet in SCAF-1 output.
   Should SCAF-2 create them (as empty directories with `.gitkeep`) or let shadcn create
   them on first component add?

8. **More than one smoke-test component?** The AC mentions only Button. Should SCAF-2
   also copy in `badge.tsx` or `card.tsx` to stress-test the token chain? Or is Button
   sufficient as the one proof-of-concept?
