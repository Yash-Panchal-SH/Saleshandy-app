# SCAF-2 — Tailwind v4 + shadcn/ui Scaffold — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Tailwind CSS v4 (via `@tailwindcss/vite` plugin, CSS-first config) and seed the shadcn/ui copy-paste folder at `src/shared/components/ui/`, proving the full styling chain works by rendering a `<Button variant="default">` in a passing build.

**Architecture:** Add the `@tailwindcss/vite` Vite plugin, create `src/styles/globals.css` with `@import "tailwindcss"`, run the shadcn CLI to initialise `components.json`, create the `src/shared/lib/utils.ts` `cn()` utility, copy in the Button component as a smoke-test seed, update `App.tsx` to render it, and verify the build emits Tailwind-generated CSS.

**Tech Stack:** Tailwind CSS v4, `@tailwindcss/vite`, shadcn/ui (CLI + copy-paste), `clsx`, `tailwind-merge`, React 19, Vite 6.

**Note on verification:** Vitest is wired in SCAF-6. There is no unit-test suite yet. Each task is verified by running `pnpm typecheck` / `pnpm build` / manual preview. The `__smoke__.test.tsx` stub is created here so SCAF-6 can fill it in without path churn.

**Status:** DRAFT — pending human brainstorming review

**Linear:** [SAL-1825 · SCAF-2](https://linear.app/ikigaihq/issue/SAL-1825). Spec: `docs/superpowers/specs/2026-05-20-scaf-2-tailwind-v4-shadcn-design.md`. Branch: `yash/sal-1825-scaf-2-tailwind-v4-shadcnui-scaffold`.

---

## File Structure

Created or modified by this plan:

| File | Action | Responsibility |
|------|--------|----------------|
| `vite.config.ts` | Modify | Add `@tailwindcss/vite` plugin |
| `src/styles/globals.css` | Create | `@import "tailwindcss"` + CSS-var layer + reduced-motion guard |
| `src/index.css` | Modify | Replace body with `@import "./styles/globals.css"` |
| `src/shared/lib/utils.ts` | Create | `cn()` = clsx + tailwind-merge |
| `src/shared/components/ui/.gitkeep` | Create | Marks the directory for git |
| `src/shared/components/ui/button.tsx` | Create | shadcn Button component (smoke-test seed) |
| `src/shared/components/ui/__smoke__.test.tsx` | Create | Empty stub — filled in by SCAF-6 |
| `src/App.tsx` | Modify | Render `<Button variant="default">` |
| `components.json` | Create | shadcn CLI config |
| `package.json` | Modify | Add `@tailwindcss/vite`, `clsx`, `tailwind-merge` |
| `pnpm-lock.yaml` | Modify | Updated by `pnpm install` |
| `docs/adr/0003-theming.md` | Create | Dark-mode strategy ADR |

Unchanged: `LINEAR_IMPORT_PLAN.md`, `rebuild-spec/`, `tsconfig.*.json`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`.

---

## Task 1: Install Tailwind v4 + wire the Vite plugin

**Files:**
- Modify: `package.json`, `vite.config.ts`

### Why this order

The Vite plugin must be registered before any CSS is written; installing the package first
ensures `vite.config.ts` can be type-checked after it is updated.

- [ ] **Step 1: Install `@tailwindcss/vite` as a dev dependency**

Run:
```bash
pnpm add -D @tailwindcss/vite
```
Expected: `package.json` devDependencies gains `"@tailwindcss/vite": "^4.x.y"`; lock file updated; exit code 0.

- [ ] **Step 2: Verify the installed Tailwind version**

Run:
```bash
pnpm list @tailwindcss/vite tailwindcss
```
Expected: both resolve to `4.x.y` — confirming v4 is installed, not v3.

- [ ] **Step 3: Update `vite.config.ts` to add the Tailwind plugin**

Write `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({ projects: ['tsconfig.app.json'] }),
    tailwindcss(),
  ],
})
```

Note: `tailwindcss()` is listed after the React and tsconfig-paths plugins. Plugin order
does not strictly matter here but listing Tailwind last is consistent with the convention
in the official Tailwind v4 + Vite docs.

- [ ] **Step 4: Typecheck to confirm the updated config compiles**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, zero errors. (The `@tailwindcss/vite` package ships its own types.)

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts
git commit -m "chore(scaf-2): install @tailwindcss/vite plugin"
```

---

## Task 2: Create the global stylesheet with CSS-first Tailwind config

