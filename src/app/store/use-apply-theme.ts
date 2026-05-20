import { useEffect } from 'react'
import { useUIStore } from './ui-store'

/**
 * Reflects the store's `theme` onto `<html data-theme="…">`, which the SCAF-2
 * CSS tokens key off. Call once, high in the tree (the root route component).
 */
export function useApplyTheme(): void {
  const theme = useUIStore((state) => state.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
