declare global {
  namespace Chart {
    export interface DataPoint {
      countryId: string
      countryName: string
      value: number
      isHighlighted: boolean
    }

    export interface Data {
      id: string
      name: string
      type: Data.IndicatorDataType
      minValue: number
      maxValue: number
      dataPoints: DataPoint[]
    }
  }
}
