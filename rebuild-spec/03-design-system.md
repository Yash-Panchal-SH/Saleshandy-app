# Design System

## Color tokens
- Semantic: primary, secondary, danger, success, warning, info, neutral
- Scale per color: 10–12 steps (50/100/200…900/950)
- Light + dark mode (CSS variables, `prefers-color-scheme` + manual override)
- Surface tokens: background, foreground, muted, border, ring, popover, card
- Contrast-verified pairs documented per pair

## Typography
- Single primary sans family (Inter)
- Mono family for code / IDs
- Weights: 400 / 500 / 600 / 700
- Type scale: xs / sm / base / lg / xl / 2xl / 3xl / 4xl with paired line-heights
- Heading styles h1–h4 mapped to scale
- Text utilities: body / caption / label / overline

## Spacing
- One unified scale: 0 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 32 (4px base)
- Margin, padding, gap utilities aligned to scale

## Sizing
- Width / height tokens (sm / md / lg / xl / full / screen)
- Container max-widths per breakpoint

## Radius
- none / sm (2px) / md (4px) / lg (8px) / xl (12px) / 2xl (16px) / full

## Shadow / elevation
- xs / sm / md / lg / xl / 2xl
- Popover, dropdown, modal-specific shadows
- Focus ring

## Breakpoints
- sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536
- One consolidated scale (no ad-hoc 17-value list)

## Z-index scale
- base / dropdown / sticky / fixed / modal-backdrop / modal / popover / tooltip / toast (numbered tiers, single source of truth)

## Motion
- Duration tokens: instant (0ms) / fast (150ms) / base (200ms) / slow (300ms) / slower (500ms)
- Easing tokens: linear / in / out / in-out / spring
- `prefers-reduced-motion` honored everywhere

## Icons
- Single icon library (Lucide or equivalent)
- Brand / product illustrations as separate inline SVG set
- All icons accessible (`aria-hidden` or `aria-label`)

## Theming
- All tokens exposed as CSS custom properties on `:root` and `[data-theme="dark"]`
- Tailwind config maps to CSS variables (runtime theme switching without rebuild)

## Documentation
- Storybook with token reference page
- Auto-generated contrast matrix
- Component API docs (props, variants, slots) in Storybook
