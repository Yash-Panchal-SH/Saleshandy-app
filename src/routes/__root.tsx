import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useApplyTheme } from '@/app/store/use-apply-theme'
import { env } from '@/shared/lib/env'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  useApplyTheme()
  return (
    <>
      <Outlet />
      {env.VITE_APP_ENV === 'development' ? <TanStackRouterDevtools /> : null}
    </>
  )
}
