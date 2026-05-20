# Onboarding

Target: a new engineer goes from a fresh clone to a running `pnpm dev` in
**under 15 minutes**. This is a living document — if you hit a snag that is not
covered here, add it.

## Prerequisites

- **Node 22+** — check with `node -v`.
- **Corepack** — ships with Node; it provisions the pinned pnpm version.

## Steps

```bash
git clone https://github.com/Yash-Panchal-SH/Saleshandy-app.git
cd Saleshandy-app
corepack enable          # activates the pnpm version pinned in package.json
pnpm install
pnpm dev                 # → http://localhost:5173
```

You should see the Saleshandy home screen.

## Verify your setup

Run the gates the pre-commit hook will run anyway:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

All three should pass on a clean checkout.

## Useful next reads

- [`README.md`](../README.md) — stack and scripts
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — workflow and conventions
- [`docs/runbooks/architecture.md`](runbooks/architecture.md) — how the app fits together
- [`docs/troubleshooting.md`](troubleshooting.md) — when something breaks

## Gotchas

- **`pnpm` not found** — run `corepack enable`; do not `npm install -g pnpm`.
- **Native build scripts blocked** — pnpm 11 blocks postinstall scripts by
  default. Approved builds are listed in `pnpm-workspace.yaml` (`allowBuilds`);
  add a package there if a new dependency needs its build step.
- **Routes not updating** — the route tree is generated. Run `pnpm gen:routes`
  after adding or renaming a file in `src/routes/`.
