import { Prisma as PrismaClient } from '@prisma/client'

declare global {
  namespace Prisma {
    export type Domain = PrismaClient.Domain
    export type Country = PrismaClient.Country
    export type Subgroup = PrismaClient.Subgroup
    export type Indicator = PrismaClient.Indicator
    export type DataPoint = PrismaClient.DataPoint
    export type Location = PrismaClient.Location
  }
}
