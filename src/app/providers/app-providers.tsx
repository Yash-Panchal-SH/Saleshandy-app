import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/app/router/router'
import { env } from '@/shared/lib/env'
import { RootErrorBoundary } from '@/shared/lib/error/root-error-boundary'
import { queryClient } from '@/shared/lib/query/query-client'

/**
 * Provisional provider tree (SCAF-16 finalizes ordering + adds theme/auth/
 * flags/toast/i18n). Order: error boundary → query → router.
 */
export function AppProviders() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {env.VITE_APP_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </RootErrorBoundary>
  )
}
