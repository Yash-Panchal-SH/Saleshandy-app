# UX Patterns

## Layout
- App shell: collapsible sidebar + topbar + content area
- Responsive collapse (sidebar → drawer on mobile)
- Global status / alert overlay slot

## Navigation
- Tabs for in-page sections
- Stepper / wizard for multi-step flows
- Breadcrumbs for nested settings
- Command palette (⌘K) for global search + actions
- Keyboard shortcuts surfaced in `?` panel

## Forms
- Unified form pattern: react-hook-form + Zod schemas
- Inline validation, error messages below field
- Autosave for long forms (with toast confirmation)
- Wizard pattern for onboarding and multi-step setup
- Inline-edit primitive for table cells (built in Organisms — missing today)

## Data display
- One canonical table component (sort, filter, column reorder, column visibility, density, virtualized)
- Kanban for CRM stage views
- Card list for prospects / sequences
- Activity timeline for prospect / call history
- Empty state on every list (illustration + CTA)
- Loading state: skeleton for content, spinner for actions
- Error state with retry

## Pagination / data load
- Cursor-based pagination (preferred) with page-size selector
- Infinite scroll where stream-like (unified inbox, activity)
- Virtualized rows for 1k+ items

## Filtering & search
- Unified filter bar pattern: chips for active filters, clear-all, save-filter
- Global search via command palette
- Per-table column filters

## Feedback
- Single toast system (top-right by default)
- Banner (page-level, dismissible)
- Confirmation modal (single canonical version)
- Drawer for detail / edit-in-context flows
- Optimistic UI for fast actions, rollback on failure

## Permission / plan gating
- `<Gate permission="...">` wrapper
- Premium-feature indicator (lock icon + upgrade CTA)
- Plan-restricted modal / banner

## Onboarding
- First-run wizard
- In-app guided tours (Shepherd or equivalent)
- Empty-state CTAs that route into setup

## Error handling
- Error boundary with reload action
- Network failure banner
- 404 / 500 / maintenance / offline screens

## Drag & drop
- Single library (`@dnd-kit`) for column reorder, kanban, custom field reorder, sequence step reorder
- Keyboard-accessible reorder

## Bulk actions
- Multi-select with sticky bulk-action bar
- Confirm destructive bulk ops via single confirmation modal

## Notifications
- In-app notification center (bell icon, list, mark-read)
- Toast for transient, banner for persistent, modal for blocking
