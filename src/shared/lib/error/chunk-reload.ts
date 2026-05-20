const RELOAD_GUARD_KEY = 'sh.chunk-reload'

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.name === 'ChunkLoadError' ||
    /loading (css )?chunk|dynamically imported module|failed to fetch dynamically/i.test(
      error.message,
    )
  )
}

/**
 * If `error` is a lazy-chunk fetch failure (common right after a deploy),
 * triggers a one-shot full reload. A sessionStorage guard prevents reload
 * loops — a second occurrence returns false so the UI shows a manual prompt.
 * Returns true when it handled the error.
 */
export function handleChunkLoadError(error: unknown): boolean {
  if (!isChunkLoadError(error)) return false
  if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return false
  sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
  window.location.reload()
  return true
}
