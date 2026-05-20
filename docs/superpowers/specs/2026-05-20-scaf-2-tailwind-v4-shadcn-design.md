# SCAF-2 — Tailwind v4 + shadcn/ui Scaffold

- **Date:** 2026-05-20
- **Linear issue:** [SAL-1825 · SCAF-2](https://linear.app/ikigaihq/issue/SAL-1825/scaf-2-tailwind-v4-shadcnui-scaffold)
- **Project:** Project Scaffolding (Saleshandy UI Rebuild)
- **Status:** Approved — 2026-05-20

## Context

SCAF-2 builds on SCAF-1's output: a Vite 8 + React 19 SPA managed by pnpm via corepack,
strict TypeScript, and the `@/` → `src/` path alias via `vite-tsconfig-paths`. SCAF-1 left
`src/index.css` as a bare reset and explicitly deferred styling to this ticket.

SCAF-2 wires the styling substrate: Tailwind CSS v4 (CSS-first, no config file) and the
shadcn/ui copy-paste folder at `src/shared/components/ui/`. Every later Atoms / Molecules /
Organisms ticket writes components into that folder.

**Token strategy:** Stay on shadcn defaults for the *neutral* palette. The one approved
deviation: the **primary** token is set to the Saleshandy brand blue now (see Decision 13).
The full design-token system (color scales, typography, spacing, motion, z-index) lands in
Atoms Issue #1, which will refine the blue into a proper palette.

## Goal

A Vite build where Tailwind v4 utilities appear in the emitted CSS, `src/shared/components/ui/`
is wired for the shadcn CLI, and a `<Button>` smoke-test component renders with a visible
blue background — proving the chain Vite plugin → CSS tokens → shadcn component works.

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Tailwind v4 via the **`@tailwindcss/vite`** plugin (not PostCSS) | Official zero-config Vite integration for v4; no PostCSS config file. |
| 2 | CSS entry is **`src/styles/globals.css`**; `src/index.css` is **deleted** | AC names this path. `src/main.tsx` imports `@/styles/globals.css` directly — no redirector file. |
| 3 | Tailwind activated via **`@import "tailwindcss"`** in `globals.css` | v4 CSS-first activation — no `tailwind.config.js`, no `@tailwind` directives. |
| 4 | Dark mode keyed on **`[data-theme="dark"]`** on `<html>` | Matches AC + `03-design-system.md`. shadcn's v4 default `.dark` selector is rewired to `[data-theme="dark"]` via `@custom-variant`. Documented in `docs/adr/0003-theming.md`. |
| 5 | shadcn/ui initialized via the **shadcn CLI** (`pnpm dlx shadcn@latest init`) | Official path; emits `components.json` + `globals.css` token block + `cn()` util. |
| 6 | `components.json` `style` = **`radix-nova`** | shadcn CLI v4.7 superseded the classic `new-york`/`default` styles with the Radix/Nova preset; owner approved keeping the CLI's current baseline. |
| 7 | `components.json` `baseColor` = **`neutral`** | The Nova preset's base (achromatic grays). Atoms Issue #1 redefines the full palette regardless, so the neutral choice is transient. |
| 8 | UI components live at **`src/shared/components/ui/`**; `cn()` at **`src/shared/lib/utils.ts`** | Matches AC + `LINEAR_IMPORT_PLAN.md` App-Shared entry. |
| 9 | `clsx` + `tailwind-merge` are **runtime dependencies** | `cn()` composes them at runtime. |
| 10 | **One sample component: Button** | Proves the chain end to end. The rest arrive in Atoms. `src/shared/components/ui/` otherwise holds only `.gitkeep`. |
| 11 | **`prefers-reduced-motion` guard** as a global block in `globals.css` | AC + `14-frontend-principles.md`. |
| 12 | Theming ADR at **`docs/adr/0003-theming.md`** | AC requires it; `docs/adr/` is created by this ticket. |
| 13 | **Primary token = `#275df5`** (Saleshandy blue) — light, dark, and `--ring` overridden after `shadcn init`; `--primary-foreground` stays near-white for contrast | Per product owner: the app is blue-themed. Interim value — Atoms Issue #1 refines it into a full palette. Justified, owner-approved deviation from "shadcn defaults only". |

## Resolved minor decisions

- **`@tailwindcss/vite` / `tailwindcss` version:** caret range (`^4`), consistent with the rest of the manifest.
- **Smoke-test file:** `src/shared/components/ui/__smoke__.test.tsx` is an `export {}` stub (syntactically valid, typechecks; SCAF-6 fills it when Vitest lands).
- **ADR numbering:** `0003-theming.md` (avoids the `0001-biome-adoption.md` slot reserved by SCAF-4).
- **FOUC theme-init script:** not added — theme bootstrapping belongs to SCAF-9 (Zustand). Manual `[data-theme]` toggling works without it.
- **`src/shared/hooks/`:** created with a `.gitkeep` so the `components.json` `aliases.hooks` path resolves.

## Target layout

```
Saleshandy-app/
├── components.json                       shadcn CLI config
├── vite.config.ts                        + @tailwindcss/vite plugin
├── docs/adr/0003-theming.md              dark-mode strategy ADR
└── src/
    ├── main.tsx                          imports @/styles/globals.css (index.css deleted)
    ├── App.tsx                           renders <Button>
    ├── styles/globals.css                @import "tailwindcss" + token layer + reduced-motion guard
    └── shared/
        ├── components/ui/
        │   ├── .gitkeep
        │   ├── button.tsx                shadcn Button (smoke test)
        │   └── __smoke__.test.tsx         export {} stub
        ├── hooks/.gitkeep
        └── lib/utils.ts                  cn() = clsx + tailwind-merge
```

## globals.css shape

Current shadcn for Tailwind v4 emits `globals.css` with `@import "tailwindcss"`, an
`@custom-variant dark`, OKLCH token values under `:root` / the dark selector, and an
`@theme inline` mapping. SCAF-2 keeps that generated structure and makes exactly two
adjustments:

1. The dark variant targets `[data-theme="dark"]`, not `.dark`:
   `@custom-variant dark (&:is([data-theme="dark"] *));` and the dark token block selector
   becomes `[data-theme="dark"] { … }`.
2. `--primary` (light + dark) and `--ring` are set to the brand blue `#275df5` (in whatever
   color format the generated file uses — convert to OKLCH if so).

Plus the `prefers-reduced-motion` guard appended at the end.

## Verification (acceptance gate)

1. `pnpm install` — exit 0
2. `pnpm typecheck` — zero errors (`button.tsx`, `utils.ts` type-clean)
3. `pnpm build` — exit 0; `dist/assets/*.css` contains Tailwind output (e.g. grep a Button utility class)
4. `pnpm preview` — Button renders with a visible **blue** background
5. Manual: setting `data-theme="dark"` on `<html>` flips the background token

## Out of scope

Custom design-token system / full palette (Atoms #1) · full shadcn component set (Atoms #2+) ·
Storybook (Atoms) · Vitest + component tests (SCAF-6) · Lucide icons (Atoms) · font preloading
(SCAF-20) · Biome (SCAF-4) · env (SCAF-3) · router/query/state (SCAF-7+) · PostCSS &
`tailwind.config.js` (not used in v4 CSS-first).

## Risks & notes

- **shadcn CLI ↔ Tailwind v4:** the CLI must emit v4-compatible templates. The implementer
  verifies the generated `globals.css` uses `@import "tailwindcss"` (v4), not `@tailwind`
  directives (v3) — and adapts if the CLI version is stale.
- **Dark selector rewrite:** shadcn defaults to a `.dark` class; the AC mandates
  `[data-theme="dark"]`. Both the `@custom-variant` and the dark token block must be rewired.
- **Primary override:** must be applied in both the light `:root` and the dark token block,
  and to `--ring`, so focus rings match the brand.
