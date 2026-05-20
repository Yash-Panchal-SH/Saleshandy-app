import { afterEach, describe, expect, it } from 'vitest'
import { useUIStore } from './ui-store'

afterEach(() => {
  localStorage.clear()
  useUIStore.setState({ theme: 'light', sidebarCollapsed: false })
})

describe('useUIStore', () => {
  it('toggles the theme', () => {
    useUIStore.getState().setTheme('dark')
    expect(useUIStore.getState().theme).toBe('dark')
  })

  it('toggles the sidebar', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })

  it('persists state to localStorage', () => {
    useUIStore.getState().setTheme('dark')
    expect(localStorage.getItem('sh.ui')).toContain('dark')
  })
})
