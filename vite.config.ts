import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Router plugin MUST come before the React plugin.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: ['tsconfig.app.json'] }),
    // PWA (SCAF-21) — compatibility-only, intentionally NOT active. The manifest
    // already lives at public/site.webmanifest. Activating later is a single-block
    // change with no refactor:
    //   1. pnpm add -D vite-plugin-pwa
    //   2. add VitePWA({ registerType: 'autoUpdate', manifest: false }) to this array
    //   3. register the service worker in src/main.tsx
    //   4. flip VITE_PWA_ENABLED=true for the target environment
  ],
})
