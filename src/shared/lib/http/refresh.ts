import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { AuthTokens } from '@/features/auth/auth.types'
import { clearTokens, getRefreshToken, setTokens } from '@/features/auth/auth-tokens'
import { env } from '@/shared/lib/env'
import { safeReturnUrl } from './safe-return-url'

/** The refresh endpoint — never trigger a refresh loop on this path itself. */
export const REFRESH_PATH = '/auth/refresh'

/**
 * Resolved once at module load against the current origin so that the raw
 * axios.post call in handleUnauthorized always uses an absolute URL.
 * This avoids Axios's dependency on window.location.href for relative-URL
 * resolution, which breaks in tests that stub window.location.
 */
const REFRESH_URL: string = (() => {
  const base = env.VITE_API_BASE_URL
  if (base.startsWith('http://') || base.startsWith('https://')) return `${base}${REFRESH_PATH}`
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${base}${REFRESH_PATH}`
})()

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

/** Clears auth state and sends the user to login with a safe returnUrl. */
export function forceLogout(): void {
  clearTokens()
  const current = `${window.location.pathname}${window.location.search}`
  const returnUrl = safeReturnUrl(current)
  window.location.assign(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
}

/**
 * Response-interceptor rejection handler. On a 401, attempts a token refresh
 * exactly once, then retries the original request. Any failure → forceLogout.
 * No concurrent-request queueing — refresh-once-then-logout is the contract.
 */
export async function handleUnauthorized(
  error: AxiosError,
  client: AxiosInstance,
): Promise<unknown> {
  const config = error.config as RetryableConfig | undefined
  const isUnauthorized = error.response?.status === 401

  if (!isUnauthorized || !config || config._retried || config.url === REFRESH_PATH) {
    if (isUnauthorized) forceLogout()
    return Promise.reject(error)
  }

  config._retried = true
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    forceLogout()
    return Promise.reject(error)
  }

  try {
    const { data } = await axios.post<AuthTokens>(REFRESH_URL, {
      refreshToken,
    })
    setTokens(data)
    config.headers.Authorization = `Bearer ${data.accessToken}`
    return await client(config)
  } catch (refreshError) {
    forceLogout()
    return Promise.reject(refreshError)
  }
}
