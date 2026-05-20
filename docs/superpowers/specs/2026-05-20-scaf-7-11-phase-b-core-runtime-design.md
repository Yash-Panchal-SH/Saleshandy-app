# Phase B — Core Runtime Design (SCAF-7 … SCAF-11)

**Status:** Approved · 2026-05-20
**Linear:** SAL-1830 (SCAF-7), SAL-1831 (SCAF-8), SAL-1832 (SCAF-9), SAL-1833 (SCAF-10), SAL-1834 (SCAF-11) — milestone *Phase B — Core runtime*
**Spec sources:** `rebuild-spec/07-global-setup.md`, `rebuild-spec/12-state.md`, `rebuild-spec/13-type-safety.md`, `rebuild-spec/08-observability.md`, `rebuild-spec/14-frontend-principles.md`

## Goal

Stand up the five runtime primitives every feature will graft onto: typed routing with guards, an HTTP/auth layer, the server-state cache, global client state, and crash isolation. No product features — only the substrate and the minimum demo surface needed to verify each primitive.

## Scope decision

**Primitives + thin smoke.** Build the five primitives plus exactly the demo routes and tests each ticket's verification requires (one Zod-search-param route, one protected route, one feature-boundary demo). No fake login→dashboard feature — that would build throwaway product code Phase C+ overwrites.

## Resolved decisions

| Question | Decision |
| --- | --- |
| HTTP layer (SCAF-8) | **Axios 1.x** single instance with interceptors — the 401 refresh-once flow is materially cleaner via a response interceptor. |
| Folder convention | **rebuild-spec structure** (`src/app/`, `src/features/`, `src/shared/lib/`) — overrides the ticket ACs' literal `src/lib/` paths; consistent with the existing `src/shared/lib/env.ts`. |
| `routeTree.gen.ts` (SCAF-7) | **Commit it** — deterministic, review-visible, fresh clone typechecks with no pre-step. |
| Guard split (SCAF-7) | **`ConfigRoute` owns plan/role/flag gating.** `ProtectedRoute` is purely "are you authenticated". |
| Token storage (SCAF-8) | `localStorage` — deliberate, time-boxed divergence from the spec's HttpOnly-cookie target. Recorded in ADR + code comment; migration is a follow-up ticket. |

## Folder structure

```
src/
  app/
    providers/app-providers.tsx   # RootErrorBoundary > QueryClientProvider > RouterProvider
    router/router.tsx             # createRouter + dev-only devtools
    router/guards.ts              # AuthRoute / ProtectedRoute / ConfigRoute beforeLoad helpers
    store/ui-store.ts             # Zustand: theme + sidebar, persisted
  routes/                         # file-based route tree
    __root.tsx  index.tsx  login.tsx  protected-example.tsx
  routeTree.gen.ts                # generated, committed
  features/auth/
    auth-tokens.ts                # namespaced localStorage token read/write/clear
    use-auth.ts                   # useAuth() — single isAuthenticated source
    auth.types.ts
  shared/lib/
    http/{client.ts, refresh.ts, api-error.ts, safe-return-url.ts}
    query/{query-client.ts, keys.ts, optimistic.ts, websocket.ts}
    error/{report.ts, root-error-boundary.tsx, feature-boundary.tsx, chunk-reload.ts}
    env.ts                        # existing — extended with VITE_API_BASE_URL
```

`main.tsx` swaps its render target from `<App/>` to `<AppProviders/>`; `src/App.tsx` and its test are deleted — the route tree's `index.tsx` is the new home screen.

## Components

### SCAF-8 — HTTP client + auth

