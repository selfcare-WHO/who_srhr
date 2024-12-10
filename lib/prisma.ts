import Prisma from '@prisma/client'
import path from 'path'
import type { PrismaClient as PrismaClientType } from '@prisma/client'

const { PrismaClient } = Prisma

declare global {
  var cachedPrisma: PrismaClientType
}

// Workaround to find the db file in production
const filePath = path.join(process.cwd(), './prisma/database.sqlite3')
const config = {
  datasources: {
    db: {
      url: 'file:' + filePath
    }
  }
}

let prisma: PrismaClientType
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(config)
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient(config)
  }
  prisma = global.cachedPrisma
}

export default prisma