**Files:**
- Create: `src/styles/globals.css`
- Modify: `src/index.css`

- [ ] **Step 1: Create `src/styles/` directory and `globals.css`**

Create `src/styles/globals.css`:
```css
/* ============================================================
   Saleshandy — Global Stylesheet
   SCAF-2: Tailwind v4 CSS-first activation + CSS variable layer
   Token values (colors, typography, spacing, etc.) are populated
   in the Atoms project Issue #1. The variable names below are
   shadcn/ui defaults and serve as placeholders only.
   ============================================================ */

/* 1. Tailwind v4 activation (replaces @tailwind base/components/utilities) */
@import "tailwindcss";

/* 2. CSS-variable layer for shadcn/ui tokens (shadcn defaults — not customised here) */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  /* Dark mode: [data-theme="dark"] on <html>
     Supports both prefers-color-scheme and manual JS override.
     See docs/adr/0003-theming.md for the full decision record. */
  [data-theme="dark"] {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }

  /* Base body styles using CSS variables */
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}

/* 3. prefers-reduced-motion guard
   Required by SAL-1825 AC and rebuild-spec/14-frontend-principles.md.
   Disables all CSS transitions and animations for users who opt out. */
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

- [ ] **Step 2: Replace `src/index.css` to import the globals file**

Write `src/index.css`:
```css
/* Entry point CSS — imports the global stylesheet.
   src/main.tsx imports this file. */
