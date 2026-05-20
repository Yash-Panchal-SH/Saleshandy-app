import { describe, expect, it } from 'vitest'
import { authKeys, createQueryKeys } from './keys'

describe('createQueryKeys', () => {
  it('namespaces every key under the feature name', () => {
    const keys = createQueryKeys('leads')
    expect(keys.all).toEqual(['leads'])
    expect(keys.list({ status: 'open' })).toEqual(['leads', 'list', { status: 'open' }])
    expect(keys.detail('lead-1')).toEqual(['leads', 'detail', 'lead-1'])
  })

  it('exposes a worked example for the auth feature', () => {
    expect(authKeys.all).toEqual(['auth'])
  })
})
