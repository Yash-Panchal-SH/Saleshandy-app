import { describe, expect, it } from 'vitest'
import { optimisticUpdate } from './optimistic'
import { createQueryClient } from './query-client'

describe('optimisticUpdate', () => {
  it('applies the update and can roll back to the previous value', async () => {
    const qc = createQueryClient()
    qc.setQueryData(['counter'], 1)

    const ctx = await optimisticUpdate<number>(qc, ['counter'], (n) => (n ?? 0) + 1)
    expect(qc.getQueryData(['counter'])).toBe(2)
    expect(ctx.previous).toBe(1)

    ctx.rollback()
    expect(qc.getQueryData(['counter'])).toBe(1)
  })
})
