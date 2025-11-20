import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Для GitHub Pages базовый путь — имя репозитория
  const base = '/Moderator-Stoya/'

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, '.'),
      }
    }
  }
})
