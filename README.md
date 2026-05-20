# Saleshandy

The Saleshandy web application — a greenfield rebuild on a modern React stack.

## Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Build / dev    | Vite 8                                              |
| UI             | React 19, TypeScript 6 (strict)                     |
| Styling        | Tailwind CSS v4, shadcn/ui (Radix primitives)       |
| Routing        | TanStack Router (file-based, typed)                 |
| Server state   | TanStack Query                                      |
| Client state   | Zustand (global UI), `useState` (local)             |
| HTTP           | Axios (refresh-once-then-logout interceptor)        |
| Validation     | Zod                                                 |
| i18n           | i18next + react-i18next (`en`, `fr`)                |
| Lint / format  | Biome                                               |
| Testing        | Vitest + Testing Library, Playwright, MSW           |
| Package manager| pnpm                                                |

## Getting started

```bash
corepack enable          # provisions the pinned pnpm version
pnpm install
pnpm dev                 # http://localhost:5173
```

Node 22+ is required. New to the repo? See [`docs/onboarding.md`](docs/onboarding.md).

## Scripts

| Command            | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `pnpm dev`         | Dev server (mode `development`)                  |
| `pnpm build`       | Typecheck + production build                     |
| `pnpm preview`     | Serve the production build locally               |
| `pnpm typecheck`   | `tsc -b` — no emit                               |
| `pnpm lint`        | Biome lint + format check                        |
| `pnpm format`      | Biome format, write                              |
| `pnpm test`        | Vitest unit/component run                        |
| `pnpm test:watch`  | Vitest watch mode                                |
| `pnpm e2e`         | Playwright end-to-end tests                      |
| `pnpm gen:routes`  | Regenerate the TanStack Router route tree        |
| `pnpm i18n:check`  | Extract i18n keys, report gaps (warn-only)       |

## Project structure

```
src/
  app/         providers, router setup + guards, global store
  routes/      file-based route tree (→ routeTree.gen.ts)
  features/    feature modules (self-contained)
  shared/      cross-feature code — components/ui, lib, hooks
  i18n/        translation resources + setup
  styles/      global CSS + design tokens
docs/          ADRs, runbooks, onboarding, troubleshooting
rebuild-spec/  the source specification for the rebuild
```

## Documentation

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — workflow, commits, conventions
- [`docs/adr/`](docs/adr/) — architecture decision records
- [`docs/runbooks/`](docs/runbooks/) — deploy, rollback, incident response
- [`docs/troubleshooting.md`](docs/troubleshooting.md) — common errors and fixes
- [`CHANGELOG.md`](CHANGELOG.md)
