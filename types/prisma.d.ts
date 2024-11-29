import type {
  Prisma as PrismaClient,
  Domain as PrismaDomain,
  Country as PrismaCountry,
  Subgroup as PrismaSubgroup,
  Indicator as PrismaIndicator,
  DataPoint as PrismaDataPoint,
  Location as PrismaLocation
} from '@prisma/client'

declare global {
  namespace Prisma {
    export type Domain = PrismaDomain
    export type Country = PrismaCountry
    export type Subgroup = PrismaSubgroup
    export type Indicator = PrismaIndicator
    export type DataPoint = PrismaDataPoint
    export type Location = PrismaLocation

    export type DataPointWhereInput = PrismaClient.DataPointWhereInput

    export type IndicatorWithSubgroups = PrismaClient.IndicatorGetPayload<{
      include: { subgroups: true }
    }>
  }
}
