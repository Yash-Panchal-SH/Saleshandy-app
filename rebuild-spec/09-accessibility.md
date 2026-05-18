# Accessibility

## Standards
- WCAG 2.2 AA baseline
- Contrast verified per token pair

## Linting / testing
- `eslint-plugin-jsx-a11y` in ESLint config
- `jest-axe` / `axe-core` in unit + component tests
- Playwright + `@axe-core/playwright` for e2e a11y scans
- Storybook a11y addon

## Semantics
- Native HTML elements first (`<button>`, `<a>`, `<nav>`, `<main>`)
- Headings in order (h1 → h2 → h3)
- Landmarks on every page (`<main>`, `<nav>`, `<aside>`, `<footer>`)
- Form labels associated via `htmlFor` / `aria-labelledby`

## Keyboard
- Every interactive element keyboard-reachable
- Tab order matches visual order
- Focus visible (custom ring token, no `outline:none` without replacement)
- Focus trap inside modals / drawers
- Escape closes overlays
- Arrow keys for menus / lists

## ARIA
- `aria-modal` on modals
- `aria-expanded` on disclosures
- `aria-current` on active nav
- `aria-live` regions for toasts / async updates
- `aria-busy` during loading

## Skip links
- "Skip to content" link at top of every page
- Skip to navigation where applicable

## Screen reader
- All icons have `aria-label` or `aria-hidden`
- Decorative images `alt=""`
- Informative images with descriptive alt
- Tables have captions + headers

## Motion
- `prefers-reduced-motion` honored for all transitions / animations
- No autoplay video / audio

## Color
- Never color-only for state (icons + text)
- Contrast 4.5:1 body / 3:1 large text

## Forms
- Errors announced via `aria-describedby`
- Required fields marked (`aria-required`)
- Helper text linked via `aria-describedby`
