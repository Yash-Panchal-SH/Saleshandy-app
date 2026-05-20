import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { clearTokens, setTokens } from './auth-tokens'
import { useAuth } from './use-auth'

afterEach(() => {
  localStorage.clear()
})

describe('useAuth', () => {
  it('reports unauthenticated when no token is present', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('reacts to token set and clear', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    })
    expect(result.current.isAuthenticated).toBe(true)
    act(() => {
      clearTokens()
    })
    expect(result.current.isAuthenticated).toBe(false)
  })
})
