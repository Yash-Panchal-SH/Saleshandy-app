import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setTokens } from '@/features/auth/auth-tokens'
import { server } from '@/mocks/server'
import { httpClient } from './client'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('httpClient', () => {
  it('injects the bearer token from localStorage', async () => {
    setTokens({ accessToken: 'token-123', refreshToken: 'refresh-123' })
    const { data } = await httpClient.get<{ authorization: string }>('/echo-auth')
    expect(data.authorization).toBe('Bearer token-123')
  })

  it('refreshes once on 401, then retries the original request', async () => {
    setTokens({ accessToken: 'expired', refreshToken: 'good-refresh' })
    let attempt = 0
    server.use(
      http.get('/api/protected', () => {
        attempt += 1
        if (attempt === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json({ ok: true })
      }),
      http.post('/api/auth/refresh', () => {
        return HttpResponse.json({ accessToken: 'fresh', refreshToken: 'fresh-refresh' })
      }),
    )
    const { data } = await httpClient.get<{ ok: boolean }>('/protected')
    expect(data).toEqual({ ok: true })
    expect(localStorage.getItem('sh.auth.access')).toBe('fresh')
  })

  it('clears tokens and redirects when refresh fails', async () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { pathname: '/leads', search: '', assign })
    setTokens({ accessToken: 'expired', refreshToken: 'bad-refresh' })
    server.use(
      http.get('/api/protected', () => new HttpResponse(null, { status: 401 })),
      http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 401 })),
    )
    await expect(httpClient.get('/protected')).rejects.toBeDefined()
    expect(localStorage.getItem('sh.auth.access')).toBeNull()
    expect(assign).toHaveBeenCalledWith('/login?returnUrl=%2Fleads')
    vi.unstubAllGlobals()
  })
})
