# 0006 — Root provider tree composition

**Status:** Accepted · 2026-05-20

## Context

SCAF-16 composes the providers that tie Phases A–C together. `rebuild-spec/07-global-setup.md`
sketched a 10-entry list, but several entries collapsed once the actual
primitives landed.

## Decision

The root composition lives in `src/app/providers/app-providers.tsx` (not the
spec's `src/root.tsx` — `src/app/` is the rebuild-spec folder convention).
Order, outermost first:

    RootErrorBoundary → I18nextProvider → QueryClientProvider → RouterProvider

Rationale for the order:

- **RootErrorBoundary** outermost — it must catch failures from every provider
  below it, including i18n/query init.
- **I18nextProvider** above the router — any routed component may call
  `useTranslation`.
- **QueryClientProvider** above the router — route loaders and components use
  the query cache.
- **RouterProvider** innermost — it renders the app's screens.

## What has no provider, and why

- **Theme** — handled by the Zustand `useUIStore` + the `useApplyTheme` hook
  (which reflects `theme` onto `[data-theme]`). No `<ThemeProvider>`.
- **Auth** — `useAuth` is a hook over the token store. No `<AuthProvider>`.
- **Feature flags** — dropped by decision; no `<FlagsProvider>`.
- **Error reporting** — the in-house `<RootErrorBoundary>`, never a vendor SDK.
- **Toast / modal portal** — not built yet; slot them in when they land.

## Adding a provider later

Insert it at the position matching its consumers: a provider must sit above
every component that consumes its context, and below any provider it itself
depends on. Most new providers belong between `I18nextProvider` and
`RouterProvider`. Third-party SDK initialization (SCAF-15) is mostly imperative
boot code, not React providers — it does not change this tree.