@import "./styles/globals.css";
```

`src/main.tsx` already imports `@/index.css` from SCAF-1 — no change to `main.tsx` needed.

- [ ] **Step 3: Run a build to confirm Tailwind activates without errors**

Run:
```bash
pnpm build 2>&1 | head -30
```
Expected: Vite build completes, no error lines. The `dist/assets/*.css` file is created.

- [ ] **Step 4: Spot-check Tailwind output appears in the built CSS**

Run:
```bash
grep -r "box-sizing" dist/assets/*.css | head -5
```
Expected: at least one match — Tailwind's preflight reset includes `box-sizing: border-box`.

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/index.css
git commit -m "feat(scaf-2): CSS-first Tailwind v4 config with shadcn token layer + reduced-motion guard"
```

---

## Task 3: Install `clsx` + `tailwind-merge`, create the `cn()` utility

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `src/shared/lib/utils.ts`

- [ ] **Step 1: Install `clsx` and `tailwind-merge` as runtime dependencies**

Run:
```bash
pnpm add clsx tailwind-merge
```
Expected: both appear in `dependencies` (not devDependencies) in `package.json`. Exit code 0.

- [ ] **Step 2: Verify installed versions**

Run:
```bash
pnpm list clsx tailwind-merge
```
Expected: `clsx` at `2.x` and `tailwind-merge` at `2.x` (both current major versions as of 2026).

- [ ] **Step 3: Create `src/shared/lib/` directory and `utils.ts`**

Create `src/shared/lib/utils.ts`:
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS class names, resolving conflicts via tailwind-merge.
 * Used by every shadcn/ui component and custom components throughout the app.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Typecheck to verify `utils.ts` is type-clean**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, zero errors.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/shared/lib/utils.ts
git commit -m "feat(scaf-2): add clsx + tailwind-merge; create cn() utility at src/shared/lib/utils.ts"
```

---

## Task 4: Initialise shadcn/ui CLI — `components.json` + directory structure

**Files:**
- Create: `components.json`
- Create: `src/shared/components/ui/.gitkeep`
- Create: `src/shared/hooks/.gitkeep` (shadcn CLI default hooks alias location)

### Why manual `components.json` instead of `pnpm dlx shadcn init`

The shadcn CLI interactive `init` command asks questions in a TTY prompt that is not
compatible with non-interactive agentic execution. Writing `components.json` directly and
creating the directories is the equivalent outcome. If a human runs `pnpm dlx shadcn@latest init`
interactively, they should match the values below.

- [ ] **Step 1: Create `components.json`**

Write `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/shared/components",
    "ui": "@/shared/components/ui",
    "utils": "@/shared/lib/utils",
    "hooks": "@/shared/hooks",
    "lib": "@/shared/lib"
  },
  "iconLibrary": "lucide"
}
```

Note: `tailwind.config` is intentionally empty (`""`) — Tailwind v4 has no config file.
This is the correct value for v4 projects per shadcn CLI documentation.

- [ ] **Step 2: Create the `ui/` directory with `.gitkeep`**

Run:
```bash
mkdir -p src/shared/components/ui && touch src/shared/components/ui/.gitkeep
```
Expected: no output; directory and `.gitkeep` created.

- [ ] **Step 3: Create the `hooks/` placeholder (satisfies shadcn alias)**

Run:
```bash
mkdir -p src/shared/hooks && touch src/shared/hooks/.gitkeep
```
Expected: no output.

- [ ] **Step 4: Typecheck to verify no new errors**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0. (`components.json` is not a TypeScript file; the new directories
contain no TypeScript yet — typecheck should be identical to Task 3 Step 4.)

- [ ] **Step 5: Commit**

```bash
git add components.json src/shared/components/ui/.gitkeep src/shared/hooks/.gitkeep
git commit -m "feat(scaf-2): shadcn/ui components.json config + ui/ directory scaffold"
```

---

## Task 5: Copy in the Button smoke-test component

**Files:**
- Create: `src/shared/components/ui/button.tsx`
- Modify: `src/App.tsx`

The Button component is the shadcn "new-york" style Button for Tailwind v4. This is the
exact output of `pnpm dlx shadcn@latest add button` with the `components.json` above.
Including it verbatim in the plan removes any ambiguity about what the CLI would generate.

- [ ] **Step 1: Create `src/shared/components/ui/button.tsx`**

Write `src/shared/components/ui/button.tsx`:
```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

Note: this requires `@radix-ui/react-slot` and `class-variance-authority` as dependencies.
They are installed in Step 2.

- [ ] **Step 2: Install `@radix-ui/react-slot` and `class-variance-authority`**

Run:
```bash
pnpm add @radix-ui/react-slot class-variance-authority
```
Expected: both appear in `dependencies`. Exit code 0.

- [ ] **Step 3: Update `src/App.tsx` to render the Button**

Write `src/App.tsx`:
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

- [ ] **Step 4: Typecheck to verify Button + App compile cleanly**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, zero errors. All imports resolve: `@/shared/lib/utils` via the `@/`
alias, `@radix-ui/react-slot` from `node_modules`, `class-variance-authority` from
`node_modules`.

- [ ] **Step 5: Build and verify Tailwind classes appear in emitted CSS**

Run:
```bash
pnpm build && grep -l "bg-primary\|inline-flex" dist/assets/*.css
```
Expected: exit code 0; at least one `dist/assets/*.css` file is listed — confirming
Tailwind scanned `button.tsx` and emitted the utility classes used there.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/shared/components/ui/button.tsx src/App.tsx
git commit -m "feat(scaf-2): copy in shadcn Button smoke-test component; update App.tsx"
```

---

## Task 6: Smoke-test stub + theming ADR

**Files:**
- Create: `src/shared/components/ui/__smoke__.test.tsx`
- Create: `docs/adr/0003-theming.md`

- [ ] **Step 1: Create the smoke-test stub file**

This file establishes the path named in the AC verification command
(`pnpm test src/shared/components/ui/__smoke__.test.tsx`). Vitest is not yet wired
(SCAF-6), so the file must be valid TypeScript but contain no Vitest imports that would
cause `pnpm typecheck` to fail.

Write `src/shared/components/ui/__smoke__.test.tsx`:
```tsx
/**
 * SCAF-2 smoke-test stub.
 *
 * This file establishes the path expected by the SAL-1825 acceptance criteria:
 *   pnpm test src/shared/components/ui/__smoke__.test.tsx
 *
 * Vitest + Testing Library are wired in SCAF-6. Replace this stub with real
 * render tests for Button (and other seeded components) at that point.
 *
 * Expected SCAF-6 content:
 *   import { render, screen } from '@testing-library/react'
 *   import { Button } from './button'
 *
 *   describe('Button smoke test', () => {
 *     it('renders without crashing', () => {
 *       render(<Button variant="default">Click me</Button>)
 *       expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
 *     })
 *   })
 */

// Intentionally empty — stub only. See comment above.
export {}
```

- [ ] **Step 2: Typecheck to confirm the stub doesn't break anything**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0. The `export {}` makes it a valid TypeScript module with no imports.

- [ ] **Step 3: Create `docs/adr/` directory and write the theming ADR**

Run:
```bash
mkdir -p docs/adr
```

Write `docs/adr/0003-theming.md`:
```markdown
# ADR 0003 — Dark Mode Theming Strategy

- **Date:** 2026-05-20
- **Status:** Accepted
- **Deciders:** Yash Panchal (SCAF-2)
- **Related:** SAL-1825, rebuild-spec/03-design-system.md, Atoms Issue #1

