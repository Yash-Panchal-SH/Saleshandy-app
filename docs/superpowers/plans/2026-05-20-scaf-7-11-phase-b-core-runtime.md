# Phase B — Core Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the five runtime primitives every feature grafts onto — HTTP/auth, server-state cache, global client state, typed routing with guards, and crash isolation.

**Architecture:** Axios instance with a refresh-once-then-logout interceptor; TanStack Query for server state; Zustand for global UI state; TanStack Router (file-based, typed) with `beforeLoad` guards; own-implementation React error boundaries routed through a single `reportError` change-point. New code follows the rebuild-spec folder structure (`src/app/`, `src/features/`, `src/shared/lib/`).

**Tech Stack:** Vite 8, React 19, TypeScript 6 (strict), Axios 1.x, `@tanstack/react-router` + `@tanstack/react-query` + `zustand` (all latest stable), Zod 4, Vitest 4 + MSW + Playwright.

**Spec:** `docs/superpowers/specs/2026-05-20-scaf-7-11-phase-b-core-runtime-design.md`

**Branch:** `yash/sal-1830-phase-b-core-runtime` (already created; design spec committed at `94b06a5`).

**Conventions for every task:**
- `verbatimModuleSyntax` is on — all type-only imports MUST use `import type { … }`.
- `noImplicitOverride` is on — class methods that override MUST use the `override` keyword.
- Absolute imports only (`@/…`). No barrel `index.ts` files.
- Commit subjects MUST be lowercase (commitlint `subject-case`). Format: `feat(scaf-N): …`.
- Run order is fixed: Task 1 → 10 in sequence.

---

### Task 1: Install dependencies + add `VITE_API_BASE_URL`

**Files:**
- Modify: `package.json` (via `pnpm add`)
- Modify: `src/shared/lib/env.ts`
- Modify: `src/vite-env.d.ts`
- Modify: `.env`
- Modify: `vite.config.ts`
- Modify: `vitest.config.ts`
- Modify: `biome.jsonc`

- [ ] **Step 1: Install runtime + dev dependencies**

```bash
pnpm add axios @tanstack/react-router @tanstack/react-query zustand
pnpm add -D @tanstack/router-plugin @tanstack/router-cli @tanstack/react-router-devtools @tanstack/react-query-devtools
```

- [ ] **Step 2: Add the `VITE_API_BASE_URL` env var to the Zod schema**

In `src/shared/lib/env.ts`, add a field to `envSchema` (place it first, above `VITE_APP_ENV`):

```ts
const envSchema = z.object({
  // Base URL for all API calls. Relative ("/api") in dev; absolute per environment.
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']),
  // Reserved for SCAF-21 (PWA). Env values are strings — map "true"/"false" → boolean.
  VITE_PWA_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})
```

- [ ] **Step 3: Declare it in `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

// Augments Vite's ImportMetaEnv with the project's typed variables.
// The runtime-validated, transformed shape is `env` from `@/shared/lib/env`.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_PWA_ENABLED: string
}
```

- [ ] **Step 4: Add the value to the shared `.env` file**

Append to `.env`:

```
VITE_API_BASE_URL=/api
```

- [ ] **Step 5: Wire the TanStack Router Vite plugin**

Replace `vite.config.ts` with:

```ts
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Router plugin MUST come before the React plugin.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: ['tsconfig.app.json'] }),
  ],
})
```

- [ ] **Step 6: Exclude the generated route tree from Biome**

In `biome.jsonc`, add `"!src/routeTree.gen.ts"` to the `files.includes` array (the route tree is machine-generated; linting/formatting it causes churn):

```jsonc
  "files": {
    "includes": [
      "**",
      "!!**/dist",
      "!!**/node_modules",
      "!!**/coverage",
      "!!**/test-results",
      "!!**/playwright-report",
      "!src/routeTree.gen.ts"
    ]
  },
```

- [ ] **Step 7: Configure the Vitest test environment**

`env.ts` requires `VITE_APP_ENV`. Vitest runs in `test` mode, where no `.env.*`
file supplies that variable — so env validation throws the moment a test
imports a module that transitively imports `env.ts` (Task 3 onward). Inject the
values explicitly: in `vitest.config.ts`, add an `env` key inside the `test`
block, immediately after `environment: 'jsdom'`:

```ts
  test: {
    environment: 'jsdom',
    env: {
      VITE_APP_ENV: 'development',
      VITE_API_BASE_URL: '/api',
    },
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    // …rest of the existing test config unchanged
```

- [ ] **Step 8: Add the route-generation script**

In `package.json` `scripts`, add:

```json
    "gen:routes": "tsr generate",
```

- [ ] **Step 9: Verify env still validates and typecheck passes**

Run: `pnpm typecheck`
Expected: PASS (no route files exist yet; the router plugin generates an empty tree lazily — this is fine).

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-lock.yaml src/shared/lib/env.ts src/vite-env.d.ts .env vite.config.ts vitest.config.ts biome.jsonc
git commit -m "chore(scaf-8): install phase B deps, add VITE_API_BASE_URL"
```

---

### Task 2: SCAF-8 — auth token storage, types, safe-return-url

**Files:**
- Create: `src/features/auth/auth.types.ts`
- Create: `src/features/auth/auth-tokens.ts`
- Create: `src/features/auth/auth-tokens.test.ts`
- Create: `src/shared/lib/http/safe-return-url.ts`
- Create: `src/shared/lib/http/safe-return-url.test.ts`

- [ ] **Step 1: Write the failing test for `safeReturnUrl`**

Create `src/shared/lib/http/safe-return-url.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { safeReturnUrl } from './safe-return-url'

