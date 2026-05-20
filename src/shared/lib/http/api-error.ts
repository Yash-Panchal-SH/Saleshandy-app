import axios from 'axios'

export interface ApiError {
  status: number
  code: string
  message: string
}

interface ApiErrorPayload {
  message?: string
  code?: string
}

/** Normalizes any thrown value (Axios or not) into a stable `ApiError` shape. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const payload = (error.response?.data ?? {}) as ApiErrorPayload
    return {
      status: error.response?.status ?? 0,
      code: payload.code ?? error.code ?? 'UNKNOWN',
      message: payload.message ?? error.message,
    }
  }
  if (error instanceof Error) {
    return { status: 0, code: 'UNKNOWN', message: error.message }
  }
  return { status: 0, code: 'UNKNOWN', message: 'Unknown error' }
}
