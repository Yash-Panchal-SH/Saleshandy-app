import { env } from '@/shared/lib/env'

type LogContext = Record<string, unknown>

const isDev = env.VITE_APP_ENV === 'development'

/**
 * Structured client logger shim (SCAF-17 — minimal scaffolding).
 *
 * `debug` / `info` are no-ops outside development; `warn` / `error` always
 * emit. The `console` calls here are the ONE sanctioned use of `console` in
 * shipped code — everywhere else, call `logger.*`. The internals can later be
 * swapped for `pino-browser` (or anything) without touching call sites.
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (isDev) console.debug(message, context ?? {})
  },
  info(message: string, context?: LogContext): void {
    if (isDev) console.info(message, context ?? {})
  },
  warn(message: string, context?: LogContext): void {
    console.warn(message, context ?? {})
  },
  error(message: string, context?: LogContext): void {
    console.error(message, context ?? {})
  },
}
