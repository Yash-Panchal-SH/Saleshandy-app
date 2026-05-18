# Linear Import Plan — Rebuild Spec → Projects (v2)

## Context

You have 12 placeholder projects in Linear's Backlog. After re-reading **all 13 files** in `/Users/yashpanchal/Saleshandy/saleshandy-webui/rebuild-spec/` and the **514-line `REBUILD_INVENTORY.md`**, the existing 12 do not cover the full feature surface — `REBUILD_INVENTORY.md` lists **30 feature modules** under `src/components/`. We need to add **10 more projects** to cover screens that have no home today (Tasks, Leads, Email Infra, Inbox Radar, Dialer, Templates, Inbox, Growth Hub, LinkedIn Automation, Agency).

**This iteration produces project-level structure only**, per your decision:
- No `Web -` prefix on project names.
- Each project's **description** carries the granular issue checklist (issues are NOT created in Linear yet — they will be split into real Linear issues in a later iteration once we tighten scope/AC per task).
- Iteration over multiple rounds — you explicitly trigger the MCP import.

---

## Final Project List — 22 Projects

Rename existing 12 (drop `Web -` prefix), create 10 new.

| # | Project | Status in Linear | Role |
|---|---------|------------------|------|
| 1 | **App-Shared** | rename | Foundation: build/lang/router/state/auth/observability/security |
| 2 | **Atoms** | rename | Design tokens + primitive components |
| 3 | **Molecules** | rename | Form composites + score widgets + credit/upgrade UI |
| 4 | **Organisms** | rename | Data table, kanban, modal, toast, editor, command palette |
| 5 | **Layout** | rename | Sidebar + topbar shell, route guards, error/system pages |
| 6 | **Auth** | rename | All public/unauthenticated screens + token flows |
| 7 | **Settings** | rename | 17-route `/settings/*` sub-router shell + every submodule |
| 8 | **Tasks** | **new** | `/tasks*` — task list + prospect-scoped tasks |
| 9 | **Prospect** | rename | CRM (table/kanban/list) + prospect detail |
| 10 | **Leads** | **new** | Leads v1, Lead Finder v2, CSV enrichment |
| 11 | **Email Infra** | **new** | Email accounts, email insights, domains, inframail IPs, email verifier |
| 12 | **Warmup** | rename | Email warmup config + analytics |
| 13 | **Inbox Radar** | **new** | Public shareable report + authenticated variant |
| 14 | **Dialer** | **new** | Call logs, call detail, phone numbers, number settings, PIP window |
| 15 | **Sequence** | rename | Campaign builder + nested settings + subsequence |
| 16 | **Templates** | **new** | Email template library |
| 17 | **Reports** | rename | Reports dashboard + charts + Email Insights cross-link |
| 18 | **Inbox** | **new** | Mailbox emails + Unified inbox + notification center |
| 19 | **Growth Hub** | **new** | `/growth-hub*` |
| 20 | **LinkedIn Automation** | **new** | `/linkedin-automation*` |
| 21 | **Billing** | rename | Upgrade plan, subscriptions, checkout (Stripe 3DS), email infra pay |
| 22 | **Agency** | **new** | Agency portal + Agency client management + white-label |

> The existing 12 projects in Backlog: `Web - App-Shared`, `Web - Organisms`, `Web - Molecules`, `Web - Atoms`, `Web - Layout`, `Web - Billing`, `Web - Settings`, `Web - Reports`, `Web - Prospect`, `Web - Sequence`, `Web - Warmup`, `Web - Auth`. Confirm whether to rename in-place or archive + recreate.

---

