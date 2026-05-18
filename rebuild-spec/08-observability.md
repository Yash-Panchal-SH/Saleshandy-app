# Observability

## Errors
- Sentry init in entry point
- Sentry ErrorBoundary at root + per-feature
- Source-map upload in CI on every release
- Release tagging (commit SHA + env)
- Ignore list for known-noisy errors

## Performance — RUM
- Sentry Performance (BrowserTracing)
- Sentry Replay (100% on error, sampled on session)
- Web Vitals reporting (CLS / LCP / INP / FID / TTFB) → Sentry + PostHog
- Custom transactions for: app boot, route change, API call, form submit

## Custom instrumentation
- `performance.mark()` + `performance.measure()` for critical user paths
- PerformanceObserver for long tasks (>50ms)
- React Profiler API for slow renders (dev + prod-sampled)

## Product analytics
- PostHog init in entry
- Pageview autocapture
- Custom events for key actions (sequence created, prospect added, email sent, plan upgraded)
- User identification on login
- Feature-flag exposure tracking

## Bundle / asset
- Bundle analyzer (`rollup-plugin-visualizer` or equivalent)
- Per-PR bundle size diff comment
- Asset budget gates in CI

## Lighthouse / web vitals
- Lighthouse CI on every PR (performance / a11y / best-practices / SEO)
- Web Vitals dashboard (PostHog or Grafana)

## Logging
- Structured client logger (`pino`-style) with levels
- Console only in dev; sent to Sentry breadcrumbs in prod
- No raw `console.log` in shipped code

## Health checks
- Heartbeat ping to Sentry
- API status endpoint poll for maintenance-mode display
