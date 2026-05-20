# Architecture overview

A map of how the app is put together. For the *why* behind specific choices,
see the ADRs in [`../adr/`](../adr/).

## Shape

A client-rendered single-page app — no SSR. Vite builds it; the output is
static assets served by a web server.

## Boot path

`index.html` → `src/main.tsx` → `<AppProviders>`. `main.tsx` first imports
`@/shared/lib/env` (Zod-validates the environment, crashing early on misconfig)
and `@/i18n` (initializes i18next).

## Provider tree

`RootErrorBoundary → I18nextProvider → QueryClientProvider → RouterProvider`.
See [ADR 0006](../adr/0006-provider-tree.md) for the order rationale and how to
slot in a new provider.

## Layers

- **`src/routes/`** — file-based TanStack Router tree (`routeTree.gen.ts` is
  generated and committed). Guards live in `src/app/router/guards.ts`.
- **`src/features/<feature>/`** — self-contained feature modules. A feature
  owns its components, hooks, schemas, and types; deleting one must not break
  another.
- **`src/shared/`** — cross-feature code only: `components/ui` (shadcn),
  `lib` (http, query, error, logger, env), `hooks`.
- **`src/app/`** — app composition: providers, router setup, global store.

## Data flow

Server data flows through TanStack Query, fetched via the Axios client
(`src/shared/lib/http/`), which injects auth and handles 401 refresh. Global UI
state lives in the Zustand store; URL state lives in router search params.

## Cross-cutting

- **Errors** — `reportError` is the single reporting change-point.
- **Logging** — the `logger` shim is the only sanctioned `console` wrapper.
- **i18n** — i18next with per-feature namespaces.
