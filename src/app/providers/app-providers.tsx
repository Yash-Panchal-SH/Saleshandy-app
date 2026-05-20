import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { I18nextProvider } from 'react-i18next'
import { router } from '@/app/router/router'
import i18n from '@/i18n'
import { env } from '@/shared/lib/env'
import { RootErrorBoundary } from '@/shared/lib/error/root-error-boundary'
import { queryClient } from '@/shared/lib/query/query-client'

/**
 * Root provider composition (SCAF-16). Order, outermost first:
 *   RootErrorBoundary → I18nextProvider → QueryClientProvider → RouterProvider
 *
 * Theme and auth intentionally have no provider — theme is the Zustand
 * `useUIStore` + `useApplyTheme`, auth is the `useAuth` hook. Feature flags
 * and a vendor error SDK are out of scope by decision.
 * See docs/adr/0006-provider-tree.md for the rationale and how to add providers.
 */
export function AppProviders() {
  return (
    <RootErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          {env.VITE_APP_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
      </I18nextProvider>
    </RootErrorBoundary>
  )
}
