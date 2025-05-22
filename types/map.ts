declare global {
  namespace Map {
    type DataPoints = {
      features: GeoJSON.Feature[]
      dataPoints: Prisma.DataPoint[]
      legend: Data.Legend
      jenksBreaks?: number[]
    }

    type PopoverData = {
      country?: Prisma.Country
      value?: string
      element?: HTMLElement
      lngLat?: mapboxgl.LngLatLike
      placement?: 'top' | 'bottom' | 'left' | 'right'
    }

    type Legend = {
      name: string
      color?: string
      hatchPattern?: boolean
    }

    type JenksKey =
      | 'jenks-0'
      | 'jenks-1'
      | 'jenks-2'
      | 'jenks-3'
      | 'jenks-4'

    type OtherKey = 'other'

    type StatusKey =
      | 'achieved'
      | 'challenges-remain'
      | 'major-challenges-remain'
      | 'data-not-available'
  }
}
