import { describe, expect, it, vi } from 'vitest'
import { reportError } from './report'

describe('reportError', () => {
  it('logs to console.error in development', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    reportError(new Error('boom'), { boundary: 'root' })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
