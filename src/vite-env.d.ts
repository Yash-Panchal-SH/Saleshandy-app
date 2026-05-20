/// <reference types="vite/client" />

// Augments Vite's ImportMetaEnv with the project's typed variables.
// The runtime-validated, transformed shape is `env` from `@/shared/lib/env`.
interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_PWA_ENABLED: string
}
