import { QueryClient } from '@tanstack/react-query'

/**
 * Stale-time table (ms) per data type — from rebuild-spec/12-state.md.
 * Provisional: values get tuned as the first 2–3 features reveal real usage.
 */
export const STALE_TIME = {
  userProfile: 5 * 60_000,
  list: 30_000,
  config: 10 * 60_000,
  dashboard: 60_000,
  realtime: 0,
} as const

/** Creates a configured QueryClient. Use the factory in tests for isolation. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.list,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

/** The app-wide singleton, shared by the provider tree and the router context. */
export const queryClient = createQueryClient()
