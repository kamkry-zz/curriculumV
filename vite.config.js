import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'

function readImageTag() {
  try {
    const values = load(readFileSync('helm/curriculum-v/values.yaml', 'utf8'))
    return values.imageTag || 'latest'
  } catch {
    return 'latest'
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __IMAGE_TAG__: JSON.stringify(readImageTag()),
    __REPO_URL__: JSON.stringify('https://github.com/kamkry-zz/curriculumV'),
  },
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
