declare global {
  namespace Map {
    type Legend = {
      [key: string]: {
        value: string
        dbValue?: string
        color: string
      }
    }

    type DataPoints = {
      features: GeoJSON.Feature[]
      dataPoints: Prisma.DataPoint[]
      legend: Data.Legend
    }

    type PopoverData = {
      country?: Prisma.Country
      value?: string
      element?: HTMLElement
      lngLat?: mapboxgl.LngLatLike
      placement?: 'top' | 'bottom' | 'left' | 'right'
    }
  }
}
