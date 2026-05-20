import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { toApiError } from './api-error'

describe('toApiError', () => {
  it('normalizes an Axios error with a response', () => {
    const err = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      data: { message: 'Lead not found', code: 'LEAD_NOT_FOUND' },
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    })
    expect(toApiError(err)).toEqual({
      status: 404,
      code: 'LEAD_NOT_FOUND',
      message: 'Lead not found',
    })
  })

  it('normalizes a non-Axios error', () => {
    expect(toApiError(new Error('boom'))).toEqual({
      status: 0,
      code: 'UNKNOWN',
      message: 'boom',
    })
  })
})
