# Troubleshooting

Common errors and their fixes. Add to this as you discover new ones.

## `pnpm: command not found`

Corepack is not enabled. Run `corepack enable`. Do not install pnpm globally
with npm — the version is pinned in `package.json` and corepack honors it.

## Pre-commit hook rejects the commit

The hook runs Biome and `tsc` on staged files. Read the output:

- **Biome errors** — run `pnpm lint` to see them all; `pnpm format` fixes
  formatting. Lint *rule* violations must be fixed by hand (no auto-fix on commit).
- **Type errors** — run `pnpm typecheck`.
- **Commit message rejected** — messages must follow Conventional Commits and
  the subject must be lowercase (e.g. `feat(scope): add thing`).

## `Invalid environment configuration` on boot

`src/shared/lib/env.ts` Zod-validates the environment at startup. A required
`VITE_*` variable is missing or malformed. Check the `.env.*` file for the mode
you are running and the schema in `env.ts`.

## Route changes not reflected / `routeTree.gen.ts` type errors

The route tree is generated from `src/routes/`. Run `pnpm gen:routes` after
adding, renaming, or moving a route file. The generated file is committed.

## A new dependency's install step is blocked

pnpm 11 blocks dependency build scripts by default (`Ignored build scripts`).
Add the package under `allowBuilds` in `pnpm-workspace.yaml`, then `pnpm install`.

## `console.*` flagged by lint

Raw `console` is blocked in shipped code. Use the `logger` shim
(`src/shared/lib/logger.ts`).

## Tests fail with `Not implemented: HTMLCanvasElement` / `scrollTo`

These are benign jsdom warnings, not failures — jsdom does not implement every
browser API. They do not fail the test run.
