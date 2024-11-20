import Prisma from '@prisma/client'
import type { PrismaClient as PrismaClientType } from '@prisma/client'
const { PrismaClient } = Prisma

declare global {
  var cachedPrisma: PrismaClientType
}

const isProd = process.env.NODE_ENV === 'production'
const dbFilePath = isProd ? '/disk/data/local.db' : '../prisma/local.db'

const config = {
  datasources: {
    db: {
      url: 'file:' + dbFilePath
    }
  }
}

let prisma: PrismaClientType = isProd
  ? new PrismaClient(config)
  : global.cachedPrisma ?? (global.cachedPrisma = new PrismaClient(config))

export default prisma
