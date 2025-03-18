import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import mapDataPoints from '../services/mapDataPoints'
import { useEnums } from '~/composables/useEnums'

// Cache the GeoJSON file in memory
let geoJsonFeatures: GeoJSON.Feature[] | null = null

export default defineEventHandler(async (event): Promise<Map.DataPoints> => {
  const {
    indicatorId,
    subgroupId
  }: { indicatorId: string; subgroupId: string } = getQuery(event)

  if (!indicatorId || !subgroupId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Indicator and subgroup are required'
    })
  }

  const { targetStatus, impactOnSrhr } = useEnums()

  try {
    if (!geoJsonFeatures) {
      const relativePath = '../../assets/maps/who_countries.json'
      const currentDir = fileURLToPath(new URL('.', import.meta.url))
      const geoJsonPath = join(currentDir, relativePath)
      const { features } = JSON.parse(readFileSync(geoJsonPath, 'utf-8'))
      geoJsonFeatures = features
    }

    const indicator = await mapDataPoints(indicatorId, subgroupId)

    if (!indicator) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Indicator not found'
      })
    }

    const { dataPoints } = indicator
    const dataPointsByCountry = new Map()

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
            value: dataPoint?.value
          }
        }
      }) ?? []

    return {
      features: linkedFeatures,
      dataPoints
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch map data',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
})