## Context

The Saleshandy UI rebuild uses Tailwind CSS v4 and shadcn/ui. Both support dark mode.
We need to choose a single mechanism that:

1. Works with shadcn/ui's CSS variable system.
2. Supports manual user override (a "dark mode" toggle in settings).
3. Also respects `prefers-color-scheme` for first-visit default.
4. Does not require a full page reload when toggling.
5. Plays well with Tailwind v4's CSS-first config (no `darkMode: 'class'` in a JS config).

## Decision

Use the **`[data-theme="dark"]` attribute on the `<html>` element** as the dark mode
selector in CSS custom property declarations.

In `src/styles/globals.css`:
```css
:root { /* light tokens */ }
[data-theme="dark"] { /* dark tokens */ }
```

A small JavaScript snippet (added to `index.html` as an inline `<script>` before the
React bundle) reads `localStorage.getItem('theme')` and falls back to
`window.matchMedia('(prefers-color-scheme: dark)').matches` to set
`document.documentElement.dataset.theme` before the first render — preventing flash of
incorrect theme (FOIT/FOIT-equivalent).

Zustand (wired in SCAF-9) exposes a `useTheme()` store that toggles this attribute and
persists the choice to `localStorage`.

## Alternatives considered

| Option | Why rejected |
|--------|--------------|
| Tailwind `dark:` class variant (`.dark` on `<html>`) | Requires `darkMode: 'class'` in `tailwind.config.js`, which does not exist in v4 CSS-first mode. Achievable via `@custom-variant` in CSS but adds boilerplate. |
| `prefers-color-scheme` media query only | Cannot support a manual user toggle without a rebuild or JS class swap. |
| CSS `color-scheme` property alone | Does not provide the granular token-level control shadcn requires. |

## Consequences

- Every shadcn component's CSS variables automatically flip when `data-theme="dark"` is
  set — no per-component dark-mode code required.
