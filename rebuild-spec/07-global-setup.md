# Global Setup

## Build & language
- Vite (or Next.js if SSR needed)
- React 19
- TypeScript: full strict mode (`strict: true`, `strictNullChecks: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`)
- Target ES2022+
- Node 22 LTS in Docker + CI

## Lint / format
- ESLint flat config (typescript-eslint, react, jsx-a11y, import)
- Prettier (singleQuote, trailingComma=all, 2-space)
- Stylelint for any remaining CSS
- Husky pre-commit: lint-staged + typecheck

## Routing
- TanStack Router (file-based + typed routes)
- Route-level code splitting on every screen
- Route guards: auth, protected, config — built on Router middleware
- Search-param state typed via Zod

## State management
- Tanstack Query for all server state (collapse legacy async thunks)
- Tag-based cache invalidation
- Zustand for ephemeral UI state where Redux is overkill

## HTTP
- Native `fetch` wrapper (or Axios 1.x if needed) with interceptors
- Bearer token injection
- Response unwrap + error normalization
- Retry policy (idempotent only)
- Request cancellation via AbortController

## Auth
- Token storage: HttpOnly cookie (preferred) — sessionStorage fallback only for OAuth tokens
- Refresh-token flow
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
- No secrets in client bundle (lint rule)

## Error boundary
- Root-level error boundary with Sentry capture
- Per-feature boundary for isolation
- Fallback UI with reload + report

## Provider tree (root, in order)
1. Error boundary
2. Redux Provider
3. Tanstack Query Provider 
4. Theme provider
5. Router
6. Auth provider
7. Feature-flag provider
8. Toast provider
9. Modal / overlay portal root
10. i18n provider
11. App

## PWA / service worker
- Manifest
- Service worker for offline shell + cache strategy
- Push notification registration (if needed)

## CI / CD
- GitHub Actions (consolidate from 5 deploy workflows + GitLab)
- Stages: install → typecheck → lint → unit test → build → e2e (Playwright) → bundle size check → Lighthouse → deploy
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
