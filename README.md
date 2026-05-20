# Saleshandy

The Saleshandy web application — a greenfield rebuild on a modern React stack.

This README explains how to run the app, how it boots, and how the runtime is
wired together. For contribution workflow see [`CONTRIBUTING.md`](CONTRIBUTING.md);
for a guided first-day walkthrough see [`docs/onboarding.md`](docs/onboarding.md).

## Tech stack

| Concern         | Choice                                              |
| --------------- | --------------------------------------------------- |
| Build / dev     | Vite 8                                              |
| UI              | React 19, TypeScript 6 (strict)                     |
| Styling         | Tailwind CSS v4, shadcn/ui (Radix primitives)       |
| Routing         | TanStack Router (file-based, typed)                 |
| Server state    | TanStack Query                                      |
| Client state    | Zustand (global UI), `useState` (local)             |
| HTTP            | Axios (refresh-once-then-logout interceptor)        |
| Validation      | Zod                                                 |
| i18n            | i18next + react-i18next (`en`, `fr`)                |
| Lint / format   | Biome                                               |
| Testing         | Vitest + Testing Library, Playwright, MSW           |
| Package manager | pnpm                                                |

## Prerequisites

- **Node.js 22+** — enforced by `engines` in `package.json`.
- **pnpm 11.1.3** — pinned via `packageManager`; provisioned by Corepack, so you
  do not install it manually.

## Getting started

```bash
corepack enable          # provisions the pinned pnpm version
pnpm install             # installs dependencies + sets up husky git hooks
pnpm dev                 # starts the dev server → http://localhost:5173
```

