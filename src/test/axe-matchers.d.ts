import 'vitest'

declare module 'vitest' {
  interface Assertion {
    // vitest-axe@0.1.0 uses `export type *` in its matchers.d.ts, which is incompatible
    // with verbatimModuleSyntax. This declaration augments vitest directly so that
    // toHaveNoViolations is available as a matcher.
    toHaveNoViolations(): void
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}
