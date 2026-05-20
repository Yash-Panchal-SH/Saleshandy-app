# ADR 0003 — Theming

**Status:** Accepted
**Date:** 2026-05-20
**Ticket:** SAL-1825

## Context

shadcn/ui initialises with a `.dark` CSS class selector and wires the Tailwind `dark:` variant via `@custom-variant dark (&:is(.dark *))`. However, `rebuild-spec/03-design-system.md` mandates that dark-mode activation is keyed on a `[data-theme="dark"]` HTML attribute rather than a class. Using an attribute avoids collisions with third-party libraries that toggle `.dark` for their own purposes, and it aligns with the pre-paint theme-init script planned for SCAF-9.

## Decision

1. Dark mode is keyed on the `data-theme` attribute on the `<html>` element (e.g. `<html data-theme="dark">`).
2. The Tailwind `dark:` variant is rewired via:
   ```css
   @custom-variant dark (&:is([data-theme="dark"] *));
   ```
3. The shadcn-generated `.dark { … }` token block is renamed to `[data-theme="dark"] { … }`.
4. All design tokens are expressed as CSS custom properties in OKLCH colour space (matching the shadcn v4 output format).
5. The Saleshandy brand blue `#275df5` is expressed as `oklch(0.555 0.225 261)` and applied as `--primary` and `--ring` in both the `:root` (light) and `[data-theme="dark"]` (dark) blocks.

## Consequences

- **SCAF-9** adds a pre-paint theme-init `<script>` that reads `localStorage` and sets `document.documentElement.dataset.theme` before first paint to avoid flash of unstyled theme. Until then, the `data-theme` attribute is toggled manually for testing.
- The primary colour `oklch(0.555 0.225 261)` (`#275df5`) is an interim value. Atoms Issue #1 will refine the full palette (additional semantic tokens, hover/active shades, surface colours) once the full design token audit is complete.
- Any component that relied on the shadcn default `.dark` class selector for dark-mode styles will not work until the attribute is set on `<html>`. This is intentional — no component should assume the `.dark` class.
