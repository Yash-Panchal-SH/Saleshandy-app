import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ['tsconfig.app.json'] })],
  test: {
    environment: 'jsdom',
    env: {
      VITE_APP_ENV: 'development',
      VITE_API_BASE_URL: '/api',
    },
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      include: [
        'src/shared/lib/utils.ts',
        'src/shared/components/ui/button.tsx',
        'src/shared/lib/http/safe-return-url.ts',
        'src/shared/lib/http/api-error.ts',
        'src/shared/lib/http/client.ts',
        'src/shared/lib/http/refresh.ts',
        'src/shared/lib/query/keys.ts',
        'src/shared/lib/query/optimistic.ts',
        'src/shared/lib/error/report.ts',
        'src/shared/lib/error/chunk-reload.ts',
        'src/shared/lib/error/feature-boundary.tsx',
        'src/app/router/guards.ts',
        'src/app/store/ui-store.ts',
        'src/features/auth/auth-tokens.ts',
        'src/features/auth/use-auth.ts',
      ],
      exclude: ['node_modules', 'dist', 'e2e', 'src/**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
