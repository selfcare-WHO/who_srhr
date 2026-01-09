declare global {
  namespace Chart {
    type DataPoint = {
      countryId: string
      countryName: string
      value?: string
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
  }
}
