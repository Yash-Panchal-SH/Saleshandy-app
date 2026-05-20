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
