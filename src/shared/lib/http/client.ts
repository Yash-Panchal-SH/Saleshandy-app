import axios from 'axios'
import { getAccessToken } from '@/features/auth/auth-tokens'
import { env } from '@/shared/lib/env'
import { handleUnauthorized } from './refresh'

/**
 * Resolves the configured API base URL to an absolute URL at module load time.
 * Axios requires an absolute baseURL to function correctly in environments where
 * window.location may be partially stubbed (e.g., Vitest + jsdom tests).
 * In production, env.VITE_API_BASE_URL may already be absolute; if relative,
 * we prepend the current origin (stable for the page lifetime).
 */
function resolveBaseUrl(base: string): string {
  if (base.startsWith('http://') || base.startsWith('https://')) return base
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${base}`
}

/**
 * The single configured HTTP client. Base URL from env, JSON defaults,
 * bearer-token injection, and a refresh-once-then-logout 401 handler.
 *
 * SECURITY NOTE: tokens live in localStorage and are therefore XSS-exposed.
 * This is a deliberate, time-boxed divergence from the spec's HttpOnly-cookie
 * target — see docs/adr/0004-http-client.md. Migration is a follow-up ticket.
 */
export const httpClient = axios.create({
  baseURL: resolveBaseUrl(env.VITE_API_BASE_URL),
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => handleUnauthorized(error, httpClient),
)
