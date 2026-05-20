import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleChunkLoadError } from './chunk-reload'

afterEach(() => {
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('handleChunkLoadError', () => {
  it('ignores non-chunk errors', () => {
    expect(handleChunkLoadError(new Error('regular bug'))).toBe(false)
  })

  it('reloads once on a ChunkLoadError, then stops', () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })

    const chunkError = new Error('Failed to fetch dynamically imported module')
    chunkError.name = 'ChunkLoadError'

    expect(handleChunkLoadError(chunkError)).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)

    // Second occurrence in the same session must NOT reload again.
    expect(handleChunkLoadError(chunkError)).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
