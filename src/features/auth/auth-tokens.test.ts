import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  subscribeToTokens,
} from './auth-tokens'

afterEach(() => {
  localStorage.clear()
})

describe('auth-tokens', () => {
  it('stores and reads tokens', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    expect(getAccessToken()).toBe('a1')
    expect(getRefreshToken()).toBe('r1')
  })

  it('clears tokens', () => {
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('notifies subscribers on set and clear', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToTokens(listener)
    setTokens({ accessToken: 'a1', refreshToken: 'r1' })
    clearTokens()
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    setTokens({ accessToken: 'a2', refreshToken: 'r2' })
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
