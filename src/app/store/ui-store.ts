import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { env } from '@/shared/lib/env'

export type Theme = 'light' | 'dark'

interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
}

/**
 * Global UI state only — theme and sidebar. Server state belongs in TanStack
 * Query; component-local state belongs in `useState`.
 *
 * `persist` is opt-in per slice: this slice durably persists to localStorage.
 * `devtools` is runtime-disabled outside development via the `enabled` option.
 */
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarCollapsed: false,
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      }),
      { name: 'sh.ui' },
    ),
    { name: 'sh-ui-store', enabled: env.VITE_APP_ENV === 'development' },
  ),
)
