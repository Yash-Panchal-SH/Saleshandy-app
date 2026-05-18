# Frontend Principles

Rules, anti-patterns, and quick-reference checklist for the rebuild. Adapted from the team Frontend Principles & Standards doc.

> **Cross-references:** Stack details → [07-global-setup.md](07-global-setup.md) · Design tokens → [03-design-system.md](03-design-system.md) · State patterns → [12-state.md](12-state.md) · Type rules → [13-type-safety.md](13-type-safety.md) · Components → [02-components.md](02-components.md) · UX patterns → [04-ux-patterns.md](04-ux-patterns.md)

---

## 1. Architecture Principles

### Colocation over separation
Feature components, hooks, schemas, types, and tests live in the same folder. No giant top-level `components/`, `styles/`, `utils/` dumps.

### Minimal client JavaScript
Every kilobyte shipped is a tax on the user. Aggressively code-split, lazy-load, and ask: "does this need to be interactive on the client?"

### URL as source of truth
Filters, pagination, search, active tabs, modal open/close → URL. Use TanStack Router's typed search params. Refresh shouldn't lose context.

### Composition over configuration
Headless primitives (Radix via shadcn/ui, TanStack Table, cmdk) over monolithic libraries. Our component layer is a thin extension of shadcn/ui — not a reinvention.

### Unidirectional data flow
Data flows down through props; actions flow up through callbacks. Passing props 2–3 levels is fine — don't reach for Context to skip 2 levels.

---

## 2. Performance Standards (Web Vitals) — CI-enforced

| Metric                              | Target          | What it measures                                 |
| ----------------------------------- | --------------- | ------------------------------------------------ |
| **LCP** (Largest Contentful Paint)  | < 2.0s          | How fast the main content loads                  |
| **INP** (Interaction to Next Paint) | < 150ms         | How responsive the page feels                    |
| **CLS** (Cumulative Layout Shift)   | < 0.05          | How much stuff jumps around                      |
| **FCP** (First Contentful Paint)    | < 1.2s          | Time to first visible content                    |
| **Initial Bundle**                  | < 150KB gzipped | JavaScript sent on first page load               |

Lighthouse CI + bundle-size gate enforce these on every PR (configured in App-Shared).

### How to hit them

**LCP** — preload critical assets, `<picture>` with WebP/AVIF + `srcset`, no lazy-loading for above-the-fold images, `fetchpriority="high"` on the LCP image.

**INP** — no heavy work on the main thread (Workers if needed), React 19 `useTransition` for non-urgent updates, `useDeferredValue` for expensive re-renders, virtualize lists >50 items (TanStack Virtual), debounce search 300ms, throttle scroll 100ms.

**CLS** — explicit `width`/`height` on images and videos, `aspect-ratio` for responsive media, `font-display: swap` with `size-adjust`, reserve space for dynamic content (skeletons, not spinners that change layout), never inject content above existing content after load.

**Bundle size** — code-split per route (TanStack Router handles this), dynamic import heavy libs, no barrel exports, run `vite-bundle-visualizer` monthly, question anything >50KB gzipped.

---

## 3. Interaction Design

### Click & touch targets
- Minimum touch target: **44×44px** (WCAG / Apple HIG)
- Use padding to enlarge hit area without changing visual size
- Minimum 8px gap between adjacent clickable elements

### States for every interactive element
| State          | Visual                                                                       |
| -------------- | ---------------------------------------------------------------------------- |
| Default        | Base styling                                                                 |
| Hover          | Subtle bg change or slight lift (desktop only)                               |
| Focus          | Visible focus ring (`ring-2 ring-ring ring-offset-2`). NEVER `outline: none` |
| Active         | Slight scale-down or darker shade                                            |
| Disabled       | `opacity-50`, `cursor-not-allowed`, remove hover                             |
| Loading        | Spinner inside, disabled click, no layout shift                              |

