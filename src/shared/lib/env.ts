import { z } from 'zod'

/**
 * Environment schema — validated once, at module load.
 *
 * Designed to grow: adding a new variable is one Zod field here plus its
 * declaration in `src/vite-env.d.ts`. Nothing else in the app changes.
 */
const envSchema = z.object({
  // Base URL for all API calls. Relative ("/api") in dev; absolute per environment.
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']),
  // Reserved for SCAF-21 (PWA). Env values are strings — map "true"/"false" → boolean.
  VITE_PWA_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:\n', parsed.error.issues)
  throw new Error('Invalid environment configuration — see console for details.')
}

/**
 * Typed, validated environment. Import this everywhere — never read
 * `import.meta.env` directly outside this file.
 */
export const env = parsed.data

export type Env = typeof env
