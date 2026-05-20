import { afterEach, describe, expect, it } from 'vitest'
import { clearTokens, setTokens } from '@/features/auth/auth-tokens'
import { AuthRoute, ConfigRoute, ProtectedRoute } from './guards'

afterEach(() => {
  clearTokens()
})

const ctx = { location: { href: '/protected-example?tab=details' } }

describe('route guards', () => {
  it('ProtectedRoute redirects an unauthenticated user', () => {
    expect(() => ProtectedRoute(ctx)).toThrow()
  })

  it('ProtectedRoute allows an authenticated user', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => ProtectedRoute(ctx)).not.toThrow()
  })

  it('AuthRoute redirects an authenticated user away from guest pages', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => AuthRoute()).toThrow()
  })

  it('AuthRoute allows a guest', () => {
    expect(() => AuthRoute()).not.toThrow()
  })

  it('ConfigRoute throws when the gate denies access', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => ConfigRoute({ hasAccess: false })(ctx)).toThrow()
  })

  it('ConfigRoute allows when the gate grants access', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(() => ConfigRoute({ hasAccess: true })(ctx)).not.toThrow()
  })
})
