import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const generateSourcemap = env.GENERATE_SOURCEMAP === 'true'

  return {
    plugins: [react()],
    build: {
      sourcemap: generateSourcemap,
    },
  }
})
