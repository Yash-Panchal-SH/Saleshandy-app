# Runbook — Deploy

> **Stub.** The deployment pipeline (SCAF-22) is parked. Flesh this out when CI/CD
> lands — it must end with a verified, reproducible production deploy.

## Scope

How to ship a build of the Saleshandy web app to an environment.

## Procedure (to be defined)

1. Pre-checks — green CI on the target commit (lint, typecheck, unit, e2e, build).
2. Build the production bundle (`pnpm build`) for the target environment mode.
3. Publish artifacts to the host / CDN.
4. Post-deploy verification — smoke-check the deployed URL.

## Rollback

See [`rollback.md`](rollback.md).
