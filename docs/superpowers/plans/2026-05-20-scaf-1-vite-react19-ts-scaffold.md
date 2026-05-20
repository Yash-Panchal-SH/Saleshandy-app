# SCAF-1 — Vite 6 + React 19 + TypeScript-strict Scaffold — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a greenfield Vite 6 + React 19 SPA with strict TypeScript and pnpm, in `/Users/yashpanchal/Saleshandy/Saleshandy-app`, that passes `install → typecheck → build → preview`.

**Architecture:** Scaffold the official Vite `react-ts` template into a temp dir, relocate its files to the repo root (the existing `LINEAR_IMPORT_PLAN.md` + `rebuild-spec/` stay as docs), then tighten: pin pnpm/Vite 6/React 19, strip the template's ESLint, apply strict `tsconfig`, wire the `@/` path alias, and replace the demo with a minimal root.

**Tech Stack:** Vite 6, React 19, TypeScript ~5.7 (strict), pnpm (via corepack), `vite-tsconfig-paths`.

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
| `src/vite-env.d.ts` | Vite client ambient types (template default) |
| `public/vite.svg` | Favicon asset (template default, kept) |

Unchanged: `LINEAR_IMPORT_PLAN.md`, `rebuild-spec/`, `docs/`.

---

## Task 1: Scaffold the react-ts template into the repo root

**Files:**
- Create (from template): `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `public/`, `src/`

- [ ] **Step 1: Enable pnpm via corepack**

Run:
```bash
corepack enable pnpm && pnpm -v
```
Expected: prints a pnpm version (e.g. `10.x.y`) with no error.

- [ ] **Step 2: Scaffold the template into a temp directory**

Scaffolding into a fresh empty dir keeps the command non-interactive (no "directory not empty" prompt).

Run:
```bash
pnpm create vite scaffold-tmp --template react-ts
```
Expected: `scaffold-tmp/` created containing `package.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `src/`, `public/`, etc. Ends with a "Done. Now run:" message.

- [ ] **Step 3: Relocate generated files to the repo root, drop the temp dir**

Moves every generated entry (including dotfiles) except the template's generic `README.md`, then removes the temp dir.

Run:
```bash
find scaffold-tmp -mindepth 1 -maxdepth 1 ! -name README.md -exec mv {} . \;
rm -rf scaffold-tmp
```
Expected: no output; `scaffold-tmp/` gone.

- [ ] **Step 4: Verify expected files landed at the root**

Run:
```bash
ls -A package.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html .gitignore && ls src public
```
Expected: all files listed with no "No such file" error; `src` shows `main.tsx App.tsx index.css vite-env.d.ts` (and `App.css`, `assets/`); `public` shows `vite.svg`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(scaf-1): scaffold Vite react-ts template into repo root"
```

---

## Task 2: Finalize package.json — pin pnpm / Vite 6 / React 19, strip ESLint

**Files:**
- Modify: `package.json`
- Delete: `eslint.config.js`

- [ ] **Step 1: Overwrite `package.json` with the final dependency set**

The template's `package.json` ships newer Vite/ESLint. Replace it entirely — this pins **Vite 6** and **React 19**, sets the four scripts, and drops every ESLint dependency (Biome is the project linter, arriving in SCAF-4). The `packageManager` field is added by corepack in Step 3.

Write `package.json`:
```json
{
  "name": "saleshandy-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.7.3",
    "vite": "^6.3.5",
    "vite-tsconfig-paths": "^5.1.4"
  }
}
```

- [ ] **Step 2: Delete the template's ESLint config**

Run:
```bash
rm -f eslint.config.js
```
Expected: no output. (The ESLint *dependencies* were already dropped by the Step 1 overwrite.)

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

- [ ] **Step 5: Verify the pinned versions**

Run:
```bash
pnpm list react react-dom vite typescript @vitejs/plugin-react vite-tsconfig-paths
```
Expected: `react` and `react-dom` on `19.x`; `vite` on `6.x`; `typescript` on `5.7.x`; `vite-tsconfig-paths` on `5.x`.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml
git rm --cached --ignore-unmatch eslint.config.js
git add -A
git commit -m "chore(scaf-1): pin pnpm, Vite 6, React 19; remove template ESLint"
```

---

## Task 3: Strict TypeScript config + `@/` path alias

**Files:**
- Modify: `tsconfig.app.json`, `vite.config.ts`

- [ ] **Step 1: Overwrite `tsconfig.app.json` with strict options + the alias**

This sets every strictness flag the AC requires (kept compatible with TypeScript 5.7 — no `erasableSyntaxOnly`, which is 5.8+) and declares the `@/*` path mapping.

Write `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
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
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

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

- [ ] **Step 3: Run typecheck to verify the strict config compiles**

Run:
```bash
pnpm typecheck
```
Expected: exit code 0, no errors. (The template's `src/` still uses demo code at this point; it compiles cleanly under the strict flags. It is replaced in Task 4.)

- [ ] **Step 4: Commit**

```bash
git add tsconfig.app.json vite.config.ts
git commit -m "chore(scaf-1): strict tsconfig + @/ path alias via vite-tsconfig-paths"
```

---

## Task 4: Minimal root — `<StrictMode>` + placeholder page, strip demo content

**Files:**
- Modify: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `index.html`
- Delete: `src/App.css`, `src/assets/`

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

`src/App.css` and `src/assets/react.svg` are no longer referenced after Steps 1–2.

Run:
```bash
rm -rf src/App.css src/assets
```
Expected: no output.

- [ ] **Step 5: Update the document title in `index.html`**

Replace the line `<title>Vite + React + TS</title>` with:
```html
    <title>Saleshandy</title>
```
Leave the rest of `index.html` (the `/vite.svg` favicon link, `#root` div, `/src/main.tsx` script) unchanged.

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
- Vite 6 from `react-ts` template → Task 1, Task 2 Step 1
- React 19 + types → Task 2 Step 1
- `<StrictMode>` at `src/main.tsx` → Task 4 Step 1
- All 9 strict `tsconfig` flags + `target ES2022` + `moduleResolution bundler` → Task 3 Step 1
- `@/` → `src/` alias → Task 3 Steps 1–2
- `pnpm build` produces `dist/` → Task 5 Step 3
- Verification (`install`/`typecheck`/`build`/`preview`) → Task 5
- Decision-doc extras: ESLint stripped → Task 2 Steps 1–2; minimal root → Task 4.

**Placeholder scan** — no TBD/TODO; every code/config step shows full file content; every command shows expected output.

**Type consistency** — `App` is the default export of `src/App.tsx` (Task 4 Step 2) and imported as `@/App` in `src/main.tsx` (Task 4 Step 1). The `@/*` mapping (Task 3 Step 1) and `vite-tsconfig-paths` `projects: ['tsconfig.app.json']` (Task 3 Step 2) both reference the same `tsconfig.app.json`. Script names `typecheck`/`build`/`preview` (Task 2 Step 1) match every invocation in Tasks 3–5.
