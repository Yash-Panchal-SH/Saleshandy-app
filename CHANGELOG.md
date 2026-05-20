# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Phase A — Boot baseline.** Vite 8 + React 19 + TypeScript-strict scaffold;
  Tailwind v4 + shadcn/ui; environment management with Zod boot validation;
  Biome lint/format; Husky + lint-staged + Commitlint hooks; Vitest + Playwright
  + MSW testing baseline.
- **Phase B — Core runtime.** TanStack Router with typed routes and guards;
  Axios HTTP client with refresh-once-then-logout auth; TanStack Query baseline;
  Zustand global UI store; root and per-feature error boundaries.
- **Phase C — Cross-cutting.** i18next + react-i18next (`en`, `fr`) with typed
  keys; finalized root provider tree.
- **Phase D/E/F — Quality, assets, docs.** Structured `logger` shim with a
  `noConsole` lint rule; explicit Biome a11y baseline; PWA-compatibility
  manifest; foundational documentation (this changelog, README, ADRs,
  runbooks, onboarding, troubleshooting).

[Unreleased]: https://github.com/Yash-Panchal-SH/Saleshandy-app
