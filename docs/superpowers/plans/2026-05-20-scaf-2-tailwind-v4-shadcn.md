# SCAF-2 — Tailwind v4 + shadcn/ui Scaffold — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire Tailwind v4 + shadcn/ui onto the SCAF-1 scaffold, with a `<Button>` smoke test rendering in the Saleshandy brand blue.

**Tech Stack:** Tailwind CSS v4, `@tailwindcss/vite`, shadcn/ui CLI, `clsx`, `tailwind-merge`, `class-variance-authority`.

**Builds on:** SCAF-1 (Vite 8 + React 19 + TS 6 + `@/` alias). Spec: `docs/superpowers/specs/2026-05-20-scaf-2-tailwind-v4-shadcn-design.md`.

**Verification:** build/preview gates — no unit tests (Vitest is SCAF-6).

---

## Task 1: Wire Tailwind v4

**Files:** modify `vite.config.ts`, `src/main.tsx`; create `src/styles/globals.css`; delete `src/index.css`.

- [ ] **Step 1: Install Tailwind v4**

```bash
pnpm add tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Add the Tailwind plugin to `vite.config.ts`**

Write `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths({ projects: ['tsconfig.app.json'] })],
})
```

- [ ] **Step 3: Create `src/styles/globals.css`**

```css
@import "tailwindcss";
```
(The shadcn token layer is added in Task 2; the reduced-motion guard in Task 3.)

- [ ] **Step 4: Point `main.tsx` at the new entry, delete `index.css`**

In `src/main.tsx` change the line `import '@/index.css'` to `import '@/styles/globals.css'`. Then:
```bash
rm src/index.css
```

- [ ] **Step 5: Verify the build**

```bash
pnpm build
```
Expected: exit 0. Tailwind's preflight reset appears in `dist/assets/*.css`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(scaf-2): wire Tailwind v4 via @tailwindcss/vite"
```

---

## Task 2: Initialize shadcn/ui + add Button

**Files:** create `components.json`, `src/shared/lib/utils.ts`, `src/shared/components/ui/button.tsx`, `.gitkeep` files; shadcn init also rewrites `src/styles/globals.css` with the token layer.

- [ ] **Step 1: Pre-create the shared directories**

```bash
mkdir -p src/shared/components/ui src/shared/lib src/shared/hooks
touch src/shared/components/ui/.gitkeep src/shared/hooks/.gitkeep
```

- [ ] **Step 2: Write `components.json`** (so the CLI runs non-interactively)

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
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 3: Run shadcn init**

```bash
pnpm dlx shadcn@latest init
```
The CLI reads `components.json`, installs `clsx` + `tailwind-merge` + `class-variance-authority`, writes `src/shared/lib/utils.ts` (`cn()`), and injects the shadcn token layer into `src/styles/globals.css`. If it prompts, accept the values already in `components.json`. If it reports a Tailwind-version mismatch, ensure the latest `shadcn` is used (v4-compatible).

- [ ] **Step 4: Add the Button component**

```bash
pnpm dlx shadcn@latest add button
```
Expected: `src/shared/components/ui/button.tsx` created.

- [ ] **Step 5: Verify**

Confirm these exist: `src/shared/lib/utils.ts`, `src/shared/components/ui/button.tsx`. Confirm `src/styles/globals.css` now contains `@import "tailwindcss"`, an `@custom-variant dark`, `:root`/`.dark` token blocks (OKLCH), and `@theme inline`. Run `pnpm typecheck` — expect exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(scaf-2): init shadcn/ui, add Button component"
```

---

## Task 3: Brand blue, `[data-theme]` dark mode, App wiring, ADR

**Files:** modify `src/styles/globals.css`, `src/App.tsx`; create `docs/adr/0003-theming.md`, `src/shared/components/ui/__smoke__.test.tsx`.

- [ ] **Step 1: Rewire dark mode + set the brand primary in `globals.css`**

Make exactly these edits to `src/styles/globals.css`:
1. Change the dark variant to target the data attribute:
   `@custom-variant dark (&:is([data-theme="dark"] *));`
2. Change the dark token block selector from `.dark {` to `[data-theme="dark"] {`.
3. In **both** the `:root` block and the `[data-theme="dark"]` block, set `--primary` and `--ring` to the Saleshandy blue. The generated file uses OKLCH; `#275df5` ≈ `oklch(0.555 0.225 261)`. Use the OKLCH form to match the file's format. Leave `--primary-foreground` as the generated near-white.

- [ ] **Step 2: Append the `prefers-reduced-motion` guard to `globals.css`**

Append at the end of the file:
```css
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

- [ ] **Step 3: Render the Button in `src/App.tsx`**

```tsx
import { Button } from '@/shared/components/ui/button'

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button>Saleshandy</Button>
    </main>
  )
}
```

- [ ] **Step 4: Create the smoke-test stub**

`src/shared/components/ui/__smoke__.test.tsx`:
```tsx
// Smoke-test placeholder for src/shared/components/ui.
// SCAF-6 wires Vitest and fills this in; the path is established now to avoid churn.
export {}
```

- [ ] **Step 5: Write the theming ADR**

Create `docs/adr/0003-theming.md` documenting the `[data-theme="dark"]` decision: context (shadcn defaults to `.dark`; the design-system spec wants `[data-theme]`), the decision (rewire via `@custom-variant`, tokens as CSS custom properties), and consequences (SCAF-9 adds a pre-paint theme-init script; primary `#275df5` is interim, Atoms #1 refines it). Status: Accepted, Date 2026-05-20, Ticket SAL-1825.

- [ ] **Step 6: Verify**

```bash
pnpm typecheck   # exit 0
pnpm build       # exit 0
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(scaf-2): brand-blue primary, [data-theme] dark mode, ADR"
```

---

## Task 4: Acceptance gate

- [ ] `pnpm install` → exit 0.
- [ ] `pnpm typecheck` → exit 0.
- [ ] `pnpm build` → exit 0; grep `dist/assets/*.css` for a Button utility class (e.g. `inline-flex`) — present.
- [ ] `pnpm preview --port 4173` (background) → `curl -s localhost:4173/` returns the page. Stop the server.
- [ ] Mark SAL-1825 done in Linear (controller does this).

## Self-Review

- AC coverage: Tailwind v4 via `@tailwindcss/vite` → Task 1; `globals.css` `@import "tailwindcss"` + token layer → Tasks 1–2; dark mode `[data-theme]` + ADR → Task 3; `components.json` → ui path → Task 2; `ui/` `.gitkeep`'d → Task 2; Button smoke test → Tasks 2–3; `prefers-reduced-motion` guard → Task 3; brand override (Decision 13) → Task 3 Step 1.
- No placeholders; shadcn-generated file contents are CLI output, verified by existence + typecheck.
