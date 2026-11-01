import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Next.js loads .env.local automatically. Prisma CLI does not, so load it explicitly.
dotenv.config({ path: '.env.local' })
dotenv.config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Use a direct/session Supabase connection for schema changes. Runtime uses DATABASE_URL.
    url: env('DIRECT_URL'),
  },
})
