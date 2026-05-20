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
