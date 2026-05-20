import { describe, expect, it } from 'vitest'
import { safeReturnUrl } from './safe-return-url'

describe('safeReturnUrl', () => {
  it('accepts a same-origin relative path', () => {
    expect(safeReturnUrl('/leads?tab=open')).toBe('/leads?tab=open')
  })

  it('rejects an absolute URL', () => {
    expect(safeReturnUrl('https://evil.com')).toBe('/')
  })

  it('rejects a protocol-relative URL', () => {
    expect(safeReturnUrl('//evil.com')).toBe('/')
  })

  it('falls back for null / empty input', () => {
    expect(safeReturnUrl(null)).toBe('/')
    expect(safeReturnUrl('')).toBe('/')
  })

  it('uses a custom fallback when provided', () => {
    expect(safeReturnUrl('javascript:alert(1)', '/home')).toBe('/home')
  })
})
