declare global {
  namespace Map {
    type DataPoints = {
      features: GeoJSON.Feature[]
      dataPoints: Prisma.DataPoint[]
    }
  }
}
