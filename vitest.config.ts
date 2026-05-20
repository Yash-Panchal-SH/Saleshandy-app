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
      include: ['src/shared/lib/utils.ts', 'src/shared/components/ui/button.tsx'],
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
