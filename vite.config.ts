/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The portfolio edition is a self-contained static artifact mounted under
// raymondriter.dev/labs/twist behind one exact rewrite. It therefore has to
// carry its own asset base; see `src/portfolio.ts` for why it also routes in
// the hash. The default build stays rooted at / for the standalone deployment.
export default defineConfig(({ mode }) => ({
  base: mode === 'portfolio' ? '/labs/twist/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