## Execution Order (Dependency Chart)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 — FOUNDATION                              ⬛ must ship first       │
│  ┌──────────────┐                                                         │
│  │ App-Shared   │  build/lang/router/state/auth/observability/security    │
│  └──────┬───────┘                                                         │
└─────────┼─────────────────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────────────────┐
│ PHASE 2 — DESIGN PRIMITIVES                                               │
│  ┌──────────────┐                                                         │
│  │ Atoms        │  Issue #1 = tokens (colors/typo/spacing/radius/...)     │
│  └──────┬───────┘                                                         │
└─────────┼─────────────────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────────────────┐
│ PHASE 3 — COMPOSITES                                                      │
│  ┌──────────────┐    ┌──────────────┐                                     │
│  │ Molecules    │───▶│ Organisms    │                                     │
│  └──────────────┘    └──────┬───────┘                                     │
└──────────────────────────────┼────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────────────┐
│ PHASE 4 — APP SHELL                                                       │
│  ┌──────────────┐                                                         │
│  │ Layout       │  sidebar/topbar/route guards/system pages               │
│  └──────┬───────┘                                                         │
└─────────┼─────────────────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────────────────┐
│ PHASE 5 — PERIMETER                                                       │
│  ┌──────────────┐                                                         │
│  │ Auth         │  login/signup/SSO/MFA/reset/invite/OAuth/checkout       │
│  └──────┬───────┘                                                         │
└─────────┼─────────────────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────────────────┐
│ PHASE 6 — FEATURE PODS (run in parallel by squad / business priority)     │
│                                                                           │
│  POD A — Settings core   │  POD B — Email lifecycle  │  POD C — Funnel    │
│  ┌────────────┐          │  ┌────────────┐           │  ┌────────────┐    │
│  │ Settings   │          │  │ Email Infra│           │  │ Tasks      │    │
│  └────────────┘          │  └─────┬──────┘           │  └─────┬──────┘    │
│                          │        ▼                  │        ▼           │
│                          │  ┌────────────┐           │  ┌────────────┐    │
│                          │  │ Warmup     │           │  │ Prospect   │    │
│                          │  └─────┬──────┘           │  └─────┬──────┘    │
│                          │        ▼                  │        ▼           │
│                          │  ┌────────────┐           │  ┌────────────┐    │
│                          │  │ Inbox Radar│           │  │ Leads      │    │
│                          │  └────────────┘           │  └────────────┘    │
│                                                                           │
│  POD D — Campaign        │  POD E — Engagement       │  POD F — Growth    │
│  ┌────────────┐          │  ┌────────────┐           │  ┌────────────┐    │
│  │ Templates  │          │  │ Inbox      │           │  │ Reports    │    │
│  └─────┬──────┘          │  └────────────┘           │  └────────────┘    │
│        ▼                 │  ┌────────────┐           │  ┌────────────┐    │
│  ┌────────────┐          │  │ Dialer     │           │  │ Growth Hub │    │
│  │ Sequence   │          │  └────────────┘           │  └────────────┘    │
│  └────────────┘          │  ┌────────────┐           │  ┌────────────┐    │
│                          │  │LinkedIn Aut│           │  │ Billing    │    │
│                          │  └────────────┘           │  └────────────┘    │
│                                                      │  ┌────────────┐    │
│                                                      │  │ Agency     │    │
│                                                      │  └────────────┘    │
└───────────────────────────────────────────────────────────────────────────┘
```

**Within Phase 6, suggested intra-pod order is annotated by the down-arrows.** Pods themselves run in parallel — assign by squad capacity / business priority.

---

## Spec → Project Cross-Reference

| Spec file | Primary owner | Secondary owners |
|---|---|---|
| `01-screens.md` | every feature project | — |
| `02-components.md` | Atoms / Molecules / Organisms | — |
| `03-design-system.md` | **Atoms (Issue #1)** | App-Shared (theming infra), Layout |
| `04-ux-patterns.md` | Organisms (table/kanban/wizard), Layout (shell), Inbox (notification center) | every feature project |
| `05-ai-tooling.md` | App-Shared (`.claude/`, `mcp.json`) | — |
| `06-docs.md` | App-Shared (docs/runbooks/ADRs), Atoms (Storybook) | — |
| `07-global-setup.md` | App-Shared | — |
| `08-observability.md` | App-Shared (infra) | every feature project (per-feature transactions / events) |
| `09-accessibility.md` | App-Shared (lint/test infra), Atoms (per-component a11y) | every UI project |
| `10-security.md` | App-Shared (CSP/headers/cookies) | Auth (token storage), Billing (3DS), Email Infra (file upload) |
| `11-assets.md` | App-Shared (image/font/SVG pipeline) | Atoms (icon registry) |
| `12-state.md` | App-Shared (TanStack Query + Zustand baseline) | every feature project (per-feature slice migration) |
| `13-type-safety.md` | App-Shared (tsconfig + codegen + Zod) | every feature project (per-feature schemas) |

`REBUILD_INVENTORY.md` → linked in every Project description as "source of truth".

---

## Per-Project Descriptions & Issue Lists

> Each block below is the **proposed content of the Linear Project description**. Issue lists are checklist-style for now — we will iterate to extract them into real Linear Issues later with acceptance criteria.

---

### 1 · App-Shared
*Foundation for every other project. Owns build tool, language settings, router, server state, auth, observability, security, asset pipeline, AI tooling, docs, CI/CD, Docker.*

**Sources:** spec §05, §06, §07, §08, §09 (infra), §10, §11, §12, §13 · inventory §5, §6, §7, §8, §10, §11, §12, §13.

**Issue checklist:**

Build, language, lint:
- Migrate CRA (react-scripts 4.0.3) → **Vite** (or Next.js if SSR is in scope)
- Upgrade React 16.13 → **React 19** (ReactDOM, types, StrictMode)
- TypeScript strict promotion: enable `strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`, `noImplicitOverride`; set `target: ES2022`, `moduleResolution: bundler`
- ESLint flat config — typescript-eslint, react, **jsx-a11y**, import
- Prettier (singleQuote, trailingComma=all, 2-space) — preserve
- Stylelint for remaining CSS/SCSS
- Husky pre-commit: lint-staged + typecheck + pretty-quick
- `@typescript-eslint/no-explicit-any` = error
- Secret-scanning lint rule for `*_SECRET` / `*_PRIVATE_KEY` / leaked tokens

Routing:
- Migrate **React Router v5 → TanStack Router** (file-based, typed routes)
- Route-level code splitting on every screen
- Auth/Protected/Config route guards rebuilt on TanStack Router middleware (`src/shared/components/{auth-route,protected-route,config-route}.tsx`)
- URL search-param state typed via **Zod** schemas
- Plan migration of the monolithic `Home` hub's 30+ eagerly-imported nested routes (`src/components/home/home.tsx`)

Server state:
- **TanStack Query** baseline (provider, devtools, default options)
- One `createApi`-equivalent per feature module — define convention
- Migrate **726 `createAsyncThunk` calls** → query/mutation (per-feature owned, App-Shared lays groundwork)
- Tag-based cache invalidation convention
- Optimistic update helper + rollback pattern
- WebSocket / polling helpers (for inbox + dialer)
- Cross-feature side-effect helper `invalidateTags([...])`

Client / UI state:
- **Zustand** baseline (devtools, persist helper)
- Migration plan: 55 Redux slices → Zustand (UI flags only) + TanStack Query (server-owned data)
- Decision matrix: when to use Zustand vs Context (>3 levels of prop drilling)
- Decommission `redux-toolkit` once last slice migrated (long-tail)

HTTP / auth:
- Fetch wrapper (or Axios 1.x) with interceptors, retry policy, AbortController, response unwrap
- Bearer token injection
- **Auth: HttpOnly + Secure + SameSite=Lax cookies** (replace sessionStorage Bearer tokens at `src/api.ts:22–30`, `src/shared/utils/token.ts`)
- Refresh token rotation + short-lived access tokens
- Single source of truth for `isAuthenticated`
- Open-redirect safe-list for all `returnUrl` (`src/shared/utils/auth-helper.ts`)

Provider tree (root, in order — replaces `src/root.tsx:21–37`):
1. Error boundary, 2. Redux Provider (legacy, removable later), 3. TanStack Query Provider, 4. Theme provider, 5. Router, 6. Auth provider, 7. Feature-flag provider, 8. Toast provider, 9. Modal/overlay portal root, 10. i18n provider, 11. App

Third-party:
- Sentry — errors + perf + replay (`src/index.tsx:43–67` — kept), add **source-map upload** in CI (`@sentry/cli` or `@sentry/vite-plugin`)
- **PostHog init** (deps present at `posthog-js 1.362.0` but no init found) + autocapture + user identify + feature-flag exposure
- Firebase 10 (keep — used by `src/components/firebase/`)
- Stripe.js (keep — `@stripe/stripe-js 1.22.0`)
- Intercom (`window.Intercom`)
- Twilio Voice SDK (used by Dialer)

Feature flags:
- **GrowthBook** (or LaunchDarkly) — typed flags, default-safe, gating hook + component wrapper

i18n:
- i18next + react-i18next upgrade — keep `en`/`fr`, extensible
- Namespaces per feature module
- Translation key linting

Env management:
- Per-target `.env` files in `config/` (existing — circinus/compass/orbit/etc.)
- Typed `import.meta.env` via `vite-env.d.ts`
- **Zod schema validates env at boot**, typed `env.ts` re-export
- No secrets in client bundle (CI lint rule)

Error boundary:
- Root-level Sentry ErrorBoundary (keep behavior from `error-boundary-wrapper.tsx` — DOM-mismatch auto-reload)
- Per-feature error boundaries for isolation
- Fallback UI with reload + report

Observability infra (spec §08):
- Web Vitals reporting (CLS/LCP/INP/FID/TTFB) → Sentry + PostHog (web-vitals 1.0.1 installed but inactive)
- Sentry Replay sampling tuning
- Custom transactions: app boot, route change, API call, form submit
- `performance.mark/measure` for critical user paths
- `PerformanceObserver` for long-tasks (>50ms)
- React Profiler (dev + prod-sampled)
- Bundle analyzer (`rollup-plugin-visualizer`) + per-PR size diff
- **Lighthouse CI** per PR (perf / a11y / best-practices / SEO)
- Structured client logger (pino-style), no raw `console.log` in shipped code
- Heartbeat ping + API status endpoint poll (for maintenance-mode UI)

Security (spec §10):
- **CSP** (strict, nonce-based) + HSTS + X-Content-Type-Options + X-Frame-Options + Referrer-Policy + Permissions-Policy
- DOMPurify-only for any `dangerouslySetInnerHTML` (current usage in `sanitize-rich-text.ts`)
- File upload: MIME allowlist + size limit + virus-scan hook
- Renovate / Dependabot for dependency bumps; `npm audit` / Snyk in CI; block on high-severity advisories
- Subresource Integrity (SRI) on third-party scripts
- Sentry `beforeSend` strips tokens / PII

Asset pipeline (spec §11):
- WebP/AVIF with PNG/JPG fallback; responsive `srcset`/`sizes` on every `<img>`
- Native `loading="lazy"` below the fold, `fetchpriority="high"` on LCP image
- Explicit `width`/`height` on every image (CLS guard)
- Font preload (`<link rel="preload" as="font" crossorigin>`), `font-display: swap`, WOFF2-only, subset Latin/Latin-Extended
- SVG sprite for repeated marketing illustrations (current `src/shared/svg/` = 186 per-file React components)
- Optimize SVGs via SVGO
- Hashed filenames + CDN (Cloudflare/CloudFront), Cache-Control 1y for hashed, no-cache for HTML
- Image CDN for user uploads

PWA (spec §07):
- Manifest (keep `public/site.webmanifest`)
- Service worker for offline shell + cache strategy
- Push notification registration

API contracts & runtime validation (spec §13):
- OpenAPI spec checked into `docs/api/openapi.yaml`
- Codegen (`openapi-typescript` or `orval`) wired into CI — drift fails build
- **Zod** for all external boundaries (API responses, URL params, forms, env)
- Zod-derived types via `z.infer` — single source of truth

a11y infra (spec §09 — per-component work belongs in Atoms/Molecules/Organisms):
- `eslint-plugin-jsx-a11y` in lint config
- `jest-axe` / `axe-core` in unit + component tests
- `@axe-core/playwright` for e2e a11y scans
- Storybook a11y addon (Atoms project owns Storybook setup)

CI / CD:
- Consolidate 5 GitHub Actions workflows + GitLab CI into one pipeline
- Stages: install → typecheck → lint → unit test → build → e2e (Playwright) → bundle size gate → Lighthouse → deploy
- Source map upload to Sentry per build
- Preview deploys per PR
- Asset budget gates

Docker:
- Multi-stage Node 22 → nginx 1.27 alpine (current Dockerfile uses node:14 + nginx:stable-alpine)
- Non-root user

Testing baseline (spec §07 / §09):
- **Vitest** (unit + component) + Testing Library 16+
- Playwright (e2e)
- `jest-axe` / `axe-core` for a11y
- MSW for API mocks
- Coverage gate: 70%+ for new code

AI tooling (spec §05):
- Migrate `.claude/agents/` (4 — code-reviewer, e2e-runner, spec-reviewer, task-coverage-reviewer)
- Migrate `.claude/commands/` (8 — sh-plan, debug, fix, e2e, address-pr, learn, review, verify)
- Migrate `.claude/rules/` (6 — coding-style, git-workflow, performance, react-patterns, skill-loading, testing)
- Migrate `.claude/skills/` (6 — capture-learnings, e2e-browser, frontend-design, frontend-testing, react-stack, shadcn-ui)
- Migrate `.cursor/` (5 rules + 1 skill — API-integration: curl → types/API/thunk/slice/UI)
- **Add root `mcp.json`** (Playwright, Figma, Linear, Basecamp) — currently absent
- Add Claude code review hook on PR open
- AI-assisted release notes generation

Docs (spec §06):
- README, CLAUDE.md (keep)
- **Add** CONTRIBUTING.md, CHANGELOG.md, LICENSE
- knowledge-base/ — keep 13 docs, refresh against new stack
- ADRs in `docs/adr/`
- Runbooks in `docs/runbooks/` — deploy, rollback, incident response
- Onboarding guide, troubleshooting guide
- Per-feature README in each `src/components/<feature>/`

---

### 2 · Atoms
*Design tokens + ~115 primitive components. Foundation for Molecules + Organisms + every UI project.*

**Sources:** spec §02 (Primitives / Layout / Feedback / Navigation primitives), §03 (entire file), §09 (per-component a11y) · inventory §2, §4.

**Issue checklist:**

**Issue #1 — Design tokens (gating)**:
- Color tokens: primary/secondary/danger/success/warning/info/neutral × 10–12 step scales (50–950); semantic mapping (primary=blue-6, danger=red-6, etc.) — port from `_custom-variable.scss:21–708`
- Surface tokens: background, foreground, muted, border, ring, popover, card
- **Dark mode** via CSS custom properties on `:root` + `[data-theme="dark"]` (`prefers-color-scheme` + manual override) — currently only `.sh-dark-mode` stub class exists
- Contrast-verified pairs documented per pair (WCAG 2.2 AA, 4.5:1 body / 3:1 large)
- Typography: Inter primary, mono for code/IDs; weights 400/500/600/700; type scale xs/sm/base/lg/xl/2xl/3xl/4xl with paired line-heights; h1–h4 mapped; utilities body/caption/label/overline (consolidate `.regular-*`, `.semibold-*`, `.font-*` raw classes)
- Spacing: unified 4px-base scale 0/1/2/3/4/5/6/8/10/12/16/20/24/32 — replace 17 ad-hoc media-query vars + `$mr-*` + `.gap-*` + BEM utilities
- Sizing: width/height tokens (sm/md/lg/xl/full/screen); container max-widths per breakpoint
- Radius: none/sm(2)/md(4)/lg(8)/xl(12)/2xl(16)/full
- Shadow/elevation: xs/sm/md/lg/xl/2xl + popover/dropdown/modal-specific + focus ring
- Breakpoints: consolidated sm640/md768/lg1024/xl1280/2xl1536 — replace 17-value list
- **Z-index scale**: base/dropdown/sticky/fixed/modal-backdrop/modal/popover/tooltip/toast (numbered) — replace scattered ad-hoc values
- **Motion**: duration tokens instant/fast(150)/base(200)/slow(300)/slower(500) + easing linear/in/out/in-out/spring + `prefers-reduced-motion` everywhere
- Tailwind config maps to CSS variables (runtime theme switching, no rebuild)

Storybook & docs:
- Storybook setup (replace Styleguidist `styleguide.config.js`)
- Token reference page + auto contrast matrix
- Component API docs (props, variants, slots, a11y notes)
- Visual regression (Chromatic or Loki)

Icon system:
- Pick single icon library (Lucide or equivalent)
- Icon registry exported from one entry; tree-shaken imports
- Brand / product illustrations as inline React SVG (keep current pattern)
- All icons `aria-hidden` or `aria-label`
- Migrate `src/shared/svg/` 186 per-file SVGs → registry + sprite for repeats

Form primitives:
- Button (Theme/Variant/Size enums — port from `atoms/button/` with a11y + tests)
- Icon Button
- Checkbox (port indeterminate support from `atoms/checkbox.tsx`)
- Radio
- Switch / Toggle (port `atoms/switch.tsx`)
- Input (text) — simplify the current 15-prop API (`components/input/`)
- Input number (`components/input-number/`)
- Textarea
- Select single + multi — simplify the current 20-prop API (`components/select/` Ant Design wrapper)
- Combobox / searchable select
- Date picker
- Date range picker
- Phone number input + country code picker
- Slider
- Password input (move detailed strength UI to Molecules)

Display primitives:
- Avatar (`atoms/avatar/`)
- Badge (`atoms/badge/`)
- Tag / Chip
- Link
- Divider

Layout primitives:
- Container
- Grid
- Stack (vertical + horizontal)
- Card
- Page header (Redux-backed currently — migrate to props)
- Section heading
- Split pane
- Sticky / scroll container

Overlay primitives (shells — composite logic lives in Organisms):
- Modal shell (add `aria-modal` + focus trap + Escape closes)
- Drawer (left / right / bottom) — currently **missing**, only modals exist
- Popover (`atoms/overlay/popover/`)
- Tooltip (`atoms/tooltip-wrapper/`)
- Sheet

Feedback primitives:
- Spinner (`atoms/spinner/`)
- Skeleton loader (`atoms/skeletons/`)
- Progress bar (linear)
- Circular progress (`atoms/circular-progressbar.tsx`)
- Loading bar (top-of-page) — port `src/shared/loading-bar/`

Navigation primitives:
- Tab group (`atoms/tab/`)
- Horizontal menu / pill nav (`atoms/horizontal-menu/`)
- Breadcrumbs
- Dropdown menu (`atoms/dropdown.tsx`)
- Context menu

Per-component a11y pass (each primitive issue includes):
- Native HTML element first
- Keyboard reachable, tab order, visible focus, Escape closes overlays, arrow keys for menus/lists
- `aria-*` per spec §09 (modal, expanded, current, live, busy)

Testing:
- Vitest + Testing Library + jest-axe per primitive
- Storybook a11y addon green

---

### 3 · Molecules
*Form composites + score widgets + credit/upgrade UI + truncated text. Built from Atoms.*

**Sources:** spec §02 (Form-level + Domain-specific) · inventory §4 (Form-level + Domain-specific).

**Issue checklist:**

Form composites:
- Form provider — **react-hook-form + Zod** (replace Formik 2.2, ~100+ forms)
- Form field wrapper (label + input + error + helper, `aria-describedby` wiring)
- Field array
- Multi-chip input (port `multi-chip-input` with focus management)
- **Tag autosuggest — single canonical version** (collapse `molecules/tag-autosuggest/` + `tag-autosuggest-2/`)
- Inline autosuggest (`molecules/inline-autosuggest/`)
- File uploader (single + multi + drag-drop) — **missing today**
- Password input + strength checklist (port `password-validation-checklist/`)
- Validation checklist (generic — port `validation-checklist.tsx`)
- Search input + collapse variant (port `collapsible-search-input/`)
- Spintax-aware input
- Date filter (port `shared/components/date-filter/`)

Contact / team / sequence composites:
- Contact name field (`molecules/contact-name-field/`)
- Team-member name field (`molecules/team-member-name-field/`)
- Sequence name field (`molecules/sequence-name-field/`)
- Email verification content (`molecules/email-verification-content/`)
- Teams filter (`shared/components/teams-filter/`)

Score widgets (single generic widget replacing 4 variants):
- Score widget — health / setup / writing / sequence (consolidate `email-account-health-score/`, `email-account-setup-score/`, `email-writing-score/`, `sequence-setup-score/`, `score-badge/`)

Credit / upgrade / quota:
- Credit / quota indicator (`credit-indicator/`)
- Reward credits badge (`reward-ev-credits/`)
- Upgrade plan banner (`upgrade-plan-banner/`)
- Premium feature indicator / gate badge (`premium-feature-indicator/`)

Misc:
- Truncated text + tooltip (consolidate `truncated-text-with-tooltip/` + `truncated-text-with-auto-tooltip/`)
- Helmet / SEO wrapper (port `helmet-*.tsx`)
- Suspense wrapper + async progress bar (`suspense/`, `async-progress-bar/`)
- Restriction / error modal (consolidate `restriction-error-modal/`, `restrict-error-modal/`, `sequence-score-error/`)
- Helpscout button, Referral button, Logo, Logo-secondary, Images

---

### 4 · Organisms
*Tables, kanban, timeline, editor, notification system, command palette. Consumes Atoms + Molecules.*

**Sources:** spec §02 (Data display + Overlay composite + Domain-specific composites), §04 (Layout/Feedback/Data display/Bulk actions/Notifications), §11 (video) · inventory §3, §4.

**Issue checklist:**

Data display:
- **Canonical data table** — TanStack Table v8 (sortable, filterable, column reorder via `@dnd-kit`, column visibility, density, **virtualized for >1k rows**, cursor pagination, infinite scroll variant)
- Migrate `react-bootstrap-table-next` (do-not-contact, do-not-call) → canonical table
- Migrate `rc-table` (legacy sequence/prospect) → canonical table
- Pagination (cursor-based default + page-size selector)
- Empty state (single canonical, illustration + CTA — collapse `no-result-empty-list/` + `molecules/empty-list/`)
- **Kanban board** — `@dnd-kit` (replace internal drag-drop in `crm/kanban*`)
- Card list
- Activity timeline
- Email preview / thread (port `email-preview/`)
- Attachment list (port `attachment/`)
- Charts (line / bar / area / donut) — pick library (Recharts or Chart.js)
- Performance stats card (port `molecules/performance-stats/`)
- Status badge / contact status tag (port `atoms/contact-status-tag/` + `atoms/prospect-tag/`)
- **Bulk action bar** (sticky, multi-select aware)
- **Unified filter context/API** — chips, clear-all, save-filter (replaces scattered `filter-tab/`, `date-filter/`, `teams-filter/`)

Overlay composites:
- **Confirmation dialog — single canonical** (collapse `atoms/confirmation-modal/{v1,v2,v3}`)
- Report modal (port `atoms/report-modal/`)
- Video modal (port `shared/components/video-modal/`)
- Onboarding modal
- 3D-secure card payment handler (port `handle-3d-secure-card-payment/`)
- PIP window (port `pip-window/` — dialer floating window)

Feedback systems:
- **Toast — single canonical** (collapse `src/shared/toaster/` + DS ToastManager)
- Notification banner — info/warning/success/error (port `notification-banner/`)
- Alert
- 404 / 500 / maintenance / offline page templates (templates consumed by Layout)
- Error boundary fallback

Navigation organisms:
- Stepper / wizard (replace ad-hoc step UIs in `email-account-setup-score/`, `sequence-setup-score/`)
- **Command palette (⌘K)** — missing today
- Keyboard shortcuts `?` panel
- Notification center (bell icon, list, mark-read) — feeds Inbox

Editor:
- Email template editor — **Tiptap** or similar (replace TinyMCE 5 `@tinymce/tinymce-react`)

Drag-drop wrapper:
- Draggable wrapper (port `draggable-wrapper/`, `@dnd-kit` based)
- Audit `react-beautiful-dnd` — remove if unused

Auth / routing organisms (consumed by Layout):
- Carousel (auth testimonials, port `atoms/carousel/`)
- Lazy-load + retry wrapper (port `retry-lazy.ts` pattern)

Inline edit:
- Inline-edit primitive for table cells (**missing today**)

---

### 5 · Layout
*App shell (sidebar + topbar + content), global overlays, route guards, system pages.*

**Sources:** spec §04 (Layout, Error handling), §01 (System) · inventory §3 (Layout), §1 (Error/Maintenance).

**Issue checklist:**

App shell:
- Sidebar + topbar shell (port from `src/components/app/` + `src/components/home/`)
- Sidebar collapse — migrate from Redux to Zustand
- Responsive collapse (sidebar → drawer on mobile)
- Global status / alert overlay slot (port `shared/components/fixed-home.tsx`)
- Main content region with skip-link target

Route guards (consume App-Shared's TanStack Router middleware):
- AuthRoute
- ProtectedRoute
- ConfigRoute
- Auth-aware redirect helper (post-login destination)

System / error pages:
- 404 (port `shared/components/error-404/`)
- 500 — **missing today**
- Maintenance mode page (currently static `maintenance-page.tsx` — wire to router + API status poll)
- Offline fallback — **missing today**
- Plan / permission block (port `block-page/`)
- Under construction (port `under-construction.tsx`)

Layout primitives (consume from Atoms but assemble here):
- Settings sub-shell layout (consumed by Settings project)
- Public/auth shell layout (consumed by Auth project)
- Authenticated app shell layout
- Print layout (if needed for Reports)

Skip link / accessibility shell:
- "Skip to content" link at top of every page
- Landmark wrappers (`<main>`, `<nav>`, `<aside>`, `<footer>`)
- Focus trap for global overlays

---

### 6 · Auth
*All public/unauthenticated screens. Consumes Layout + Atoms + Organisms. Owns token flows.*

**Sources:** spec §01 (Public/Auth) · inventory §1 (Public/Auth) — 13 modules + auth slices (login/signup/sso/oauth/resetPassword/changePassword/setUserPassword/invitationSignup).

**Issue checklist:**

Auth screens:
- Login (email + password + **MFA**) — port `auth/components/login/`
- Agency / white-label login variant
- SSO login + `/sso-callback` — port `auth/components/sso-login/`
- Sign up (standard variant) — port `auth/components/signup/`
- Sign up (LTD variant)
- Reset password + callback — port `auth/components/reset-password/` + `reset-password-callback/`
- Accept invite — port `auth/components/invitation-signup/`
- Verify email — port from `app/app.tsx` Default route
- OAuth callback (generic) — port from `app/app.tsx:121–131`
- OAuth callback (whitelabel)
- Connect-email-account callback — port `/connect-email-account-callback`
- Public demo
- Inbox Radar — public shareable report (cross-link with Inbox Radar project)
- Checkout (Stripe 3DS) — cross-link with Billing
- Email infra pay (`/email-infra/pay`) — cross-link with Billing

Auth UX patterns (consume Organisms):
- Auth carousel (testimonials)
- Auth wizard for onboarding
- Password strength UI

Token / flow hardening:
- Refresh token rotation flow
- Open-redirect guard for post-login `returnUrl`
- Rate-limit handling for login / password reset (debounce + 429 toast)
- Demo-account token handling (port `demo-account-handlers.ts`)

Forms migration:
- All Formik forms → react-hook-form + Zod schemas
- Field-level error messages from schema

---

### 7 · Settings
*15-route `/settings/*` sub-router. Each submodule is its own issue.*

**Sources:** spec §01 (Settings sub-router) · inventory §1 — uses `React.lazy` + `retry-lazy.ts`.

**Issue checklist:**

Shell:
- Settings shell (`/settings/*` nested router; port `src/components/settings/settings.tsx`)
- Lazy-load + retry wrapper per submodule
- Settings nav (sidebar tabs)
- Breadcrumbs

Submodules (one issue per route):
- My profile
- Schedule
- Custom fields
- Custom domain
- Admin settings
- API tokens
- Users & teams
- Out of office
- Webhook
- Do not contact (table — migrate off `react-bootstrap-table-next`)
- Do not call (table — migrate off `react-bootstrap-table-next`)
- Custom outcomes
- Call outcomes
- Whitelabel
- Safety settings
- MCP settings
- Billing & subscription (settings entry; deep-links to Billing project)
- Email daily sending limit (from slice list)

Cross-cutting:
- Migrate per-submodule Formik forms → react-hook-form + Zod
- Migrate per-submodule async thunks → TanStack Query
- a11y pass: form labels, error announcements, focus management

---

### 8 · Tasks
*`/tasks*` — task list + prospect-scoped task drilldown.*

**Sources:** spec §01 (Authenticated — Tasks) · inventory §1 — `/tasks`, `/tasks/:prospectId`, `/tasks/:prospectId/:tab`.

**Issue checklist:**
- Task list (canonical table, filters, bulk actions)
- Task creation flow (modal + form)
- Task detail by prospect (`/tasks/:prospectId`)
- Task detail tab variant (`/tasks/:prospectId/:tab`)
- Task status workflow
- Task assignment (team member picker)
- Task reminders / notifications
- Migrate `tasks` slice → TanStack Query
- a11y pass + Zod schemas + tests

---

### 9 · Prospect
*CRM (table/kanban/list views) + prospect detail.*

**Sources:** spec §01 (Authenticated — Prospects/CRM) · inventory §1 — `/prospects`, `/crm`, `/crm/{table,kanban,list}`.

**Issue checklist:**
- Prospects/CRM table view (canonical table)
- Prospects/CRM kanban view (`@dnd-kit`)
- Prospects/CRM list view
- Prospect detail page (activity timeline, email thread, attachments, tasks tab)
- Add prospect form (refactor existing 15-prop form → smaller composition)
- Bulk actions: tag, assign, move stage, delete
- Filter context (saved filters, chips)
- Tag autosuggest integration (canonical from Molecules)
- Migrate `prospect` slice → TanStack Query
- a11y + Zod + tests

---

### 10 · Leads
*Leads v1, Lead Finder v2, CSV enrichment.*

**Sources:** spec §01 (Authenticated — Leads, Lead Finder v2, CSV enrichment) · inventory §1 — `/leads`, `/v2/leads`, `/v2/leads/:tab`, `/v2/leads/:tab/:subtab/:prospectId`, `/v2/leads/csv-enrichment{,/new,/status}`.

**Issue checklist:**
- Leads v1 list (port `src/components/leads/`)
- Lead Finder v2 — tabs + subtabs + prospect detail (`src/components/v2-lead/`)
- CSV enrichment — new (`/v2/leads/csv-enrichment/new`)
- CSV enrichment — status (`/v2/leads/csv-enrichment/status`)
- Lead-to-prospect conversion flow
- Lead enrichment API integration
- Migrate `leads` + `leadFinderV2` + `csvEnrichment` slices → TanStack Query
- File uploader integration (from Molecules)
- a11y + Zod + tests

---

### 11 · Email Infra
*Email accounts, email insights, domains, inframail IPs, email verifier.*

**Sources:** spec §01 (Authenticated — Email accounts, Email insights, Domains, Inframail IPs, Email verifier) · inventory §1 — `/email-accounts{,/create,/:hashId/:tab}`, `/email-insights`, `/domains`, `/inframail-ips`.

**Issue checklist:**
- Email accounts list (`/email-accounts`)
- Connect email account flow (`/email-accounts/create`)
- Email account detail tabs (`/email-accounts/:hashId/:tab`)
- Email account setup wizard (consume canonical stepper)
- Email account health score widget integration
- Email insights dashboard (`/email-insights`)
- Domains list (`/domains`)
- Domain setup flow
- Inframail IPs (`/inframail-ips`)
- Email verifier
- Migrate `emailAccount` + `domains` + `inframailIps` + `emailVerifier` slices → TanStack Query
- a11y + Zod + tests

---

### 12 · Warmup
*Email warmup configuration + analytics.*

**Sources:** spec §01 (Authenticated — Email warmup) · inventory §1 — `/email-warmup*`.

**Issue checklist:**
- Warmup dashboard
- Warmup settings per email account
- Warmup analytics (charts from Organisms)
- Warmup schedule / ramp-up controls
- Warmup status indicators
- Migrate `emailWarmup` slice → TanStack Query
- Cross-link with Email Infra (per-account warmup)
- a11y + Zod + tests

---

### 13 · Inbox Radar
*Public shareable report + authenticated variant.*

**Sources:** spec §01 (Public + Authenticated — Inbox Radar) · inventory §1.

**Issue checklist:**
- Public shareable report view (ConfigRoute — cross-link with Auth)
- Authenticated Inbox Radar dashboard
- Shareable link generation
- Report charts (from Organisms)
- Migrate `inboxRadar` slice → TanStack Query
- SEO / Helmet wrapper for public report
- a11y + Zod + tests

---

### 14 · Dialer
*Call logs, call detail, phone numbers, number settings, PIP window.*

**Sources:** spec §01 (Authenticated — Dialer) · inventory §1 — `/dialer{,/call-logs,/call-logs/:callLogId/:tab,/phone-numbers,/phone-numbers/:id/settings}`.

**Issue checklist:**
- Dialer landing
- Call logs list (canonical table)
- Call log detail (`/dialer/call-logs/:callLogId/:tab`)
- Phone numbers list
- Phone number settings (`/phone-numbers/:id/settings`)
- Dialer floating window (PIP — from Organisms)
- Twilio Voice SDK integration
- Call outcomes integration (cross-link with Settings)
- Realtime call events (WebSocket from App-Shared baseline)
- Migrate `dialer` slice → TanStack Query
- a11y + Zod + tests

---

### 15 · Sequence
*Campaign builder + nested settings + subsequence.*

**Sources:** spec §01 (Authenticated — Sequence) · inventory §1 — `Needs Uplift` (deep nested routes, sequence + schedule slices).

**Issue checklist:**
- Sequence list
- Sequence creation wizard (canonical stepper)
- Campaign builder — step composer
- Step types: email / wait / condition / task
- Sequence settings (nested route — sender accounts, schedule, throttle)
- Sequence prospect drill-down
- Subsequence detail
- Sequence-level activity timeline (Organisms)
- Sequence score widget integration (Molecules)
- Migrate `sequence` + `schedule` slices → TanStack Query / Zustand
- a11y + Zod + tests

---

### 16 · Templates
*Email template library.*

**Sources:** spec §01 (Authenticated — Templates) · inventory §1.

**Issue checklist:**
- Templates list
- Template create / edit (Tiptap editor from Organisms)
- Template variables / spintax
- Template categories
- Template preview
- Migrate `templates` slice → TanStack Query
- a11y + Zod + tests

---

### 17 · Reports
*Reports dashboard + charts.*

**Sources:** spec §01 (Authenticated — Reports) · inventory §1.

**Issue checklist:**
- Reports dashboard layout
- Filter bar (date range, sequence, team)
- KPI cards (consume Molecules performance-stats)
- Chart widgets (line/bar/area/donut from Organisms)
- Per-sequence / per-prospect drilldown
- Export to CSV
- Migrate `reports` slice → TanStack Query
- a11y + Zod + tests

---

### 18 · Inbox
*Mailbox emails + Unified inbox + notification center.*

**Sources:** spec §01 (Authenticated — Mailbox emails, Unified inbox), §04 (Notifications), §12 (Realtime) · inventory §1.

**Issue checklist:**
- Unified inbox list (`/unified-inbox*`) — infinite scroll variant
- Email thread view (Organisms)
- Mailbox emails view
- Reply / forward composer
- Realtime updates via WebSocket
- Bulk actions (mark read, archive, delete)
- Filter chips (canonical filter context)
- In-app notification center (bell icon — Organisms)
- Mark-read / mark-unread
- Migrate `mailboxEmails` + `unifiedInbox` slices → TanStack Query
- a11y + Zod + tests

---

### 19 · Growth Hub
*`/growth-hub*` — growth experiments and feature discovery.*

**Sources:** spec §01 (Authenticated — Growth hub) · inventory §1.

**Issue checklist:**
- Growth Hub landing
- Feature discovery cards
- Experiment / promo content
- CTA routing into setup wizards
- Migrate `growthHub` slice → TanStack Query
- a11y + tests

---

### 20 · LinkedIn Automation
*`/linkedin-automation*` — LinkedIn outreach automation.*

**Sources:** spec §01 (Authenticated — LinkedIn automation) · inventory §1.

**Issue checklist:**
- LinkedIn Automation landing
- LinkedIn account connect flow
- LinkedIn sequence builder
- LinkedIn prospect targeting
- LinkedIn analytics
- Migrate `linkedInAutomation` slice → TanStack Query
- a11y + Zod + tests

---

### 21 · Billing
*Upgrade plan, subscriptions, checkout, email infra pay, payments handling.*

**Sources:** spec §01 (Authenticated — Billing, Public — Checkout/Email infra pay), §10 (Stripe 3DS) · inventory §1.

**Issue checklist:**
- Upgrade plan selection (`/billing/upgrade-plan*`)
- Subscription management (`/billing/subscriptions*`)
- Checkout (Stripe 3DS) — port `src/components/checkout/`
- Email infra pay — port `src/components/email-infra-pay/`
- 3D-secure card payment handler (from Organisms)
- Plan downgrade flow
- Invoice list / download
- Plan-block modal (consumed app-wide)
- Migrate `billingAndSubscription` + `updatePreferredApp` slices → TanStack Query
- a11y + Zod + tests
- Security review (Stripe integration, PCI scope)

---

### 22 · Agency
*Agency portal + Agency client management + white-label.*

**Sources:** spec §01 (Authenticated — Agency client management, Agency portal) · inventory §1 — `src/components/agency-client-management/`, `src/components/agency-portal/`.

**Issue checklist:**
- Agency portal landing
- Agency client management list
- Client creation / invite flow
- Client switching UX
- White-label settings (deep-link from Settings)
- Agency-level reporting (cross-link with Reports)
- Agency billing aggregation (cross-link with Billing)
- Migrate `agencyClient` + `whitelabel` slices → TanStack Query
- a11y + Zod + tests

---

## Critical Files (for the next iteration)

Foundation / inventory:
- `REBUILD_INVENTORY.md` — 514-line discovery audit (link from every Project description)
- `rebuild-spec/01-screens.md` → all feature projects
- `rebuild-spec/02-components.md` → Atoms / Molecules / Organisms
- `rebuild-spec/03-design-system.md` → Atoms Issue #1
- `rebuild-spec/04-ux-patterns.md` → Layout / Organisms
- `rebuild-spec/05-ai-tooling.md` → App-Shared
- `rebuild-spec/06-docs.md` → App-Shared
- `rebuild-spec/07-global-setup.md` → App-Shared
- `rebuild-spec/08-observability.md` → App-Shared
- `rebuild-spec/09-accessibility.md` → App-Shared infra, Atoms per-component
- `rebuild-spec/10-security.md` → App-Shared, Auth, Billing
- `rebuild-spec/11-assets.md` → App-Shared, Atoms
- `rebuild-spec/12-state.md` → App-Shared, every feature project
- `rebuild-spec/13-type-safety.md` → App-Shared, every feature project

Live code reference:
- `src/store/root-reducer.ts:62–119` — 55 registered slices
- `src/components/app/app.tsx` — top-level switch (auth + public routes)
- `src/components/home/home.tsx` — authenticated hub (30+ nested routes)
- `src/components/settings/settings.tsx` — lazy-loaded sub-router
- `src/shared/routes.ts` — route constants
- `src/root.tsx` — provider tree
- `src/index.tsx` — Sentry init
- `src/api.ts` — Axios + interceptors
- `src/rtk/{api.ts,baseQuery.ts,error.ts}` — RTK Query base
- `src/assets/css/_custom-variable.scss` — current tokens

---

## Iteration Hooks (for next rounds)

Iteration 2 candidates:
- **Confirm rename vs archive-and-create** for the existing 12 Linear projects
- Validate the 10 new project names (Tasks / Leads / Email Infra / Inbox Radar / Dialer / Templates / Inbox / Growth Hub / LinkedIn Automation / Agency)
- Decide pod assignments (which squad owns which Phase 6 pod)
- Set milestones per project (e.g., `M1: scaffolding`, `M2: migration`, `M3: parity`, `M4: a11y/perf gates`)

Iteration 3 candidates:
- Convert each project description's checklist into real Linear Issues with 3–5 bullet acceptance criteria each
- Add labels (`area:foundation`, `area:design-system`, `area:feature`, `migration` / `new-build` / `gap`)
- Add cross-project relations (e.g., Auth ⟷ Billing for Checkout, Settings ⟷ Billing for `/settings/billing-subscription`)
- Add estimates (T-shirt or points)
- Decide cycle / sprint cadence

Open questions (from REBUILD_INVENTORY.md §Open Questions — answer before granular issue creation):
1. Target router — TanStack vs RR v6/v7?
2. Styling — SCSS tokens vs Tailwind + shadcn/ui?
3. State migration scope — full RTKQ collapse vs incremental?
4. Keep `@saleshandy/design-system` / `@saleshandy/icons` packages?
5. Form lib — Formik vs RHF + Zod?
6. Table standardization plan for legacy do-not-contact / sequence / prospect?
7. Test baseline — greenfield vs characterization?
8. Build tool — Vite vs Next.js vs Remix?
9. Observability — add PostHog now or defer?
10. PWA / SW scope?
11. Feature flags — which provider?
12. AI surface — `.claude/` + `.cursor/` both authoritative or consolidate?
13. Dependency-health + dead-code audits — before or after rebuild plan?

---

## Verification (when import runs in a later iteration)

- Dry-run: print 22 project names + first 3 checklist items each, no creation
- Confirm Linear team / cycle / label catalog with you
- **Recommended first project to create end-to-end: Atoms** (small enough to validate format; includes Issue #1 tokens + Storybook setup)
- Spot-check 3 random checklist items per project against the spec source they cite
- Once approved, batch-create remaining 21 projects