- Atoms Issue #1 fills in the actual dark-mode token values (currently shadcn defaults).
- The Zustand theme store (SCAF-9) is the runtime controller of this attribute.
- The inline `<script>` in `index.html` must be kept synchronous (no `defer`, no `async`)
  to avoid FOUC.
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/ui/__smoke__.test.tsx docs/adr/0003-theming.md
git commit -m "docs(scaf-2): smoke-test stub + ADR 0003 dark-mode theming strategy"
```

---

## Task 7: Full acceptance-gate verification

**Files:** none modified — this task runs the SCAF-2 acceptance gate end to end.

- [ ] **Step 1: Clean install**

Run:
```bash
pnpm install
```
Expected: exit code 0; `pnpm-lock.yaml` unchanged (no new deps, no version drift).

- [ ] **Step 2: Typecheck**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, zero type errors. All files added in Tasks 1–6 must be type-clean.

- [ ] **Step 3: Build and verify Tailwind CSS output**

Run:
```bash
pnpm build && ls dist/assets/
```
Expected: exit code 0; `dist/assets/` contains at least one `.css` file and at least one
`.js` file.

Then verify Tailwind classes appear in the built CSS:
```bash
grep -q "bg-primary\|inline-flex\|box-sizing" dist/assets/*.css && echo "PASS: Tailwind classes found in built CSS"
```
Expected: `PASS: Tailwind classes found in built CSS`.

- [ ] **Step 4: Manual preview — Button renders styled**

Run in background:
```bash
pnpm preview --port 4173
```
Then open `http://localhost:4173/` in a browser.

Expected:
- A button labelled "Saleshandy" is visible and centred on the page.
- The button has a dark background and white text (the default `bg-primary text-primary-foreground` tokens from globals.css).
- No console errors.

Stop the preview server.

- [ ] **Step 5: Manual dark-mode toggle**

With the preview server still running (or after restarting):
1. Open DevTools → Console.
2. Run: `document.documentElement.dataset.theme = 'dark'`
3. Observe: page background flips to dark (CSS variable `--background` flips from `0 0% 100%` to `222.2 84% 4.9%`).
4. Run: `delete document.documentElement.dataset.theme`
5. Observe: page returns to light mode.

Expected: both flips happen instantly without reload.

- [ ] **Step 6: Verify AC checklist completeness**

Check each AC item from SAL-1825:

| AC item | Verified by |
|---------|-------------|
| Tailwind v4 installed via `@tailwindcss/vite` | Task 1 Step 1–2 |
| `src/styles/globals.css` has `@import "tailwindcss"` + CSS-variable layer | Task 2 Step 1 |
| Dark-mode strategy `[data-theme="dark"]` documented in `docs/adr/0003-theming.md` | Task 6 Step 3 |
| shadcn/ui CLI initialized; `components.json` points at `src/shared/components/ui/` | Task 4 Step 1 |
| `src/shared/components/ui/` exists and is `.gitkeep`'d | Task 4 Step 2 |
| `<Button variant="default">` renders and styles correctly | Task 5 Step 3, Task 7 Step 4 |
| `prefers-reduced-motion` global CSS guard included | Task 2 Step 1 |

- [ ] **Step 7: Mark SCAF-2 done in Linear**

Update issue **SAL-1825** to status **Done** (via the Linear MCP `save_issue`, or manually
in the Linear UI). Add a comment noting all AC items passed.

---

## Self-Review

**Spec coverage** — every SAL-1825 AC maps to a task:
- `@tailwindcss/vite` plugin → Task 1
- `src/styles/globals.css` + `@import "tailwindcss"` + CSS-variable layer → Task 2 Step 1
- Dark-mode `[data-theme="dark"]` + ADR → Task 2 Step 1, Task 6 Step 3
- `components.json` pointing to `src/shared/components/ui/` → Task 4 Step 1
- `src/shared/components/ui/` `.gitkeep`'d → Task 4 Step 2
- `<Button variant="default">` smoke-test → Task 5
- `prefers-reduced-motion` guard → Task 2 Step 1

**Placeholder scan** — no TBD/TODO in commands or file contents; every write step shows
full file content; every command shows expected output.

**Type consistency** — `cn()` exported from `@/shared/lib/utils` (Task 3 Step 3) and
imported in `button.tsx` (Task 5 Step 1) via the same alias. `@/` maps to `src/` via
`vite-tsconfig-paths` pointing at `tsconfig.app.json` (unchanged from SCAF-1). The
`components.json` `aliases.ui` field (`@/shared/components/ui`) matches the actual
directory created in Task 4 Step 2.

---

## Open questions for human review

1. **shadcn style: `"new-york"` vs `"default"`?** Written as `"new-york"` (current shadcn
   default). If the team prefers the `"default"` style, change `components.json` before
   copying any components — this choice propagates to every component added by the shadcn
   CLI later.

2. **`src/index.css` vs deleting it entirely:** The plan keeps `src/index.css` as a
   one-line redirector (`@import "./styles/globals.css"`). Alternatively, `src/index.css`
   could be deleted and `src/main.tsx` updated to `import '@/styles/globals.css'` directly.
   Either works; the current choice minimises changes to SCAF-1 output.

3. **`__smoke__.test.tsx` stub format:** The stub uses `export {}` to be a valid TypeScript
   module. If SCAF-6's Vitest setup adds `@types/vitest` to `tsconfig.app.json` includes,
   the stub can be upgraded to a commented-out `describe()` block without a typecheck
   failure. Confirm whether to put a real (commented-out) test body in the stub now.

4. **shadcn `baseColor` (`"slate"`):** Used only at `shadcn add` time to generate Tailwind
   class names inside component files. Since Atoms Issue #1 will overwrite the CSS variable
   values anyway, `"slate"` is a safe default — but confirm this aligns with the intended
   primary palette direction.

5. **`@tailwindcss/vite` version pin:** The plan uses `pnpm add -D @tailwindcss/vite` which
   resolves to the latest `^4.x` and writes the semver range. Should this be pinned to an
   exact version (e.g. `"@tailwindcss/vite": "4.1.5"`) for strict reproducibility?

6. **ADR numbering:** `0003-theming.md` assumes `0001` and `0002` are reserved for SCAF-1
   decisions. If no prior ADRs exist, this should be `0001-theming.md`. Confirm the
   numbering convention with the team before this file is committed.

7. **Inline `<script>` for FOUC prevention:** The ADR references an inline script in
   `index.html` to set `data-theme` before React mounts. This script is NOT written in
   SCAF-2 (Zustand arrives in SCAF-9). A human reviewer should decide: is a placeholder
   note in `index.html` needed now, or is the FOUC acceptable until SCAF-9?

8. **`src/shared/hooks/.gitkeep`:** Created to satisfy the shadcn `aliases.hooks` path.
   No hooks live there yet. If the team prefers to create this directory only when the
   first hook is added, remove Step 3 from Task 4 and update `components.json` to point
   `hooks` at an alternative path.
