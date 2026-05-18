# Components

Built on **shadcn/ui** (copy-paste, Radix primitives, we own the code). Custom-built only where shadcn doesn't cover — product-specific things like score widgets, credit indicator, dialer PIP, brand illustrations, and composed domain widgets. Tags below: `[shadcn]` = shipped by shadcn/ui · `[custom-on-radix]` = built on a Radix primitive shadcn doesn't ship · `[custom]` = built from scratch.

## Primitives
- Button `[shadcn]`
- Icon Button `[shadcn]` (Button variant)
- Checkbox `[shadcn]`
- Radio `[shadcn]` (RadioGroup)
- Switch / Toggle `[shadcn]`
- Input (text) `[shadcn]`
- Input number `[custom]`
- Textarea `[shadcn]`
- Select (single + multi) `[shadcn]` (multi = custom-on-shadcn)
- Combobox / Searchable select `[shadcn]` (Command-based)
- Date picker `[shadcn]` (Calendar + Popover)
- Date range picker `[shadcn]`
- Phone number input + country code picker `[custom]`
- Slider `[shadcn]`
- Avatar `[shadcn]`
- Badge `[shadcn]`
- Tag / Chip `[custom]`
- Link `[custom]`
- Divider `[shadcn]` (Separator)

## Layout
- Container `[custom]`
- Grid `[custom]`
- Stack (vertical + horizontal) `[custom]`
- Card `[shadcn]`
- Page header `[custom]`
- Section heading `[custom]`
- Sidebar `[custom]`
- Topbar `[custom]`
- Split pane `[custom]`
- Sticky / scroll container `[custom]`

## Navigation
- Tab group `[shadcn]`
- Horizontal menu / pill nav `[custom]`
- Breadcrumbs `[shadcn]`
- Stepper / wizard `[custom]`
- Command palette `[shadcn]` (Command + Dialog)
- Dropdown menu `[shadcn]`
- Context menu `[shadcn]`

## Overlay
- Modal `[shadcn]` (Dialog)
- Drawer (left / right / bottom) `[shadcn]` (Sheet)
- Popover `[shadcn]`
- Tooltip `[shadcn]`
- Confirmation dialog (single, unified version — not v1/v2/v3) `[shadcn]` (AlertDialog)
- Sheet `[shadcn]`

## Form-level
- Form provider (RHF + Zod — no Formik in new code)
- Form field wrapper (label + input + error + helper)
- Field array
- Multi-chip input
- Tag autosuggest (single canonical version)
- Inline autosuggest
- File uploader (single + multi + drag-drop)
- Password input + strength checklist
- Validation checklist (generic)
- Search input (with optional collapse)
- Spintax-aware input

## Data display
- Data table (TanStack Table v8 — sortable, filterable, column reorder via `@dnd-kit`, virtualized for >1k rows)
- Pagination
- Empty state (single canonical version)
- Kanban board (`@dnd-kit`)
- Card list
- Activity timeline
- Email preview / thread
- Attachment list
- Charts (line, bar, area, donut)
- Performance stats card
- Score widget (health / setup / writing / sequence — generic)
- Status badge / contact status tag
- Bulk action bar

## Feedback
- Toast (single canonical system — shadcn Sonner)
- Notification banner (info / warning / success / error)
- Alert `[shadcn]`
- Spinner
- Skeleton loader `[shadcn]`
- Progress bar (linear) `[shadcn]`
- Circular progress
- Loading bar (top-of-page)
- Error boundary fallback
- 404 / 500 / maintenance / offline page templates

## Routing / access
- Route guard wrappers (auth, protected, config)
- Lazy-load + retry wrapper

## Domain-specific (all `[custom]`)
- Credit / quota indicator
- Reward credits badge
- Upgrade plan banner
- Premium-feature gate badge
- Carousel (auth testimonials)
- Truncated text with tooltip
- Helpscout button
- Referral button
- Helmet / SEO wrapper
- 3D-secure card payment handler
- Dialer floating window (PIP)
- Video modal
- Onboarding modal
- Editor (email template — Tiptap or similar)
