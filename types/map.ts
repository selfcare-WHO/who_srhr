declare global {
  namespace Map {
    type DataPoints = {
      features: GeoJSON.Feature[]
      dataPoints: Prisma.DataPoint[]
    }

    type PopoverData = {
      country?: Prisma.Country
      value?: string
      element?: HTMLElement
      lngLat?: mapboxgl.LngLatLike
    }
  }
}
