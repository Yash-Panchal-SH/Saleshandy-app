import type { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * PROVISIONAL (SCAF-9). Bridges a WebSocket message stream into the query
 * cache. The helper shape WILL change once Inbox/Dialer reveal real usage —
 * treat this as a placeholder seam, not a stable API.
 */
export interface CacheSubscription {
  unsubscribe: () => void
}

export function subscribeToCache<T>(
  socket: Pick<WebSocket, 'addEventListener' | 'removeEventListener'>,
  queryClient: QueryClient,
  key: QueryKey,
  apply: (current: T | undefined, message: MessageEvent) => T,
): CacheSubscription {
  const listener = (event: Event): void => {
    queryClient.setQueryData<T>(key, (current) => apply(current, event as MessageEvent))
  }
  socket.addEventListener('message', listener)
  return {
    unsubscribe: () => socket.removeEventListener('message', listener),
  }
}
