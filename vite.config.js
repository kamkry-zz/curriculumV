import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.test.*',
        'src/test-setup.js',
        'src/data/**',
      ],
    },
  },
})
