declare global {
  namespace Chart {
    export interface DataPoint {
      countryId: string
      countryName: string
      value?: string
      originalValue?: string
      isHighlighted: boolean
    }

    export interface Data {
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
