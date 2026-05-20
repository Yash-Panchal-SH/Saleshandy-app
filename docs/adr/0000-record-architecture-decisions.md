# 0000 — Record architecture decisions

**Status:** Accepted · 2026-05-20

## Context

We need a lightweight, durable record of the significant architectural choices
made during the rebuild — why a thing was done, not just that it was done — so
future contributors can understand the reasoning and revisit it deliberately.

## Decision

We use Architecture Decision Records (ADRs), one Markdown file per decision in
`docs/adr/`, numbered sequentially (`NNNN-short-title.md`). Each ADR has a
**Status**, a **Context**, and a **Decision**, plus consequences/limitations
where relevant. New ADRs start from [`template.md`](template.md).

ADRs are immutable once Accepted: to change a decision, write a new ADR that
supersedes the old one and update the old one's status.

Number gaps are fine — some numbers were reserved for tickets that were
dropped or parked.

## Index

| ADR | Decision |
| --- | --- |
| 0001 | Biome adoption (lint + format) |
| 0003 | Theming — design tokens + `[data-theme]` |
| 0004 | HTTP client — Axios with refresh-once interceptor |
| 0005 | TanStack Router ↔ TanStack Query integration |
| 0006 | Root provider tree composition |
