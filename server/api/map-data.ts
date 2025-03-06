import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import mapDataPoints from '../services/mapDataPoints'

export default defineEventHandler(async (event): Promise<Map.DataPoints> => {
  const { indicatorId }: { indicatorId: string } = getQuery(event)

  if (!indicatorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Indicator is required'
    })
  }

  try {
    const relativePath = '../../assets/maps/who_countries.json'
    const currentDir = fileURLToPath(new URL('.', import.meta.url))
    const geoJsonPath = join(currentDir, relativePath)
    const { features } = JSON.parse(readFileSync(geoJsonPath, 'utf-8'))
    const dataPoints = await mapDataPoints(indicatorId)

    const linkedFeatures: GeoJSON.Feature[] = features.map(
      (feature: GeoJSON.Feature) => {
        const { ISO_3_CODE } = feature.properties as {
          ISO_3_CODE: string
        }
        const dataPoint = dataPoints.find(dp => dp.country.code === ISO_3_CODE)

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
      }
    )

    return { features: linkedFeatures, dataPoints }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch map data',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
})
