import { env } from '@/shared/lib/env'
import { logger } from '@/shared/lib/logger'

export interface ErrorContext {
  [key: string]: unknown
}

/**
 * The single error-reporting change-point. Today: logs in dev, no-op in prod.
 * When an error-reporting SDK (Sentry/Rollbar/etc.) is adopted, wire it HERE
 * and nowhere else — every boundary already routes through this function.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  if (env.VITE_APP_ENV === 'development') {
    logger.error('[reportError]', { error, ...context })
  }
  // Production: intentionally a no-op until a reporting tool is chosen (SCAF-11).
}
