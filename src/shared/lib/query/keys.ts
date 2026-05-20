/**
 * Type-safe query-key factory. Each feature owns one namespace; co-locate the
 * feature's `createQueryKeys('<feature>')` call in its folder.
 */
export function createQueryKeys<const Feature extends string>(feature: Feature) {
  return {
    all: [feature] as const,
    list: (params?: Record<string, unknown>) => [feature, 'list', params ?? {}] as const,
    detail: (id: string) => [feature, 'detail', id] as const,
  }
}

/** Worked example — the auth feature's keys. */
export const authKeys = createQueryKeys('auth')
