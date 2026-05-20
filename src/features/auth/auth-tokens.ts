import type { AuthTokens } from './auth.types'

const ACCESS_KEY = 'sh.auth.access'
const REFRESH_KEY = 'sh.auth.refresh'

const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  emit()
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  emit()
}

/** Subscribe to token changes (for `useAuth`'s `useSyncExternalStore`). */
export function subscribeToTokens(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
