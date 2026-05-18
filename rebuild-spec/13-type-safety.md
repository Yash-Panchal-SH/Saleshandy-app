# Type Safety

## tsconfig
- `strict: true`
- `strictNullChecks: true`
- `noImplicitAny: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noFallthroughCasesInSwitch: true`
- `noImplicitOverride: true`
- `target: ES2022`
- `moduleResolution: bundler`

## Runtime validation
- Zod for all external boundaries (API responses, URL params, form inputs, env vars)
- Zod-derived types via `z.infer` — single source of truth

## API contracts
- OpenAPI spec checked into `docs/api/openapi.yaml`
- Types generated via `openapi-typescript` or `orval`
- Generation runs in CI; drift fails the build

## Form validation
- One Zod schema per form
- Schema shared between client validation and server payload type
- Field-level error messages from schema

## Env vars
- Zod schema validates `import.meta.env` at boot
- Typed `env.ts` re-export

## Internal modules
- All exported functions / hooks / components fully typed (no `any`)
- ESLint rule: `@typescript-eslint/no-explicit-any` = error

## Generics
- Generic data table, form field, dropdown, etc. — no `unknown` leakage

## CI
- `tsc --noEmit` gate on every PR
- API codegen step gates on contract drift
