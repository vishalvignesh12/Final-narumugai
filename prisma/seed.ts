import dotenv from 'dotenv'
import { createHash } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

if (process.env.NODE_ENV === 'production') {
  throw new Error('The development seed is disabled in production.')
}

const phone = process.env.DEV_SEED_CUSTOMER_PHONE
const displayName = process.env.DEV_SEED_CUSTOMER_NAME || 'Development Customer'

if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
  throw new Error('DEV_SEED_CUSTOMER_PHONE must be a normalized E.164 phone number.')
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the PostgreSQL database.')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

try {
  if (!phone) {
    console.info('No development fixture requested; database seed completed without inserting users.')
  } else {
    await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        displayName,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    })
    console.info(`Development customer fixture ensured (phone hash ${createHash('sha256').update(phone).digest('hex').slice(0, 12)}).`)
  }
} finally {
  await prisma.$disconnect()
}
