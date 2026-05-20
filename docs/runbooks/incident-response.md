# Runbook — Incident response

> **Stub.** Expand once error reporting and observability rollouts land.

## Scope

What to do when the production app is broken or degraded.

## Procedure (to be defined)

1. **Acknowledge** — confirm the incident and its blast radius.
2. **Mitigate** — roll back ([`rollback.md`](rollback.md)) or apply a hotfix.
3. **Communicate** — notify stakeholders; track status.
4. **Resolve** — verify the fix in production.
5. **Review** — write a post-incident note; file follow-up tickets.

## Notes

Client errors currently route through `reportError` (`src/shared/lib/error/report.ts`),
which is a no-op in production until an error-reporting SDK is adopted. Until
then, incident detection relies on user reports and host-level monitoring.
