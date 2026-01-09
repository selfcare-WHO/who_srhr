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
    type Domain = PrismaDomain
    type Country = PrismaCountry
    type Subgroup = PrismaSubgroup
    type Indicator = PrismaIndicator
    type DataPoint = PrismaDataPoint

    type DataPointWhereInput = PrismaClient.DataPointWhereInput

    type IndicatorWithSubgroups = PrismaClient.IndicatorGetPayload<{
      include: { subgroups: true }
    }>

    // Serialized version of IndicatorWithSubgroups for use with API responses
    type SerializedIndicatorWithSubgroups = {
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
      endnote: string | null
      subgroups: {
        id: number
        name: string
        fullName: string
        invertScale: boolean
      }[]
    }

    type DataPointWithType = DataPoint & {
      indicator: {
        type: string
        id: string
      }
    }

    // Type including the country relation
    type DataPointWithCountry = PrismaClient.DataPointGetPayload<{
      include: { country: true }
    }>

    // Type for indicator with data points and country
    type IndicatorWithDataPoints = PrismaClient.IndicatorGetPayload<{
      include: {
        dataPoints: {
          include: { country: true }
        }
      }
    }>
  }
}
