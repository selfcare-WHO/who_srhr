import type {
  Prisma as PrismaClient,
  Domain as PrismaDomain,
  Country as PrismaCountry,
  Subgroup as PrismaSubgroup,
  Indicator as PrismaIndicator,
  DataPoint as PrismaDataPoint
} from '@prisma/client'

declare global {
  namespace Prisma {
    export type Domain = PrismaDomain
    export type Country = PrismaCountry
    export type Subgroup = PrismaSubgroup
    export type Indicator = PrismaIndicator
    export type DataPoint = PrismaDataPoint

    export type DataPointWhereInput = PrismaClient.DataPointWhereInput

    export type IndicatorWithSubgroups = PrismaClient.IndicatorGetPayload<{
      include: { subgroups: true }
    }>

    // Serialized version of IndicatorWithSubgroups for use with API responses
    export type SerializedIndicatorWithSubgroups = {
      id: string
      name: string
      fullName: string
      subheading: string | null
      type: string
      hasTarget: boolean
      mask: string | null
      isLaw: boolean
      translateValue: string | null
      displayValue: string | null
      domainId: number
      tableView: boolean
      chartView: boolean
      mapView: boolean
      mapType: string | null
      displayName: string
      subgroups: {
        id: number
        name: string
        fullName: string
      }[]
    }

    export type DataPointWithType = DataPoint & {
      indicator: {
        type: string
        id: string
      }
    }

    // Type including the country relation
    export type DataPointWithCountry = PrismaClient.DataPointGetPayload<{
      include: { country: true }
    }>

    // Type for indicator with data points and country
    export type IndicatorWithDataPoints = PrismaClient.IndicatorGetPayload<{
      include: {
        dataPoints: {
          include: { country: true }
        }
      }
    }>
  }
}
