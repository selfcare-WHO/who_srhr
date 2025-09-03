import { defineConfig } from 'prisma/config'

export default defineConfig({
  migrations: {
    seed: 'node node_modules/.bin/tsx ./prisma/seed.ts'
  }
})
