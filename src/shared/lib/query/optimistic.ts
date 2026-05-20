import type { QueryClient, QueryKey } from '@tanstack/react-query'

export interface OptimisticContext<T> {
  previous: T | undefined
  rollback: () => void
}

/**
 * Cancels in-flight queries for `key`, snapshots the current value, applies
 * `updater`, and returns a `rollback()` to restore the snapshot on failure.
 */
export async function optimisticUpdate<T>(
  queryClient: QueryClient,
  key: QueryKey,
  updater: (current: T | undefined) => T,
): Promise<OptimisticContext<T>> {
  await queryClient.cancelQueries({ queryKey: key })
  const previous = queryClient.getQueryData<T>(key)
  queryClient.setQueryData<T>(key, updater(previous))
  return {
    previous,
    rollback: () => {
      queryClient.setQueryData<T>(key, previous)
    },
  }
}
