import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import mapDataPoints from '../services/mapDataPoints'

// Cache the GeoJSON file in memory
let geoJsonFeatures: GeoJSON.Feature[] | null = null

export default defineEventHandler(async (event): Promise<Map.DataPoints> => {
  const { indicatorId }: { indicatorId: string } = getQuery(event)

  if (!indicatorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Indicator is required'
    })
  }

  try {
    // Load GeoJSON only once and cache it
    if (!geoJsonFeatures) {
      const relativePath = '../../assets/maps/who_countries.json'
      const currentDir = fileURLToPath(new URL('.', import.meta.url))
      const geoJsonPath = join(currentDir, relativePath)
      const { features } = JSON.parse(readFileSync(geoJsonPath, 'utf-8'))
      geoJsonFeatures = features
    }

    const dataPoints = await mapDataPoints(indicatorId)

    const dataPointsByCountry = new Map()
    dataPoints.forEach(dp => {
      dataPointsByCountry.set(dp.country.code, dp)
    })

    const linkedFeatures: GeoJSON.Feature[] =
      geoJsonFeatures?.map((feature: GeoJSON.Feature) => {
        const { ISO_3_CODE } = feature.properties as {
          ISO_3_CODE: string
        }
        const dataPoint = dataPointsByCountry.get(ISO_3_CODE)

        return {
          ...feature,
          properties: {
            ...feature.properties,
            dataPointId: dataPoint?.id.toString(),
            change: dataPoint?.change,
            originalValue: dataPoint?.originalValue,
            value: Number(dataPoint?.value)
          }
        }
      }) ?? []

    return { features: linkedFeatures, dataPoints }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch map data',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
})
