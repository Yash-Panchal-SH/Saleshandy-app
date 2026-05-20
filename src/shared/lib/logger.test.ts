import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from './logger'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('logger', () => {
  it('error always emits with context', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('boom', { code: 1 })
    expect(spy).toHaveBeenCalledWith('boom', { code: 1 })
  })

  it('warn always emits', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logger.warn('careful')
    expect(spy).toHaveBeenCalled()
  })

  it('info and debug emit in development (Vitest runs as development)', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
    logger.info('hello')
    logger.debug('trace')
    expect(info).toHaveBeenCalled()
    expect(debug).toHaveBeenCalled()
  })
})
