import type { Prisma } from '@prisma/client'

declare global {
  namespace Chart {
    type DataPoint = {
      countryId: string
      countryName: string
      value?: string
      originalValue?: string
      isHighlighted: boolean
    }

    type Data = {
      indicatorId: string
      indicatorName: string
      subheading: string
      subgroupName: string
      type: Data.IndicatorDataType
      minValue: number
      maxValue: number
      dataPoints: DataPoint[]
    }

    type DataPointInclude = Prisma.DataPointGetPayload<{
      include: {
        country: true
        indicator: true
        subgroup: true
      }
    }>
  }
}
