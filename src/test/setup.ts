import '@testing-library/jest-dom/vitest'
import type { MatcherResult, MatcherState } from 'vitest'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import { server } from '@/mocks/server'

// vitest-axe@0.1.0 ships `export type *` in matchers.d.ts, which is incompatible with
// verbatimModuleSyntax. Import the runtime value via a dynamic import so TypeScript
// does not attempt to resolve the package's type declaration for this path.
const { toHaveNoViolations } = await import('vitest-axe/dist/matchers.js')

type MatcherFn = (this: MatcherState, received: unknown) => MatcherResult

expect.extend({ toHaveNoViolations: toHaveNoViolations as unknown as MatcherFn })

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
