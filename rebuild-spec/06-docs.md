# Docs

## Root
- README.md (setup + run + deploy)
- CLAUDE.md (AI project config)
- CONTRIBUTING.md (PR / branch / commit conventions)
- CHANGELOG.md (release notes)
- LICENSE

## Knowledge base (`knowledge-base/`)
- 01-quick-start.md
- 02-tech-stack.md
- 03-architecture.md
- 04-feature-map.md
- 05-routing-and-navigation.md
- 06-state-management.md
- 07-api-layer.md
- 08-component-system.md
- 09-code-patterns.md
- 10-development-workflow.md
- 11-glossary.md
- 12-design-system.md
- README.md (index)

## New additions
- ADRs in `docs/adr/` (numbered decision records)
- API contract docs (OpenAPI spec checked in)
- Runbooks (`docs/runbooks/`) — deploy, rollback, incident response
- Onboarding guide (`docs/onboarding.md`)
- Troubleshooting guide (`docs/troubleshooting.md`)

## Component docs
- Storybook (replace Styleguidist) — one story per component, props table, usage examples, a11y notes
- Visual regression snapshots (Chromatic or Loki)

## Inline
- JSDoc on all exported functions / hooks / types
- README in each `src/components/<feature>/` explaining the feature