- Focus must meet 3:1 contrast vs surroundings
- Hover is desktop-only (Tailwind's `hover:` handles `@media (hover: hover)`)
- Loading buttons keep their text + add a spinner — no width change
- Never use a disabled submit button as the only form of validation feedback

### Timing & throttling

| Action                          | Timing                                                |
| ------------------------------- | ----------------------------------------------------- |
| Search input debounce           | 300ms                                                 |
| Autocomplete trigger            | 200ms after last keystroke                            |
| Scroll throttle                 | 100ms                                                 |
| Button click debounce           | Disable for 500ms after click (prevent double-submit) |
| Toast auto-dismiss              | 5s info/success; persistent for errors                |
| Transition (micro)              | 150ms (hover, focus)                                  |
| Transition (medium)             | 200–300ms (dropdowns, modals enter)                   |
| Transition (large)              | 300–500ms (page, accordion)                           |

### Drag & drop
- `@dnd-kit` only (lightweight, accessible, supports keyboard DnD)
- Always show a clear drop indicator
- Keyboard alternative (select + arrow keys to reorder)
- Mobile: 200ms long-press to initiate

### Scroll behaviour
- Pagination for tables / lists where exact navigation matters
- Infinite scroll for feeds, chat, timelines
- "Scroll to top" after 2+ viewports of infinite scroll
- Virtualize lists >50 items

---

## 4. Feedback & Status Communication

- **Loading**: skeleton for content (no layout shift), spinner for actions
- **Empty**: every list has an empty state with illustration + CTA
- **Error**: human-readable message + retry action
- **Optimistic updates**: for non-destructive actions, update UI immediately, rollback on failure
- **Toast** for transient, **banner** for persistent, **modal** for blocking

---

## 5. Code Standards

### Naming
| Thing            | Convention                  | Example                 |
| ---------------- | --------------------------- | ----------------------- |
| Components       | PascalCase                  | `LeadTable.tsx`         |
| Hooks            | camelCase, `use` prefix     | `useLeads.ts`           |
| Utilities        | camelCase                   | `formatCurrency.ts`     |
| Constants        | SCREAMING_SNAKE_CASE        | `MAX_FILE_SIZE`         |
| Types/Interfaces | PascalCase                  | `LeadFilters`           |
| Schema files     | kebab-case with `.schema`   | `lead.schema.ts`        |
| Route files      | kebab-case with `.route`    | `lead-detail.route.tsx` |
| CSS variables    | kebab-case                  | `--color-primary`       |

### File structure recap
See [07-global-setup.md](07-global-setup.md) for the canonical layout. Two rules:
- Features are self-contained (deletable without breaking siblings)
- No `utils.ts` / `helpers.ts` dumping ground

### Hard rules (enforced via lint)
- No `any` — use `unknown` and narrow
- No `useEffect` for data fetching, URL sync, derivations, or event handling
- No barrel exports
- Absolute imports only (`@/features/...`)
- No inline styles — Tailwind only
- No `console.log` in production code
- Max ~250 lines per component file; split if larger
- Every `eslint-disable` includes a justification

---

## 6. Anti-Patterns (What NOT to Do)

### ❌ Redux for everything
Most "state" is server cache → TanStack Query. URL state → search params. Zustand for the remaining truly global UI state. We have no Redux in the rebuild.

### ❌ CSS-in-JS with runtime
styled-components / Emotion add per-render overhead and inflate bundles. Tailwind v4 gives the same DX with zero runtime.

### ❌ Premature abstraction
Don't build `<GenericDataTable>` on day one. Build 3 specific tables first, see the real patterns, THEN extract.

### ❌ useEffect for everything
- Fetch data → TanStack Query
- Sync URL params → TanStack Router search params
- Derive values from state → `useMemo` or just compute in render
- Handle events → event handlers

### ❌ Over-memoizing
React 19's compiler handles most memoization. Don't add `useMemo` / `useCallback` without profiling.

### ❌ Giant component files
>250 lines = doing too much. Split components, extract hooks, break out utilities.

### ❌ Ignoring error states
Every data-fetching component handles loading, error, empty, success from the start.

### ❌ Copy-pasting API URLs
All API calls through a central client (`shared/lib/api.ts`) with base URL from env.

### ❌ Disabling lint without justification
Every `eslint-disable` includes a reason. "It works" is not a reason.

---

## 7. Before & After

### Data fetching
```ts
// Before
useEffect(() => {
  fetch('/api/leads').then(r => r.json()).then(setLeads);
}, []);

// After
const { data: leads, isLoading, error } = useQuery({
  queryKey: ['leads'],
  queryFn: () => api.get('/leads'),
});
```

### URL state
```ts
// Before
const [status, setStatus] = useState('all');

// After (TanStack Router search params)
const { status } = Route.useSearch();
const navigate = Route.useNavigate();
```

### Color tokens
```tsx
// Before
<button className="bg-[#2563eb] text-white">Save</button>

// After
<button className="bg-primary text-primary-foreground">Save</button>
```

### Component size
```tsx
// Before: 400+ lines mixing fetch + table + modals + filters
function LeadsPage() { /* ... */ }

// After
function LeadsPage() {
  const { data, isLoading } = useLeads();
  return <LeadsTable data={data} isLoading={isLoading} />;
}
```

---

## 8. Quick Reference Checklist (pre-PR)

- [ ] All interactive elements have hover, focus, active, disabled states
- [ ] Loading, error, empty states handled for every data-fetching component
- [ ] No raw hex colours — design tokens everywhere
- [ ] No `useEffect` for data fetching
- [ ] No `any` types without justification
- [ ] Touch targets ≥ 44×44px
- [ ] Keyboard navigation works through the entire flow
- [ ] Tested at 375px width (mobile minimum)
- [ ] Colour contrast meets WCAG AA (4.5:1 for text)
- [ ] No layout shift during loading
- [ ] Error messages human-readable and actionable
- [ ] Bundle impact reasonable (check analyzer)
- [ ] Dark mode works (where applicable)
