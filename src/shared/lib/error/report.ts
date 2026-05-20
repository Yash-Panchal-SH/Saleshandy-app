import { env } from '@/shared/lib/env'

export interface ErrorContext {
  [key: string]: unknown
}

/**
 * The single error-reporting change-point. Today: console in dev, no-op in
 * prod. When an error-reporting SDK (Sentry/Rollbar/etc.) is adopted, wire it
 * HERE and nowhere else — every boundary already routes through this function.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  if (env.VITE_APP_ENV === 'development') {
    console.error('[reportError]', error, context)
  }
  // Production: intentionally a no-op until a reporting tool is chosen (SCAF-11).
}
