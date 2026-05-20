# SCAF-1 — Vite 8 + React 19 + TypeScript-strict Scaffold — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a greenfield Vite 8 + React 19 SPA with strict TypeScript and pnpm, in `/Users/yashpanchal/Saleshandy/Saleshandy-app`, that passes `install → typecheck → build → preview`.

**Architecture:** Scaffold the official Vite `react-ts` template into a temp dir, relocate its files to the repo root (the existing `LINEAR_IMPORT_PLAN.md` + `rebuild-spec/` stay as docs), then tighten: pin pnpm, strip the template's ESLint, apply strict `tsconfig`, wire the `@/` path alias, and replace the demo with a minimal root.

**Tech Stack:** Vite 8, React 19, TypeScript 6 (strict), pnpm (via corepack), `vite-tsconfig-paths`.

**Version note:** `pnpm create vite` now scaffolds Vite 8 + TypeScript 6. Per the approved decision (design doc decision #8) the rebuild keeps that current toolchain — the ticket's original "Vite 6 / TS 5.7" text predated these releases. This plan keeps the template's dependency versions and does **not** downgrade them.

**Note on verification:** This is infrastructure scaffolding — there is no unit-test suite yet (Vitest arrives in SCAF-6). Each task is verified by running build/typecheck commands and checking their output, which is the TDD-equivalent gate for this ticket.

**Linear:** [SAL-1824 · SCAF-1](https://linear.app/ikigaihq/issue/SAL-1824). Spec: `docs/superpowers/specs/2026-05-20-scaf-1-vite-react19-ts-scaffold-design.md`. Branch: `yash/sal-1824-scaf-1-vite-6-react-19-typescript-strict-scaffold-pnpm` (already checked out).

---

## File Structure

Created by this plan (at repo root):

| File | Responsibility |
|------|----------------|
| `package.json` | Deps, scripts, pinned `packageManager` + `engines` |
| `pnpm-lock.yaml` | Locked dependency graph |
| `index.html` | SPA entry document |
| `vite.config.ts` | Vite config — React plugin + tsconfig-paths plugin |
| `tsconfig.json` | Solution file — references the app + node configs |
| `tsconfig.app.json` | Strict compiler options for `src/`, `@/*` alias |
| `tsconfig.node.json` | Compiler options for `vite.config.ts` (template default) |
| `.gitignore` | Ignores `node_modules`, `dist`, build info (template default) |
| `src/main.tsx` | React 19 `<StrictMode>` root mount |
| `src/App.tsx` | Minimal placeholder root component |
| `src/index.css` | Minimal CSS reset (no Tailwind — that is SCAF-2) |
| `public/favicon.svg` | Favicon asset (template default, kept) |

The Vite 8 `react-ts` template declares Vite client ambient types via `"types": ["vite/client"]` in `tsconfig.app.json` — there is no `src/vite-env.d.ts` file.

Unchanged: `LINEAR_IMPORT_PLAN.md`, `rebuild-spec/`, `docs/`.

---

## Task 1: Scaffold the react-ts template into the repo root — ✅ DONE (commit `f11a898`)

**Files:** created the Vite `react-ts` template files at the repo root.

- [x] **Step 1: Enable pnpm via corepack** — `corepack enable pnpm` (pnpm 11.x available).
- [x] **Step 2: Scaffold into a temp dir** — `pnpm create vite scaffold-tmp --template react-ts` (non-interactive).
- [x] **Step 3: Relocate to repo root** — `find scaffold-tmp -mindepth 1 -maxdepth 1 ! -name README.md -exec mv {} . \;` then `rm -rf scaffold-tmp`.
- [x] **Step 4: Verify files landed** — root has `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `.gitignore`, `src/`, `public/`. (This template version generates `public/favicon.svg` + `public/icons.svg` and no `src/vite-env.d.ts` — expected variation.)
- [x] **Step 5: Commit** — `chore(scaf-1): scaffold Vite react-ts template into repo root`.

Both spec-compliance and code-quality reviews passed.

---

## Task 2: Finalize package.json — pin pnpm, fix scripts, strip ESLint, add vite-tsconfig-paths

**Files:**
- Modify: `package.json`
- Delete: `eslint.config.js`

This task does **not** change any dependency *version* — the template's Vite 8 / TypeScript 6 / React 19 versions are kept as-is. It only renames the package, sets `engines`, fixes the scripts, removes ESLint, and adds `vite-tsconfig-paths`.

- [ ] **Step 1: Edit `package.json`**

Read the current `package.json`, then apply exactly these changes (leave every dependency version string untouched):
- `"name"`: change `"scaffold-tmp"` → `"saleshandy-app"`.
- Add a top-level `"engines"` field: `"engines": { "node": ">=22" }`.
- `"scripts"`: remove the `"lint"` script; add `"typecheck": "tsc -b"`. The final `"scripts"` object must be exactly:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b",
    "preview": "vite preview"
  }
  ```
- `"devDependencies"`: delete every ESLint-related entry that is present — `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `typescript-eslint`. Leave all other devDependencies (`@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `typescript`, `vite`) untouched.

- [ ] **Step 2: Delete the template's ESLint config**

Run:
```bash
rm -f eslint.config.js
```
Expected: no output.

- [ ] **Step 3: Pin pnpm into `package.json` via corepack**

`corepack use` resolves `latest` to a concrete version and writes an accurate `"packageManager": "pnpm@x.y.z"` field — satisfying the "pnpm is canonical" AC without hardcoding a version.

Run:
```bash
corepack use pnpm@latest
```
Expected: `package.json` now contains a `"packageManager": "pnpm@..."` field.

- [ ] **Step 4: Install dependencies**

Run:
```bash
pnpm install
```
Expected: resolves successfully, creates `pnpm-lock.yaml` and `node_modules/`. Exit code 0.

- [ ] **Step 5: Add the `vite-tsconfig-paths` dev dependency**

Run:
```bash
pnpm add -D vite-tsconfig-paths
```
Expected: `vite-tsconfig-paths` added to `devDependencies`; exit code 0.

- [ ] **Step 6: Verify**

Run:
```bash
pnpm list react react-dom vite typescript vite-tsconfig-paths
```
Expected: `react` and `react-dom` on `19.x`; `vite` on `8.x`; `typescript` on `6.x`; `vite-tsconfig-paths` present. Then run `cat package.json` and confirm: no `eslint*` entries remain, the four scripts above are present, `name` is `saleshandy-app`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(scaf-1): pin pnpm, fix scripts, remove template ESLint"
```

---

## Task 3: Strict TypeScript config + `@/` path alias

**Files:**
- Modify: `tsconfig.app.json`, `vite.config.ts`, `.gitignore`

- [ ] **Step 1: Rewrite `tsconfig.app.json` with strict options + the alias**

Overwrite `tsconfig.app.json` with the content below. It keeps the template's existing options — crucially `"types": ["vite/client"]` (which provides the Vite ambient types in place of a `vite-env.d.ts` file) and `erasableSyntaxOnly` (valid on TypeScript 6) — and adds the `@/*` alias plus every strictness flag the AC requires.

Write `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

If `pnpm typecheck` later reports that `erasableSyntaxOnly` is an unknown option (i.e. the pinned TypeScript does not support it), remove that single line and re-run — it is not an AC requirement.

- [ ] **Step 2: Overwrite `vite.config.ts` to add the tsconfig-paths plugin**

`vite-tsconfig-paths` reads the `paths` mapping from `tsconfig.app.json` so the alias is defined exactly once. The `projects` option points it straight at the app config.

Write `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ['tsconfig.app.json'] })],
})
```

- [ ] **Step 3: Add `*.tsbuildinfo` to `.gitignore`**

Append a `*.tsbuildinfo` line to `.gitignore` (defensive — covers `tsBuildInfoFile` paths outside `node_modules/`). Skip if the line is already present.

- [ ] **Step 4: Run typecheck to verify the strict config compiles**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, no errors. (The template's `src/` still uses demo code at this point; it compiles cleanly under the strict flags. It is replaced in Task 4.)

- [ ] **Step 5: Commit**

```bash
git add tsconfig.app.json vite.config.ts .gitignore
git commit -m "chore(scaf-1): strict tsconfig + @/ path alias via vite-tsconfig-paths"
```

---

## Task 4: Minimal root — `<StrictMode>` + placeholder page, strip demo content

**Files:**
- Modify: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `index.html`
- Delete: `src/App.css`, `src/assets/`, `public/icons.svg`

- [ ] **Step 1: Overwrite `src/main.tsx`**

Mounts the app under `<StrictMode>`. Uses the `@/` alias and an explicit null check on the root element (the strict settings make `getElementById` return `HTMLElement | null` — no non-null assertion).

Write `src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import '@/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Overwrite `src/App.tsx` with a minimal placeholder**

Write `src/App.tsx`:
```tsx
export default function App() {
  return (
    <main>
      <h1>Saleshandy</h1>
      <p>UI rebuild scaffold — SCAF-1.</p>
    </main>
  )
}
```

- [ ] **Step 3: Overwrite `src/index.css` with a minimal reset**

No Tailwind — that is SCAF-2. Just enough to make the placeholder render sanely.

Write `src/index.css`:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html,
body,
#root {
  height: 100%;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Delete the template's demo assets**

`src/App.css`, the `src/assets/` folder, and the unused `public/icons.svg` sprite are no longer referenced after Steps 1–3.

Run:
```bash
rm -rf src/App.css src/assets public/icons.svg
```
Expected: no output. (`public/favicon.svg` is kept as the favicon.)

- [ ] **Step 5: Update `index.html`**

Change the document `<title>` to `Saleshandy`. Leave the favicon `<link>` (it points to `/favicon.svg`) and the `#root` div + `/src/main.tsx` script tag unchanged.

- [ ] **Step 6: Run typecheck to verify the new root compiles**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(scaf-1): minimal StrictMode root, strip Vite demo content"
```

---

## Task 5: Full acceptance-gate verification

**Files:** none modified — this task runs the SCAF-1 acceptance gate end to end.

- [ ] **Step 1: Clean install**

Run:
```bash
pnpm install
```
Expected: exit code 0; `pnpm-lock.yaml` unchanged (no diff).

- [ ] **Step 2: Typecheck**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, zero type errors.

- [ ] **Step 3: Build**

Run:
```bash
pnpm build && ls dist
```
Expected: exit code 0; `dist/` contains `index.html` and an `assets/` folder with hashed `.js`/`.css` files.

- [ ] **Step 4: Preview and confirm the root page serves**

Start the preview server in the background, request it, then stop it.

Run (start in background):
```bash
pnpm preview --port 4173
```
Then in a separate command:
```bash
curl -s http://localhost:4173/ | grep -E 'id="root"|<title>Saleshandy</title>'
```
Expected: the `curl` output contains both `<div id="root">` and `<title>Saleshandy</title>`.

Then stop the background preview server.

- [ ] **Step 5: Mark SCAF-1 done in Linear**

Update issue **SAL-1824** to status **Done** (via the Linear MCP `save_issue`, or manually in the Linear UI). Add a comment noting the four gate commands all passed.

---

## Self-Review

**Spec coverage** — every SCAF-1 AC maps to a task:
- pnpm canonical + `packageManager` pinned → Task 1 Step 1, Task 2 Step 3
- Vite (current major) from `react-ts` template → Task 1; versions kept from template (Task 2)
- React 19 + types → kept from template (Task 2 leaves them untouched)
- `<StrictMode>` at `src/main.tsx` → Task 4 Step 1
- All strict `tsconfig` flags + `target ES2022` + `moduleResolution bundler` → Task 3 Step 1
- `@/` → `src/` alias → Task 3 Steps 1–2
- `pnpm build` produces `dist/` → Task 5 Step 3
- Verification (`install`/`typecheck`/`build`/`preview`) → Task 5
- Decision-doc extras: ESLint stripped → Task 2 Steps 1–2; minimal root → Task 4.

**Placeholder scan** — no TBD/TODO; every code/config step shows full file content; every command shows expected output.

**Type consistency** — `App` is the default export of `src/App.tsx` (Task 4 Step 2) and imported as `@/App` in `src/main.tsx` (Task 4 Step 1). The `@/*` mapping (Task 3 Step 1) and `vite-tsconfig-paths` `projects: ['tsconfig.app.json']` (Task 3 Step 2) both reference the same `tsconfig.app.json`. Script names `typecheck`/`build`/`preview` (Task 2 Step 1) match every invocation in Tasks 3–5.