- **`shared/lib/http/client.ts`** — one configured Axios instance. `baseURL` from `env.VITE_API_BASE_URL` (a **new env var** — added to the Zod schema in `env.ts`, to `vite-env.d.ts`, and to `.env` / `.env.development` / `.env.staging` / `.env.production`). JSON defaults. Request interceptor injects `Authorization: Bearer <access>` from `localStorage`. Response interceptor delegates `401` handling to `refresh.ts`.
- **`shared/lib/http/refresh.ts`** — on `401`: attempt refresh **exactly once** (guarded against firing on the refresh endpoint itself and against retrying an already-retried request); on success, retry the original request once; on failure, clear tokens and `window.location.assign('/login?returnUrl=<safe>')`. No concurrent-request queue — documented limitation.
- **`shared/lib/http/api-error.ts`** — normalizes Axios errors into a typed `ApiError { status, code, message }`.
- **`features/auth/auth-tokens.ts`** — `getAccessToken` / `getRefreshToken` / `setTokens` / `clearTokens`, keyed `sh.auth.access` and `sh.auth.refresh`.
- **`features/auth/use-auth.ts`** — `useAuth()` returns `{ isAuthenticated }`, derived from token presence; the single source of truth. `/me` boot validation is a documented future hook, not built now.
- **`shared/lib/http/safe-return-url.ts`** — `safeReturnUrl(raw)` accepts only same-origin relative paths (`/...`, no `//`, no scheme); anything else falls back to the default route. Imported by both `refresh.ts` and the router guards (keeping the dependency pointing into `shared/`, never up into `app/`).
- **ADR `docs/adr/0004-http-client.md`** — records the Axios choice and the `localStorage`-is-XSS-exposed tradeoff.

### SCAF-7 — TanStack Router

- File-based routing via `@tanstack/router-plugin` (Vite plugin); `routesDirectory` = `src/routes`. `routeTree.gen.ts` committed.
- **`app/router/guards.ts`** — `beforeLoad` helper functions:
  - `AuthRoute` — guest-only; redirects authenticated users to `/`.
  - `ProtectedRoute` — authenticated-only; redirects to `/login?returnUrl=<current>`.
  - `ConfigRoute` — composes `ProtectedRoute`, then gates on plan / role / feature flag; redirects or 404s when the gate fails. Plan/role/flag inputs are typed but stubbed (no flag system yet — that is Phase C).
- Route components lazy-loaded via `lazyRouteComponent` (route-level code splitting on every screen).
- `protected-example.tsx` demonstrates Zod-validated search params (`validateSearch` with a Zod schema, e.g. `?tab=`).
- `queryClient` passed through the router `context`; route `loader`s use `queryClient.ensureQueryData(...)`. Pattern recorded in **ADR `docs/adr/0005-router-query-integration.md`**.
- Router devtools mounted only when `env.VITE_APP_ENV === 'development'`.

### SCAF-9 — TanStack Query

- **`shared/lib/query/query-client.ts`** — `createQueryClient()` factory. `defaultOptions.queries` uses a `STALE_TIME` constants object derived from the spec's stale-time table (user profile 5 min, lists 30 s, config 10 min, dashboard 1 min, realtime 0).
- **`shared/lib/query/keys.ts`** — type-safe per-feature query-key factory; ships one worked example (`authKeys`).
- **`shared/lib/query/optimistic.ts`** — `optimisticUpdate(queryClient, key, updater)` returning a rollback context.
- **`shared/lib/query/websocket.ts`** — `subscribeToCache(...)` bridging a WebSocket message into `queryClient.setQueryData`. Provisional and minimal; the helper shape is explicitly subject to revision once Inbox/Dialer land.
- React Query DevTools mounted only in `development`.

### SCAF-10 — Zustand

- **`app/store/ui-store.ts`** — `useUIStore` holding `theme` (`'light' | 'dark'`) and `sidebarCollapsed`. Wrapped in `persist` (localStorage) — the opt-in pattern; other slices stay in-memory. `devtools` middleware applied only when `env.VITE_APP_ENV === 'development'`.
- The store drives the `[data-theme]` attribute on `document.documentElement` — bridging SCAF-2's theming tokens. A `useApplyTheme()` hook (or store subscription) keeps the DOM attribute in sync.
- **No Redux** — `redux`, `@reduxjs/toolkit`, `react-redux` absent from `package.json`. Biome `noRestrictedImports` rule forbids importing them; `CONTRIBUTING.md` notes the convention (Zustand = global UI state only; server state → TanStack Query; component-local → `useState`).

### SCAF-11 — Error boundaries

