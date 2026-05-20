import { useSyncExternalStore } from 'react'
import type { AuthState } from './auth.types'
import { getAccessToken, subscribeToTokens } from './auth-tokens'

/**
 * The single source of truth for `isAuthenticated`, derived from token
 * presence. Reactive via `useSyncExternalStore` over the token store.
 * (`/me` boot validation is a documented future hook — not built in Phase B.)
 */
export function useAuth(): AuthState {
  const isAuthenticated = useSyncExternalStore(subscribeToTokens, () => getAccessToken() !== null)
  return { isAuthenticated }
}
