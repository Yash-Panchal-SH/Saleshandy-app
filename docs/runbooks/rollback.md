# Runbook — Rollback

> **Stub.** Finalize alongside the deployment pipeline (SCAF-22).

## When to roll back

A deploy has caused a user-facing regression that cannot be hotfixed quickly.

## Procedure (to be defined)

1. Identify the last known-good release.
2. Re-point the host / CDN to the known-good artifact.
3. Verify the restored build via a smoke check.
4. Open an incident — see [`incident-response.md`](incident-response.md).

## Notes

The app is a static SPA, so rollback is an artifact swap — there is no database
migration to reverse at the frontend layer.