- **`shared/lib/error/report.ts`** — `reportError(error, context)`. Dev: `console.error`. Prod: no-op. The single change-point for slotting in an error-reporting SDK later.
- **`shared/lib/error/root-error-boundary.tsx`** — `<RootErrorBoundary>`, an own-implementation class component (no vendor SDK). Catches, calls `reportError`, renders a fallback with a **Reload** action and a **"Report a problem"** placeholder (no-op link). In dev it also `console.error`s so crashes stay visible.
- **`shared/lib/error/chunk-reload.ts`** — detects `ChunkLoadError` (lazy-chunk fetch failure after a deploy) and triggers a one-shot `window.location.reload()`, guarded by a `sessionStorage` key to prevent reload loops; a second occurrence shows the manual-reload fallback.
- **`shared/lib/error/feature-boundary.tsx`** — `<FeatureBoundary feature="…">`, isolates a single feature's crash and renders a local fallback; passes `feature` into the `reportError` context. No mandatory per-route wrapping policy — feature owners opt in.

### Provider composition

`app/providers/app-providers.tsx` composes, outermost first: `RootErrorBoundary` → `QueryClientProvider` → `RouterProvider`. SCAF-16 will formalize and extend the full provider tree (theme, auth, flags, toast, i18n); this file is the provisional seed.

## Data flow

1. `main.tsx` → `<AppProviders/>`.
2. A route's `beforeLoad` runs the relevant guard (`AuthRoute` / `ProtectedRoute` / `ConfigRoute`), which reads `useAuth`-equivalent token state and may `throw redirect(...)`.
3. Route `loader`s call `queryClient.ensureQueryData`; components read the same keys via `useQuery`.
4. Query/mutation functions call the Axios instance; the request interceptor injects the bearer token, the response interceptor runs the refresh-once flow on `401`.
5. UI state (theme, sidebar) lives in `useUIStore`; the theme value is reflected onto `[data-theme]`.
6. Any render-time crash is caught by the nearest `<FeatureBoundary>` or by `<RootErrorBoundary>`, both routed through `reportError`.

## Error handling

- **HTTP 401** → refresh once → retry, or clear tokens + redirect to login.
- **HTTP non-401** → normalized `ApiError`; surfaced to callers (TanStack Query `error` state).
- **Render crashes** → `FeatureBoundary` (isolated) or `RootErrorBoundary` (whole app), both → `reportError`.
- **Lazy-chunk fetch failure** → one-shot auto-reload, `sessionStorage`-guarded.
- **Open-redirect attempt** (`?returnUrl=https://evil.com`) → rejected by `safeReturnUrl`, falls back to the default route.

## Testing

Vitest + MSW unit/component tests, one per primitive:

- **HTTP** — bearer injection; `401` → refresh → retry succeeds; refresh failure → tokens cleared + redirect; `safeReturnUrl` rejects cross-origin.
- **Router guards** — `ProtectedRoute` redirects unauthenticated; `AuthRoute` redirects authenticated; `ConfigRoute` gates on a failing stub.
- **Query** — key factory namespacing; `optimisticUpdate` applies then rolls back.
- **Zustand** — `useUIStore` toggles theme; persisted slice survives a simulated reload.
- **Error boundary** — `FeatureBoundary` catches a thrown child and isolates it; `RootErrorBoundary` catches; `chunk-reload` guard fires once then stops.

Playwright e2e: visiting `/protected-example` unauthenticated redirects to `/login`. `vitest.config.ts` `coverage.include` extended to the new files so the 70% gate stays honest.

## Out of scope

- Wiring `reportError` to an actual SDK (Sentry/Rollbar/etc.) — separate ticket once a tool is chosen.
- Concurrent-request refresh queueing — refresh-once-then-logout is the contract for now.
- The full provider tree ordering (theme/auth/flags/toast/i18n) — SCAF-16.
- `/me` boot validation, feature-flag system, plan/role data source — Phase C.
- DOM hydration-mismatch auto-reload, breadcrumbs — parking-lot per SCAF-11.

## Delivery

One branch off `main`, per-ticket commits (`feat(scaf-7)` … `feat(scaf-11)` plus `docs`/`chore` as needed). Build order: **SCAF-8 → SCAF-9 → SCAF-10 → SCAF-7 → SCAF-11** (router guards depend on auth; error boundaries wrap everything). Gates green (`lint`, `typecheck`, `build`, `test`, `e2e`), merge to `main`, mark all five issues Done in Linear.
