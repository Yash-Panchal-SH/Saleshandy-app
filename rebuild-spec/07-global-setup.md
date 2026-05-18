# Global Setup

## Build & language
- Vite 6 (SPA — no SSR, no Next.js)
- React 19
- TypeScript: full strict mode (`strict: true`, `strictNullChecks: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`)
- Target ES2022+
- Node 22 LTS in Docker + CI

## Lint / format
- Biome OR ESLint flat config + Prettier — decision deferred to the App-Shared scaffolding ticket
- If ESLint: typescript-eslint, react, jsx-a11y, import
- If Biome: reconcile against eslint-plugin-jsx-a11y rule set (Biome's a11y coverage is a subset)
- Husky pre-commit: lint-staged + typecheck

## Styling
- Tailwind CSS v4 (CSS-first config, zero runtime)
- Design tokens via CSS custom properties on `:root` and `[data-theme="dark"]`
- shadcn/ui as the component layer — copy-paste, Radix primitives underneath, we own the code
- Tailwind config maps to CSS variables (runtime theme switching without rebuild)

## Routing
- TanStack Router (file-based + typed routes)
- Route-level code splitting on every screen
- Route guards: auth, protected, config — built on Router middleware
- Search-param state typed via Zod

## State management
- TanStack Query for all server state
- Zustand sparingly for truly global client state (theme, sidebar open/close, etc.)
- URL (TanStack Router search params) for filter / sort / pagination / active-tab / modal-open state
- Tag-based cache invalidation via `queryClient.invalidateQueries({ queryKey: [...] })`

## HTTP
- Native `fetch` wrapper (or Axios 1.x if needed) with interceptors
- Bearer token injection
- Response unwrap + error normalization
- Retry policy (idempotent only)
- Request cancellation via AbortController

## Auth
- Token storage: HttpOnly + Secure + SameSite=Lax cookie (preferred) — sessionStorage fallback only for OAuth tokens
- Refresh-token rotation flow
- Single source of truth for `isAuthenticated`
- Route guards consume auth context

## Third-party
- Sentry (errors + performance + replay)
- PostHog (product analytics — initialized in entry)
- Firebase (existing modules)
- Stripe.js
- Intercom
- Twilio Voice SDK

## i18n
- i18next + react-i18next (latest)
- Locales: en, fr (preserve), extensible
- Namespaces per feature
- Translation key linting

## Feature flags
- GrowthBook (or LaunchDarkly) — typed flags, default-safe
- Flag gating helper hook + component wrapper

## Env management
- Per-target `.env` files in `config/`
- Build script accepts `--mode` / `--env-path`
- `import.meta.env` typed via `vite-env.d.ts`
- Zod schema validates env at boot, typed `env.ts` re-export
- No secrets in client bundle (lint rule)

## Error boundary
- Root-level error boundary with Sentry capture
- Per-feature boundary for isolation
- Fallback UI with reload + report

## Provider tree (root, in order)
1. Error boundary
2. TanStack Query Provider
3. Theme provider
4. Router
5. Auth provider
6. Feature-flag provider
7. Toast provider
8. Modal / overlay portal root
9. i18n provider
10. App

## PWA / service worker
- Manifest
- Service worker for offline shell + cache strategy
- Push notification registration (if needed)

## CI / CD
- GitHub Actions pipeline
- Stages: install → typecheck → lint → unit test → build → e2e (Playwright) → bundle size gate → Lighthouse → deploy
- **Bundle-size gate**: size-limit (or bundlesize) — fail PR if initial bundle > 150KB gzipped
- **Lighthouse CI gates**: LCP <2.0s, INP <150ms, CLS <0.05, FCP <1.2s — fail PR on regression of any core vital
- Source map upload to Sentry per build
- Preview deploys per PR

## Testing
- Vitest (unit + component) — Testing Library 16+
- Playwright (e2e)
- jest-axe / axe-core for a11y
- MSW for API mocks
- Coverage gate: 70%+ for new code

## Docker
- Multi-stage on Node 22 → nginx 1.27 alpine
- Non-root user

## File / folder structure
```
src/
  app/                # providers, router setup, global styles
  features/           # feature-based modules (one folder per feature)
    <feature>/
      components/
      hooks/          # TanStack Query hooks + local state hooks
      schemas/        # Zod schemas
      routes/         # TanStack Router route + loader
      <feature>.types.ts
      <feature>.constants.ts
  shared/             # truly shared code only
    components/
      ui/             # shadcn/ui primitives
      layouts/        # page layout shells
    hooks/
    lib/              # api client, formatters, validators
    schemas/
```

Rules:
- Feature folders are self-contained; a feature should be deletable without breaking others
- No `utils.ts` / `helpers.ts` dumping ground — name files by what they do (`formatDate.ts`, `parseSearchParams.ts`)
- Absolute imports only (`@/features/leads/...`) — no `../../../` relatives
- No barrel exports (`index.ts` re-exports kill tree-shaking)
