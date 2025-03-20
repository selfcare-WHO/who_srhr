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
      unit: string
      minValue: number
      maxValue: number
      globalTarget?: number
      dataPoints: DataPoint[]
    }
  }
}
