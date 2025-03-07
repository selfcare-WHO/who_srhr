import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import mapDataPoints from '../services/mapDataPoints'
import { TargetStatus } from '~/types/enums'

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
    if (!geoJsonFeatures) {
      const relativePath = '../../assets/maps/who_countries.json'
      const currentDir = fileURLToPath(new URL('.', import.meta.url))
      const geoJsonPath = join(currentDir, relativePath)
      const { features } = JSON.parse(readFileSync(geoJsonPath, 'utf-8'))
      geoJsonFeatures = features
    }

    const indicator = await mapDataPoints(indicatorId)

    if (!indicator) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Indicator not found'
      })
    }

    const { dataPoints, type } = indicator
    const dataPointsByCountry = new Map()
    const legend = new Map()

    dataPoints.forEach(dp => {
      dataPointsByCountry.set(dp.country.code, dp)

      if (
        type !== 'Nominal' ||
        legend.size === Object.keys(TargetStatus).length
      )
        return

      if (
        legend.has(dp?.change) &&
        legend.get(dp?.change).value !== dp?.value
      ) {
        console.error(
          `Legend already has ${dp?.change} with value ${legend.get(dp?.change)} and ${dp?.value}`
        )
        return
      }

      const statusKey = (dp?.change as keyof typeof TargetStatus) ?? 'noData'

      const targetStatus = TargetStatus[statusKey]
      const color = targetStatus?.color

      if (color) {
        legend.set(dp?.change, {
          value: dp?.value ?? 'No Data',
          color
        })
      }
    })

    const legendObject = Object.fromEntries(legend)

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

    return { features: linkedFeatures, dataPoints, legend: legendObject }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch map data',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
})