describe('safeReturnUrl', () => {
  it('accepts a same-origin relative path', () => {
    expect(safeReturnUrl('/leads?tab=open')).toBe('/leads?tab=open')
  })

  it('rejects an absolute URL', () => {
    expect(safeReturnUrl('https://evil.com')).toBe('/')
  })

  it('rejects a protocol-relative URL', () => {
    expect(safeReturnUrl('//evil.com')).toBe('/')
  })

  it('falls back for null / empty input', () => {
    expect(safeReturnUrl(null)).toBe('/')
    expect(safeReturnUrl('')).toBe('/')
  })

  it('uses a custom fallback when provided', () => {
    expect(safeReturnUrl('javascript:alert(1)', '/home')).toBe('/home')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- safe-return-url`
Expected: FAIL — cannot resolve `./safe-return-url`.

- [ ] **Step 3: Implement `safeReturnUrl`**

Create `src/shared/lib/http/safe-return-url.ts`:

```ts
/**
 * Validates a redirect target against an open-redirect attack.
 * Only same-origin relative paths (starting with a single "/") are allowed.
 */
export function safeReturnUrl(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback
  // Reject protocol-relative ("//host") and anything not rooted at "/".
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  return raw
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- safe-return-url`
Expected: PASS (5 tests).

- [ ] **Step 5: Write the failing test for `auth-tokens`**

Create `src/features/auth/auth-tokens.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearTokens, getAccessToken, getRefreshToken, setTokens, subscribeToTokens } from './auth-tokens'

afterEach(() => {
  localStorage.clear()
})

describe('auth-tokens', () => {
  it('stores and reads tokens', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(getAccessToken()).toBe('a1')
    expect(getRefreshToken()).toBe('r1')
  })

  it('clears tokens', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('notifies subscribers on set and clear', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToTokens(listener)
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    clearTokens()
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    setTokens({ accessToken: 'a2', refreshToken: 'r2' })
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm test -- auth-tokens`
Expected: FAIL — cannot resolve `./auth-tokens`.

- [ ] **Step 7: Implement the auth types**

Create `src/features/auth/auth.types.ts`:

```ts
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  isAuthenticated: boolean
}
```

- [ ] **Step 8: Implement `auth-tokens`**

Create `src/features/auth/auth-tokens.ts`:

```ts
import type { AuthTokens } from './auth.types'

const ACCESS_KEY = 'sh.auth.access'
const REFRESH_KEY = 'sh.auth.refresh'

const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  emit()
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  emit()
}

/** Subscribe to token changes (for `useAuth`'s `useSyncExternalStore`). */
export function subscribeToTokens(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
```

- [ ] **Step 9: Run both tests to verify they pass**

Run: `pnpm test -- safe-return-url auth-tokens`
Expected: PASS (8 tests total).

- [ ] **Step 10: Commit**

```bash
git add src/features/auth/ src/shared/lib/http/safe-return-url.ts src/shared/lib/http/safe-return-url.test.ts
git commit -m "feat(scaf-8): auth token storage + safe-return-url guard"
```

---

### Task 3: SCAF-8 — API error normalization, Axios client, refresh-once interceptor

**Files:**
- Create: `src/shared/lib/http/api-error.ts`
- Create: `src/shared/lib/http/api-error.test.ts`
- Create: `src/shared/lib/http/refresh.ts`
- Create: `src/shared/lib/http/client.ts`
- Create: `src/shared/lib/http/client.test.ts`
- Modify: `src/mocks/handlers.ts`

- [ ] **Step 1: Write the failing test for `api-error`**

Create `src/shared/lib/http/api-error.test.ts`:

```ts
import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { toApiError } from './api-error'

describe('toApiError', () => {
  it('normalizes an Axios error with a response', () => {
    const err = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      data: { message: 'Lead not found', code: 'LEAD_NOT_FOUND' },
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    })
    expect(toApiError(err)).toEqual({
      status: 404,
      code: 'LEAD_NOT_FOUND',
      message: 'Lead not found',
    })
  })

  it('normalizes a non-Axios error', () => {
    expect(toApiError(new Error('boom'))).toEqual({
      status: 0,
      code: 'UNKNOWN',
      message: 'boom',
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- api-error`
Expected: FAIL — cannot resolve `./api-error`.

- [ ] **Step 3: Implement `api-error`**

Create `src/shared/lib/http/api-error.ts`:

```ts
import axios from 'axios'

export interface ApiError {
  status: number
  code: string
  message: string
}

interface ApiErrorPayload {
  message?: string
  code?: string
}

/** Normalizes any thrown value (Axios or not) into a stable `ApiError` shape. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const payload = (error.response?.data ?? {}) as ApiErrorPayload
    return {
      status: error.response?.status ?? 0,
      code: payload.code ?? error.code ?? 'UNKNOWN',
      message: payload.message ?? error.message,
    }
  }
  if (error instanceof Error) {
    return { status: 0, code: 'UNKNOWN', message: error.message }
  }
  return { status: 0, code: 'UNKNOWN', message: 'Unknown error' }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- api-error`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement the refresh-once handler**

Create `src/shared/lib/http/refresh.ts`:

```ts
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { clearTokens, getRefreshToken, setTokens } from '@/features/auth/auth-tokens'
import type { AuthTokens } from '@/features/auth/auth.types'
import { env } from '@/shared/lib/env'
import { safeReturnUrl } from './safe-return-url'

/** The refresh endpoint — never trigger a refresh loop on this path itself. */
export const REFRESH_PATH = '/auth/refresh'

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

/** Clears auth state and sends the user to login with a safe returnUrl. */
export function forceLogout(): void {
  clearTokens()
  const current = `${window.location.pathname}${window.location.search}`
  const returnUrl = safeReturnUrl(current)
  window.location.assign(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
}

/**
 * Response-interceptor rejection handler. On a 401, attempts a token refresh
 * exactly once, then retries the original request. Any failure → forceLogout.
 * No concurrent-request queueing — refresh-once-then-logout is the contract.
 */
export async function handleUnauthorized(
  error: AxiosError,
  client: AxiosInstance,
): Promise<unknown> {
  const config = error.config as RetryableConfig | undefined
  const isUnauthorized = error.response?.status === 401

  if (!isUnauthorized || !config || config._retried || config.url === REFRESH_PATH) {
    if (isUnauthorized) forceLogout()
    return Promise.reject(error)
  }

  config._retried = true
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    forceLogout()
    return Promise.reject(error)
  }

  try {
    const { data } = await axios.post<AuthTokens>(`${env.VITE_API_BASE_URL}${REFRESH_PATH}`, {
      refreshToken,
    })
    setTokens(data)
    config.headers.Authorization = `Bearer ${data.accessToken}`
    return await client(config)
  } catch (refreshError) {
    forceLogout()
    return Promise.reject(refreshError)
  }
}
```

- [ ] **Step 6: Implement the Axios client**

Create `src/shared/lib/http/client.ts`:

```ts
import axios from 'axios'
import { getAccessToken } from '@/features/auth/auth-tokens'
import { env } from '@/shared/lib/env'
import { handleUnauthorized } from './refresh'

/**
 * The single configured HTTP client. Base URL from env, JSON defaults,
 * bearer-token injection, and a refresh-once-then-logout 401 handler.
 *
 * SECURITY NOTE: tokens live in localStorage and are therefore XSS-exposed.
 * This is a deliberate, time-boxed divergence from the spec's HttpOnly-cookie
 * target — see docs/adr/0004-http-client.md. Migration is a follow-up ticket.
 */
export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => handleUnauthorized(error, httpClient),
)
```

- [ ] **Step 7: Add MSW handlers for the HTTP tests**

Replace `src/mocks/handlers.ts` with:

```ts
import { HttpResponse, http } from 'msw'

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  // Echoes the Authorization header back so tests can assert bearer injection.
  http.get('/api/echo-auth', ({ request }) => {
    return HttpResponse.json({ authorization: request.headers.get('authorization') })
  }),
]
```

- [ ] **Step 8: Write the failing test for the client**

Create `src/shared/lib/http/client.test.ts`:

```ts
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setTokens } from '@/features/auth/auth-tokens'
import { server } from '@/mocks/server'
import { httpClient } from './client'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('httpClient', () => {
  it('injects the bearer token from localStorage', async () => {
    setTokens({ accessToken: 'token-123', refreshToken: 'refresh-123' })
    const { data } = await httpClient.get<{ authorization: string }>('/echo-auth')
    expect(data.authorization).toBe('Bearer token-123')
  })

  it('refreshes once on 401, then retries the original request', async () => {
    setTokens({ accessToken: 'expired', refreshToken: 'good-refresh' })
    let attempt = 0
    server.use(
      http.get('/api/protected', () => {
        attempt += 1
        if (attempt === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json({ ok: true })
      }),
      http.post('/api/auth/refresh', () => {
        return HttpResponse.json({ accessToken: 'fresh', refreshToken: 'fresh-refresh' })
      }),
    )
    const { data } = await httpClient.get<{ ok: boolean }>('/protected')
    expect(data).toEqual({ ok: true })
    expect(localStorage.getItem('sh.auth.access')).toBe('fresh')
  })

  it('clears tokens and redirects when refresh fails', async () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { pathname: '/leads', search: '', assign })
    setTokens({ accessToken: 'expired', refreshToken: 'bad-refresh' })
    server.use(
      http.get('/api/protected', () => new HttpResponse(null, { status: 401 })),
      http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 401 })),
    )
    await expect(httpClient.get('/protected')).rejects.toBeDefined()
    expect(localStorage.getItem('sh.auth.access')).toBeNull()
    expect(assign).toHaveBeenCalledWith('/login?returnUrl=%2Fleads')
    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm test -- client.test`
Expected: PASS (3 tests). If MSW reports an unhandled request, confirm the handler paths begin with `/api`.

- [ ] **Step 10: Commit**

```bash
git add src/shared/lib/http/ src/mocks/handlers.ts
git commit -m "feat(scaf-8): axios client with refresh-once-then-logout interceptor"
```

---

### Task 4: SCAF-8 — `useAuth` hook + HTTP client ADR

**Files:**
- Create: `src/features/auth/use-auth.ts`
- Create: `src/features/auth/use-auth.test.tsx`
- Create: `docs/adr/0004-http-client.md`

- [ ] **Step 1: Write the failing test for `useAuth`**

Create `src/features/auth/use-auth.test.tsx`:

```tsx
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { clearTokens, setTokens } from './auth-tokens'
import { useAuth } from './use-auth'

afterEach(() => {
  localStorage.clear()
})

describe('useAuth', () => {
  it('reports unauthenticated when no token is present', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('reacts to token set and clear', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    })
    expect(result.current.isAuthenticated).toBe(true)
    act(() => {
      clearTokens()
    })
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- use-auth`
Expected: FAIL — cannot resolve `./use-auth`.

- [ ] **Step 3: Implement `useAuth`**

Create `src/features/auth/use-auth.ts`:

```ts
import { useSyncExternalStore } from 'react'
import { getAccessToken, subscribeToTokens } from './auth-tokens'
import type { AuthState } from './auth.types'

/**
 * The single source of truth for `isAuthenticated`, derived from token
 * presence. Reactive via `useSyncExternalStore` over the token store.
 * (`/me` boot validation is a documented future hook — not built in Phase B.)
 */
export function useAuth(): AuthState {
  const isAuthenticated = useSyncExternalStore(
    subscribeToTokens,
    () => getAccessToken() !== null,
  )
  return { isAuthenticated }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- use-auth`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the HTTP client ADR**

Create `docs/adr/0004-http-client.md`:

```markdown
# 0004 — HTTP client: Axios with refresh-once interceptor

**Status:** Accepted · 2026-05-20

## Context

SCAF-8 needs one HTTP layer: base URL, bearer injection, and a 401
refresh-then-retry flow. Two options were weighed — an Axios instance with
interceptors, or bare `fetch` called inside TanStack Query's `queryFn`.

## Decision

Use a single configured **Axios 1.x** instance (`src/shared/lib/http/client.ts`).
A request interceptor injects the bearer token; a response interceptor runs the
refresh-once-then-logout flow. TanStack Query owns caching and retries.

Rationale: the 401 → refresh → retry-original-request flow is materially
simpler and less error-prone via an Axios response interceptor than hand-rolled
around `fetch`. The ~13 KB gzipped cost is acceptable for a primitive used by
every feature.

## Token storage tradeoff

Tokens are kept in `localStorage` (`sh.auth.access` / `sh.auth.refresh`). This
**knowingly diverges** from the spec's HttpOnly-cookie target: `localStorage`
is readable by any XSS payload. It is a deliberate, time-boxed tradeoff to
unblock Phase B. Migration to HttpOnly cookies is tracked as a follow-up ticket.

## Limitations

- No concurrent-request refresh queueing. If several requests 401 at once each
  triggers its own refresh attempt; the contract is refresh-once-then-logout,
  not a deduplicated refresh. Revisit if it causes thrash.
```

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/use-auth.ts src/features/auth/use-auth.test.tsx docs/adr/0004-http-client.md
git commit -m "feat(scaf-8): useAuth hook + http client ADR"
```

---

### Task 5: SCAF-9 — TanStack Query baseline

**Files:**
- Create: `src/shared/lib/query/query-client.ts`
- Create: `src/shared/lib/query/keys.ts`
- Create: `src/shared/lib/query/keys.test.ts`
- Create: `src/shared/lib/query/optimistic.ts`
- Create: `src/shared/lib/query/optimistic.test.ts`
- Create: `src/shared/lib/query/websocket.ts`

- [ ] **Step 1: Implement the query client factory**

Create `src/shared/lib/query/query-client.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'

/**
 * Stale-time table (ms) per data type — from rebuild-spec/12-state.md.
 * Provisional: values get tuned as the first 2–3 features reveal real usage.
 */
export const STALE_TIME = {
  userProfile: 5 * 60_000,
  list: 30_000,
  config: 10 * 60_000,
  dashboard: 60_000,
  realtime: 0,
} as const

/** Creates a configured QueryClient. Use the factory in tests for isolation. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.list,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

/** The app-wide singleton, shared by the provider tree and the router context. */
export const queryClient = createQueryClient()
```

- [ ] **Step 2: Write the failing test for `keys`**

Create `src/shared/lib/query/keys.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { authKeys, createQueryKeys } from './keys'

describe('createQueryKeys', () => {
  it('namespaces every key under the feature name', () => {
    const keys = createQueryKeys('leads')
    expect(keys.all).toEqual(['leads'])
    expect(keys.list({ status: 'open' })).toEqual(['leads', 'list', { status: 'open' }])
    expect(keys.detail('lead-1')).toEqual(['leads', 'detail', 'lead-1'])
  })

  it('exposes a worked example for the auth feature', () => {
    expect(authKeys.all).toEqual(['auth'])
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test -- query/keys`
Expected: FAIL — cannot resolve `./keys`.

- [ ] **Step 4: Implement `keys`**

Create `src/shared/lib/query/keys.ts`:

```ts
/**
 * Type-safe query-key factory. Each feature owns one namespace; co-locate the
 * feature's `createQueryKeys('<feature>')` call in its folder.
 */
export function createQueryKeys<const Feature extends string>(feature: Feature) {
  return {
    all: [feature] as const,
    list: (params?: Record<string, unknown>) => [feature, 'list', params ?? {}] as const,
    detail: (id: string) => [feature, 'detail', id] as const,
  }
}

/** Worked example — the auth feature's keys. */
export const authKeys = createQueryKeys('auth')
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test -- query/keys`
Expected: PASS (2 tests).

- [ ] **Step 6: Write the failing test for `optimisticUpdate`**

Create `src/shared/lib/query/optimistic.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createQueryClient } from './query-client'
import { optimisticUpdate } from './optimistic'

describe('optimisticUpdate', () => {
  it('applies the update and can roll back to the previous value', async () => {
    const qc = createQueryClient()
    qc.setQueryData(['counter'], 1)

    const ctx = await optimisticUpdate<number>(qc, ['counter'], (n) => (n ?? 0) + 1)
    expect(qc.getQueryData(['counter'])).toBe(2)
    expect(ctx.previous).toBe(1)

    ctx.rollback()
    expect(qc.getQueryData(['counter'])).toBe(1)
  })
})
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `pnpm test -- optimistic`
Expected: FAIL — cannot resolve `./optimistic`.

- [ ] **Step 8: Implement `optimistic`**

Create `src/shared/lib/query/optimistic.ts`:

```ts
import type { QueryClient, QueryKey } from '@tanstack/react-query'

export interface OptimisticContext<T> {
  previous: T | undefined
  rollback: () => void
}

/**
 * Cancels in-flight queries for `key`, snapshots the current value, applies
 * `updater`, and returns a `rollback()` to restore the snapshot on failure.
 */
export async function optimisticUpdate<T>(
  queryClient: QueryClient,
  key: QueryKey,
  updater: (current: T | undefined) => T,
): Promise<OptimisticContext<T>> {
  await queryClient.cancelQueries({ queryKey: key })
  const previous = queryClient.getQueryData<T>(key)
  queryClient.setQueryData<T>(key, updater(previous))
  return {
    previous,
    rollback: () => {
      queryClient.setQueryData<T>(key, previous)
    },
  }
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm test -- optimistic`
Expected: PASS (1 test).

- [ ] **Step 10: Implement the WebSocket cache bridge**

Create `src/shared/lib/query/websocket.ts`:

```ts
import type { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * PROVISIONAL (SCAF-9). Bridges a WebSocket message stream into the query
 * cache. The helper shape WILL change once Inbox/Dialer reveal real usage —
 * treat this as a placeholder seam, not a stable API.
 */
export interface CacheSubscription {
  unsubscribe: () => void
}

export function subscribeToCache<T>(
  socket: Pick<WebSocket, 'addEventListener' | 'removeEventListener'>,
  queryClient: QueryClient,
  key: QueryKey,
  apply: (current: T | undefined, message: MessageEvent) => T,
): CacheSubscription {
  const listener = (event: Event): void => {
    queryClient.setQueryData<T>(key, (current) => apply(current, event as MessageEvent))
  }
  socket.addEventListener('message', listener)
  return {
    unsubscribe: () => socket.removeEventListener('message', listener),
  }
}
```

- [ ] **Step 11: Commit**

```bash
git add src/shared/lib/query/
git commit -m "feat(scaf-9): tanstack query client, key factory, optimistic + ws helpers"
```

---

### Task 6: SCAF-10 — Zustand UI store

**Files:**
- Create: `src/app/store/ui-store.ts`
- Create: `src/app/store/ui-store.test.ts`
- Create: `src/app/store/use-apply-theme.ts`
- Modify: `biome.jsonc`
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Write the failing test for `useUIStore`**

Create `src/app/store/ui-store.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest'
import { useUIStore } from './ui-store'

afterEach(() => {
  localStorage.clear()
  useUIStore.setState({ theme: 'light', sidebarCollapsed: false })
})

describe('useUIStore', () => {
  it('toggles the theme', () => {
    useUIStore.getState().setTheme('dark')
    expect(useUIStore.getState().theme).toBe('dark')
  })

  it('toggles the sidebar', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })

  it('persists state to localStorage', () => {
    useUIStore.getState().setTheme('dark')
    expect(localStorage.getItem('sh.ui')).toContain('dark')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- ui-store`
Expected: FAIL — cannot resolve `./ui-store`.

- [ ] **Step 3: Implement `useUIStore`**

Create `src/app/store/ui-store.ts`:

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { env } from '@/shared/lib/env'

export type Theme = 'light' | 'dark'

interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
}

/**
 * Global UI state only — theme and sidebar. Server state belongs in TanStack
 * Query; component-local state belongs in `useState`.
 *
 * `persist` is opt-in per slice: this slice durably persists to localStorage.
 * `devtools` is runtime-disabled outside development via the `enabled` option.
 */
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarCollapsed: false,
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      }),
      { name: 'sh.ui' },
    ),
    { name: 'sh-ui-store', enabled: env.VITE_APP_ENV === 'development' },
  ),
)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- ui-store`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the theme-bridge hook**

Create `src/app/store/use-apply-theme.ts`:

```ts
import { useEffect } from 'react'
import { useUIStore } from './ui-store'

/**
 * Reflects the store's `theme` onto `<html data-theme="…">`, which the SCAF-2
 * CSS tokens key off. Call once, high in the tree (the root route component).
 */
export function useApplyTheme(): void {
  const theme = useUIStore((state) => state.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
```

- [ ] **Step 6: Forbid Redux imports via Biome**

In `biome.jsonc`, add a `style` block inside `linter.rules` (alongside the existing `correctness`, `suspicious`, `a11y`, `complexity` blocks):

```jsonc
      "style": {
        "noRestrictedImports": {
          "level": "error",
          "options": {
            "paths": {
              "redux": "Use Zustand for global UI state — see CONTRIBUTING.md.",
              "@reduxjs/toolkit": "Use Zustand for global UI state — see CONTRIBUTING.md.",
              "react-redux": "Use Zustand for global UI state — see CONTRIBUTING.md."
            }
          }
        }
      },
```

- [ ] **Step 7: Run lint to confirm the rule is accepted**

Run: `pnpm lint`
Expected: PASS. If Biome reports `noRestrictedImports` is an unknown rule in the `style` group, move the block under `nursery` instead and re-run.

- [ ] **Step 8: Document the state convention in CONTRIBUTING.md**

Append to `CONTRIBUTING.md`:

```markdown

## State management

- **Server state** → TanStack Query. Never `useEffect`-fetch.
- **Global UI state** (theme, sidebar, global modals) → Zustand (`src/app/store/`).
- **Component-local state** → `useState`.
- **URL state** (filters, sort, pagination, active tab) → TanStack Router search params.

Redux is not used. `redux`, `@reduxjs/toolkit`, and `react-redux` imports are
blocked by a Biome `noRestrictedImports` rule.
```

- [ ] **Step 9: Commit**

```bash
git add src/app/store/ biome.jsonc CONTRIBUTING.md
git commit -m "feat(scaf-10): zustand ui store, theme bridge, redux import ban"
```

---

### Task 7: SCAF-7 — Router setup, root + index routes

**Files:**
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`
- Create: `src/app/router/router.tsx`
- Create: `src/routeTree.gen.ts` (generated)

- [ ] **Step 1: Create the root route**

Create `src/routes/__root.tsx`:

```tsx
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useApplyTheme } from '@/app/store/use-apply-theme'
import { env } from '@/shared/lib/env'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  useApplyTheme()
  return (
    <>
      <Outlet />
      {env.VITE_APP_ENV === 'development' ? <TanStackRouterDevtools /> : null}
    </>
  )
}
```

- [ ] **Step 2: Create the index route**

Create `src/routes/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="font-heading text-3xl font-semibold">Saleshandy</h1>
      <p className="text-muted-foreground text-sm">Core runtime online.</p>
    </main>
  )
}
```

- [ ] **Step 3: Generate the route tree**

Run: `pnpm gen:routes`
Expected: creates `src/routeTree.gen.ts`. If the CLI is not found, run `pnpm build` once instead — the Vite plugin generates the same file.

- [ ] **Step 4: Create the router**

Create `src/app/router/router.tsx`:

```tsx
import { createRouter } from '@tanstack/react-router'
import { queryClient } from '@/shared/lib/query/query-client'
import { routeTree } from '@/routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: PASS — routes are typed and `routeTree.gen.ts` resolves.

- [ ] **Step 6: Commit**

```bash
git add src/routes/__root.tsx src/routes/index.tsx src/app/router/router.tsx src/routeTree.gen.ts
git commit -m "feat(scaf-7): tanstack router setup, root + index routes"
```

---

### Task 8: SCAF-7 — Route guards, login + protected-example routes, ADR

**Files:**
- Create: `src/app/router/guards.ts`
- Create: `src/app/router/guards.test.ts`
- Create: `src/routes/login.tsx`
- Create: `src/routes/protected-example.tsx`
- Create: `docs/adr/0005-router-query-integration.md`
- Modify: `src/routeTree.gen.ts` (regenerated)

- [ ] **Step 1: Write the failing test for the guards**

Create `src/app/router/guards.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest'
import { clearTokens, setTokens } from '@/features/auth/auth-tokens'
import { AuthRoute, ConfigRoute, ProtectedRoute } from './guards'

afterEach(() => {
  clearTokens()
})

const ctx = { location: { href: '/protected-example?tab=details' } }

describe('route guards', () => {
  it('ProtectedRoute redirects an unauthenticated user', () => {
    expect(() => ProtectedRoute(ctx)).toThrow()
  })

  it('ProtectedRoute allows an authenticated user', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => ProtectedRoute(ctx)).not.toThrow()
  })

  it('AuthRoute redirects an authenticated user away from guest pages', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => AuthRoute()).toThrow()
  })

  it('AuthRoute allows a guest', () => {
    expect(() => AuthRoute()).not.toThrow()
  })

  it('ConfigRoute throws when the gate denies access', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => ConfigRoute({ hasAccess: false })(ctx)).toThrow()
  })

  it('ConfigRoute allows when the gate grants access', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => ConfigRoute({ hasAccess: true })(ctx)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- guards`
Expected: FAIL — cannot resolve `./guards`.

- [ ] **Step 3: Implement the guards**

Create `src/app/router/guards.ts`:

```ts
import { redirect } from '@tanstack/react-router'
import { getAccessToken } from '@/features/auth/auth-tokens'
import { safeReturnUrl } from '@/shared/lib/http/safe-return-url'

interface GuardContext {
  location: { href: string }
}

function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

/** Guest-only routes (login, signup). Authenticated users bounce to home. */
export function AuthRoute(): void {
  if (isAuthenticated()) {
    throw redirect({ to: '/' })
  }
}

/** Authenticated-only routes. Unauthenticated users go to login with returnUrl. */
export function ProtectedRoute(context: GuardContext): void {
  if (!isAuthenticated()) {
    throw redirect({
      to: '/login',
      search: { returnUrl: safeReturnUrl(context.location.href) },
    })
  }
}

export interface ConfigGate {
  /** Result of a plan / role / feature-flag check. The flag system lands in Phase C. */
  hasAccess: boolean
}

/**
 * Plan / role / feature-flag gated routes. Composes `ProtectedRoute` first,
 * then enforces the gate. Returns a `beforeLoad`-compatible function.
 */
export function ConfigRoute(gate: ConfigGate): (context: GuardContext) => void {
  return (context) => {
    ProtectedRoute(context)
    if (!gate.hasAccess) {
      throw redirect({ to: '/' })
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- guards`
Expected: PASS (6 tests).

- [ ] **Step 5: Create the login route**

Create `src/routes/login.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthRoute } from '@/app/router/guards'

const loginSearchSchema = z.object({
  returnUrl: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  beforeLoad: AuthRoute,
  validateSearch: loginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-heading text-2xl font-semibold">Sign in</h1>
    </main>
  )
}
```

- [ ] **Step 6: Create the protected-example route (Zod search params demo)**

Create `src/routes/protected-example.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ProtectedRoute } from '@/app/router/guards'

// Demonstrates Zod-validated, typed URL search params.
const searchSchema = z.object({
  tab: z.enum(['overview', 'details']).default('overview'),
})

export const Route = createFileRoute('/protected-example')({
  beforeLoad: ProtectedRoute,
  validateSearch: searchSchema,
  component: ProtectedExamplePage,
})

function ProtectedExamplePage() {
  const { tab } = Route.useSearch()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="font-heading text-2xl font-semibold">Protected example</h1>
      <p className="text-muted-foreground text-sm">Active tab: {tab}</p>
    </main>
  )
}
```

- [ ] **Step 7: Regenerate the route tree and typecheck**

Run: `pnpm gen:routes && pnpm typecheck`
Expected: PASS — `routeTree.gen.ts` now includes `/login` and `/protected-example`.

- [ ] **Step 8: Write the router ↔ query integration ADR**

Create `docs/adr/0005-router-query-integration.md`:

```markdown
# 0005 — TanStack Router ↔ TanStack Query integration

**Status:** Accepted · 2026-05-20

## Context

SCAF-7 routes can prefetch data in a `loader`; SCAF-9 owns the query cache.
They need one agreed pattern so loaders and components share cached data.

## Decision

The `QueryClient` singleton is passed into the router via `context`
(`createRouter({ context: { queryClient } })`, typed by
`createRootRouteWithContext<RouterContext>()`).

A route that needs data prefetched calls, in its `loader`:

    loader: ({ context }) => context.queryClient.ensureQueryData(<options>)

Components then read the **same query key** with `useQuery` /
`useSuspenseQuery`. `ensureQueryData` returns cached data when fresh and
fetches otherwise, so the loader warms the cache and the component is the
single render-time source of truth — no prop-drilling of loader data.

## Scope

Phase B wires the `context` plumbing and documents the pattern. No demo route
prefetches yet — the first real feature route applies it. Revisit if Suspense
boundaries or streaming change the ergonomics.
```

- [ ] **Step 9: Commit**

```bash
git add src/app/router/guards.ts src/app/router/guards.test.ts src/routes/login.tsx src/routes/protected-example.tsx src/routeTree.gen.ts docs/adr/0005-router-query-integration.md
git commit -m "feat(scaf-7): route guards, login + protected-example routes, integration ADR"
```

---

### Task 9: SCAF-11 — Error boundaries

**Files:**
- Create: `src/shared/lib/error/report.ts`
- Create: `src/shared/lib/error/report.test.ts`
- Create: `src/shared/lib/error/chunk-reload.ts`
- Create: `src/shared/lib/error/chunk-reload.test.ts`
- Create: `src/shared/lib/error/root-error-boundary.tsx`
- Create: `src/shared/lib/error/feature-boundary.tsx`
- Create: `src/shared/lib/error/feature-boundary.test.tsx`

- [ ] **Step 1: Write the failing test for `reportError`**

Create `src/shared/lib/error/report.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { reportError } from './report'

describe('reportError', () => {
  it('logs to console.error in development', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    reportError(new Error('boom'), { boundary: 'root' })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
```

> Note: `env.VITE_APP_ENV` is `development` under Vitest (the default mode), so this branch is exercised.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- error/report`
Expected: FAIL — cannot resolve `./report`.

- [ ] **Step 3: Implement `reportError`**

Create `src/shared/lib/error/report.ts`:

```ts
import { env } from '@/shared/lib/env'

export interface ErrorContext {
  [key: string]: unknown
}

/**
 * The single error-reporting change-point. Today: console in dev, no-op in
 * prod. When an error-reporting SDK (Sentry/Rollbar/etc.) is adopted, wire it
 * HERE and nowhere else — every boundary already routes through this function.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  if (env.VITE_APP_ENV === 'development') {
    console.error('[reportError]', error, context)
  }
  // Production: intentionally a no-op until a reporting tool is chosen (SCAF-11).
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- error/report`
Expected: PASS (1 test).

- [ ] **Step 5: Write the failing test for `chunk-reload`**

Create `src/shared/lib/error/chunk-reload.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleChunkLoadError } from './chunk-reload'

afterEach(() => {
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('handleChunkLoadError', () => {
  it('ignores non-chunk errors', () => {
    expect(handleChunkLoadError(new Error('regular bug'))).toBe(false)
  })

  it('reloads once on a ChunkLoadError, then stops', () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })

    const chunkError = new Error('Failed to fetch dynamically imported module')
    chunkError.name = 'ChunkLoadError'

    expect(handleChunkLoadError(chunkError)).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)

    // Second occurrence in the same session must NOT reload again.
    expect(handleChunkLoadError(chunkError)).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm test -- chunk-reload`
Expected: FAIL — cannot resolve `./chunk-reload`.

- [ ] **Step 7: Implement `chunk-reload`**

Create `src/shared/lib/error/chunk-reload.ts`:

```ts
const RELOAD_GUARD_KEY = 'sh.chunk-reload'

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.name === 'ChunkLoadError' ||
    /loading (css )?chunk|dynamically imported module|failed to fetch dynamically/i.test(
      error.message,
    )
  )
}

/**
 * If `error` is a lazy-chunk fetch failure (common right after a deploy),
 * triggers a one-shot full reload. A sessionStorage guard prevents reload
 * loops — a second occurrence returns false so the UI shows a manual prompt.
 * Returns true when it handled the error.
 */
export function handleChunkLoadError(error: unknown): boolean {
  if (!isChunkLoadError(error)) return false
  if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return false
  sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
  window.location.reload()
  return true
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm test -- chunk-reload`
Expected: PASS (2 tests).

- [ ] **Step 9: Implement the root error boundary**

Create `src/shared/lib/error/root-error-boundary.tsx`:

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/shared/components/ui/button'
import { handleChunkLoadError } from './chunk-reload'
import { reportError } from './report'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Top-of-tree boundary. Own implementation — no vendor SDK (SCAF-11). */
export class RootErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // A lazy-chunk failure → one-shot reload instead of showing the fallback.
    if (handleChunkLoadError(error)) return
    reportError(error, { boundary: 'root', componentStack: info.componentStack })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return <RootErrorFallback />
    }
    return this.props.children
  }
}

function RootErrorFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground text-sm">
        The app hit an unexpected error. Reloading usually fixes it.
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={() => window.location.reload()}>
          Reload
        </Button>
        {/* Placeholder — wired to the reporting tool when one is chosen (SCAF-11). */}
        <Button type="button" variant="outline" disabled>
          Report a problem
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 10: Implement the feature boundary**

Create `src/shared/lib/error/feature-boundary.tsx`:

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from './report'

interface Props {
  feature: string
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Isolates a single feature's crash so the rest of the app keeps working.
 * Feature owners opt in — there is no mandatory per-route wrapping policy.
 */
export class FeatureBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      boundary: 'feature',
      feature: this.props.feature,
      componentStack: info.componentStack,
    })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="text-muted-foreground rounded-md border border-dashed p-4 text-sm"
          >
            This section failed to load.
          </div>
        )
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 11: Write the test for `FeatureBoundary`**

Create `src/shared/lib/error/feature-boundary.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FeatureBoundary } from './feature-boundary'

function Boom(): never {
  throw new Error('feature crashed')
}

describe('FeatureBoundary', () => {
  it('renders an isolated fallback when a child throws', () => {
    // Suppress React's expected error logging for this intentional crash.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <div>
        <span>sibling stays</span>
        <FeatureBoundary feature="demo">
          <Boom />
        </FeatureBoundary>
      </div>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This section failed to load.')
    expect(screen.getByText('sibling stays')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('renders a custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <FeatureBoundary feature="demo" fallback={<p>custom fallback</p>}>
        <Boom />
      </FeatureBoundary>,
    )
    expect(screen.getByText('custom fallback')).toBeInTheDocument()
    spy.mockRestore()
  })
})
```

- [ ] **Step 12: Run the error-boundary tests**

Run: `pnpm test -- error/`
Expected: PASS (`report` 1, `chunk-reload` 2, `feature-boundary` 2).

- [ ] **Step 13: Commit**

```bash
git add src/shared/lib/error/
git commit -m "feat(scaf-11): root + feature error boundaries, chunk-reload, reportError"
```

---

### Task 10: Provider wiring, entry point, e2e, coverage gate

**Files:**
- Create: `src/app/providers/app-providers.tsx`
- Modify: `src/main.tsx`
- Delete: `src/App.tsx`, `src/shared/components/ui/button.test.tsx` stays; delete `src/App.tsx` only
- Modify: `e2e/app.spec.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Create the provider composition**

Create `src/app/providers/app-providers.tsx`:

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/app/router/router'
import { env } from '@/shared/lib/env'
import { RootErrorBoundary } from '@/shared/lib/error/root-error-boundary'
import { queryClient } from '@/shared/lib/query/query-client'

/**
 * Provisional provider tree (SCAF-16 finalizes ordering + adds theme/auth/
 * flags/toast/i18n). Order: error boundary → query → router.
 */
export function AppProviders() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {env.VITE_APP_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </RootErrorBoundary>
  )
}
```

- [ ] **Step 2: Rewrite the entry point**

Replace `src/main.tsx` with:

```tsx
import '@/shared/lib/env'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers/app-providers'
import '@/styles/globals.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
```

- [ ] **Step 3: Delete the obsolete `App.tsx`**

Run: `git rm src/App.tsx`
(The route tree's `index.tsx` is the home screen now. `src/shared/components/ui/button.test.tsx` and `button.tsx` remain — the Button is still used by the error fallback.)

- [ ] **Step 4: Update the e2e test**

Replace `e2e/app.spec.ts` with:

```ts
import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('homepage renders and has no axe violations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Saleshandy' })).toBeVisible()

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
})

test('an unauthenticated visit to a protected route redirects to login', async ({ page }) => {
  await page.goto('/protected-example')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})
```

- [ ] **Step 5: Extend the coverage `include` to the new well-tested files**

In `vitest.config.ts`, replace the `coverage.include` array with:

```ts
      include: [
        'src/shared/lib/utils.ts',
        'src/shared/components/ui/button.tsx',
        'src/shared/lib/http/safe-return-url.ts',
        'src/shared/lib/http/api-error.ts',
        'src/shared/lib/http/client.ts',
        'src/shared/lib/http/refresh.ts',
        'src/shared/lib/query/keys.ts',
        'src/shared/lib/query/optimistic.ts',
        'src/shared/lib/error/report.ts',
        'src/shared/lib/error/chunk-reload.ts',
        'src/shared/lib/error/feature-boundary.tsx',
        'src/app/router/guards.ts',
        'src/app/store/ui-store.ts',
        'src/features/auth/auth-tokens.ts',
        'src/features/auth/use-auth.ts',
      ],
```

> The `include` list is scoped to files with real unit coverage so the 70% gate stays honest (matching the Phase A approach). UI fallbacks, the provisional `websocket.ts` helper, generated route files, and thin wiring (`router.tsx`, `app-providers.tsx`) are intentionally excluded.

- [ ] **Step 6: Run the full gate suite**

Run each, expecting PASS:

```bash
pnpm gen:routes
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

Expected: Biome clean; `tsc -b` clean; all unit tests pass and coverage ≥ 70% on the included files; production build succeeds; both Playwright tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/providers/app-providers.tsx src/main.tsx e2e/app.spec.ts vitest.config.ts
git commit -m "feat(scaf-11): wire provider tree, swap entry to router, update e2e"
```

---

## Post-implementation

After all tasks pass:

1. **Final review** — dispatch a code reviewer over the whole branch diff (`git diff main...HEAD`).
2. **Merge** — fast-forward `yash/sal-1830-phase-b-core-runtime` into `main`, push `main` + branch to `origin`.
3. **Linear** — mark SAL-1830, SAL-1831, SAL-1832, SAL-1833, SAL-1834 Done with per-issue verification comments.

## Spec coverage check

- SCAF-7 (SAL-1830): Tasks 1, 7, 8 — router plugin, file-based tree, three guards, Zod search params, dev-only devtools, committed `routeTree.gen.ts`, integration ADR. ✅
- SCAF-8 (SAL-1831): Tasks 1–4 — Axios instance, bearer injection, 401 refresh-once, `localStorage` tokens, `useAuth`, `safeReturnUrl` allow-list, ADR 0004. ✅
- SCAF-9 (SAL-1832): Task 5 — query client + stale-time table, key factory, optimistic helper, WebSocket helper; devtools dev-only in Task 10. ✅
- SCAF-10 (SAL-1833): Task 6 — Zustand `ui-store` with `persist`, `devtools` dev-only, no Redux, Biome `noRestrictedImports`, CONTRIBUTING note. ✅
- SCAF-11 (SAL-1834): Tasks 9, 10 — `RootErrorBoundary`, `FeatureBoundary`, `ChunkLoadError` one-shot reload, `reportError` change-point, fallback with Reload + placeholder. ✅