`pnpm install` also runs the `prepare` script, which installs the husky
pre-commit and commit-msg hooks (see [Code quality](#code-quality--git-hooks)).

## Environment configuration

The app reads configuration from Vite environment files. Vite loads `.env`
first, then the mode-specific file (`.env.development`, `.env.staging`,
`.env.production`) on top — the mode is selected by the `--mode` flag in each
script.

Every variable is **validated once at startup** by a Zod schema in
[`src/shared/lib/env.ts`](src/shared/lib/env.ts). If a required variable is
missing or malformed, the app throws immediately with a clear message rather
than failing later in an obscure way. Always import the typed `env` object from
that module — never read `import.meta.env` directly.

| Variable            | Required | Default | Purpose                                              |
| ------------------- | -------- | ------- | ---------------------------------------------------- |
| `VITE_API_BASE_URL` | no       | `/api`  | Base URL for all HTTP calls. Relative in dev.        |
| `VITE_APP_ENV`      | yes      | —       | One of `development` \| `staging` \| `production`.   |
| `VITE_PWA_ENABLED`  | no       | `false` | Reserved for PWA activation (`"true"`/`"false"`).    |

To add a new variable: add a field to the Zod schema in `env.ts` and declare its
type in `src/vite-env.d.ts`. Nothing else changes.

## Scripts

| Command            | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `pnpm dev`         | Dev server, mode `development`, HMR              |
| `pnpm build`       | Typecheck (`tsc -b`) + production build          |
| `pnpm build:staging` | Typecheck + build with the `staging` mode      |
| `pnpm preview`     | Serve the built `dist/` locally                  |
| `pnpm typecheck`   | `tsc -b` — type-check only, no emit              |
| `pnpm lint`        | Biome lint + format check                        |
| `pnpm format`      | Biome format, write changes                      |
| `pnpm test`        | Vitest unit/component run                        |
| `pnpm test:watch`  | Vitest in watch mode                             |
| `pnpm e2e`         | Playwright end-to-end tests                      |
| `pnpm gen:routes`  | Regenerate the TanStack Router route tree        |
| `pnpm i18n:check`  | Extract i18n keys, report gaps (warn-only)       |

## How the app runs

### Boot sequence

The entry point is [`src/main.tsx`](src/main.tsx). On load it:

1. **Imports `@/shared/lib/env` first** — this validates the environment before
   anything else runs. A bad config fails fast, here.
2. **Finds the `#root` element** in `index.html`; throws if it is missing.
3. **Mounts `<AppProviders />`** inside React `StrictMode`.

### Provider tree

[`src/app/providers/app-providers.tsx`](src/app/providers/app-providers.tsx)
composes the runtime, outermost first:

```
RootErrorBoundary  → catches render crashes, shows a recovery UI
  I18nextProvider  → makes translations available app-wide
    QueryClientProvider → TanStack Query cache + server-state config
      RouterProvider     → renders the matched route
      ReactQueryDevtools → dev only
```

Theme and auth deliberately have **no provider**: theme is the Zustand
`useUIStore` + `useApplyTheme`; auth is the `useAuth` hook. The rationale and
the rule for adding new providers live in
[`docs/adr/0006-provider-tree.md`](docs/adr/0006-provider-tree.md).

### Routing

Routes are **file-based**. Each file in `src/routes/` is a route; the
`@tanstack/router-plugin` Vite plugin watches them and regenerates
`src/routeTree.gen.ts` (committed, fully typed). Current routes:

| File                     | Path                 | Notes                          |
| ------------------------ | -------------------- | ------------------------------ |
| `__root.tsx`             | —                    | Root layout, wraps every route |
| `index.tsx`              | `/`                  | Home                           |
| `login.tsx`              | `/login`             | Auth entry                     |
| `protected-example.tsx`  | `/protected-example` | Demonstrates a route guard     |

After adding or renaming a route file, run `pnpm gen:routes` (the dev server
also regenerates it automatically). Route guards and the router instance live
in `src/app/router/`.

### Data, HTTP & auth

- **Server state** flows through TanStack Query. The shared `queryClient` is in
  `src/shared/lib/query/`.
- **HTTP** goes through a single Axios instance in `src/shared/lib/http/`. Its
  interceptor refreshes the access token **once** on a 401, then logs the user
  out if the refresh also fails.
- **Auth** state is exposed by the `useAuth` hook in `src/features/auth/`.

See [`docs/adr/0004-http-client.md`](docs/adr/0004-http-client.md) and
[`docs/adr/0005-router-query-integration.md`](docs/adr/0005-router-query-integration.md).

### Errors & logging

- Uncaught render errors hit `RootErrorBoundary`; per-feature failures can use
  the feature boundary. All errors route through `reportError`
  ([`src/shared/lib/error/report.ts`](src/shared/lib/error/report.ts)) — the
  single place to wire in an error-reporting SDK later.
- Never call `console.*` in shipped code. Use the `logger`
  ([`src/shared/lib/logger.ts`](src/shared/lib/logger.ts)); Biome enforces this.

## Project structure

```
src/
  app/         providers, router setup + guards, global Zustand store
  routes/      file-based route tree (→ routeTree.gen.ts)
  features/    feature modules (self-contained, e.g. auth/)
  shared/      cross-feature code — components/ui, lib (env, http, query, error)
  i18n/        translation resources + i18next setup
  styles/      global CSS + design tokens
  mocks/       MSW handlers for tests
  test/        test setup
docs/          ADRs, runbooks, onboarding, troubleshooting
rebuild-spec/  the source specification for the rebuild
```

Absolute imports use the `@/*` alias (→ `src/*`). No barrel files.

## Testing

- **Unit / component** — Vitest + Testing Library, with MSW mocking HTTP.
  Run `pnpm test` (or `pnpm test:watch`). Coverage gate is 70%.
- **End-to-end** — Playwright. Run `pnpm e2e`.

## Code quality & git hooks

- **Biome** handles both lint and format. `pnpm lint` checks; `pnpm format`
  writes.
- **TypeScript** runs in strict mode (`pnpm typecheck`).
- The **husky pre-commit hook** runs Biome + `tsc` on staged files. The
  **commit-msg hook** enforces Conventional Commits via commitlint (lowercase
  subject). Do not bypass hooks with `--no-verify` on protected branches.

Before finishing any change, run `pnpm lint`, `pnpm typecheck`, and `pnpm test`
— the same gates run in the pre-commit hook.

## Documentation

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — workflow, commits, conventions
- [`docs/onboarding.md`](docs/onboarding.md) — first-day setup walkthrough
- [`docs/adr/`](docs/adr/) — architecture decision records
- [`docs/runbooks/`](docs/runbooks/) — deploy, rollback, incident response, architecture
- [`docs/troubleshooting.md`](docs/troubleshooting.md) — common errors and fixes
- [`CHANGELOG.md`](CHANGELOG.md) — release history
