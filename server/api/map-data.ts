import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import mapDataPoints from '../services/mapDataPoints'
import { useEnum } from '~/composables/useEnum'

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

    const { dataPoints, type } = indicator
    const dataPointsByCountry = new Map()

    const legend = new Map<string, Map.Legend>()

    const { targetStatus } = useEnum()

    dataPoints.forEach(dp => {
      dataPointsByCountry.set(dp.country.code, dp)

      if (
        type !== 'Nominal' ||
        legend.size === Object.keys(targetStatus).length ||
        (dp?.change &&
          legend.has(dp.change) &&
          legend.get(dp.change)?.name !== dp?.value)
      )
        return

      const statusKey = (dp?.change as keyof typeof targetStatus) ?? 'noData'

      const target = targetStatus[statusKey]
      const color = target?.color

      const name = indicator.translateValue
        ? JSON.parse(indicator.translateValue)?.[dp?.value || '']
        : dp?.value

      if (color && dp?.change) {
        legend.set(dp.change, {
          name: name ?? 'No Data',
          color
        })
      }
    })

    const sortedLegend = [...legend].sort(
      (a: [string, Map.Legend], b: [string, Map.Legend]) =>
        a[1].name.localeCompare(b[1].name)
    )

    const legendObject = Object.fromEntries(sortedLegend)

    const linkedFeatures: GeoJSON.Feature[] =
      geoJsonFeatures?.map((feature: GeoJSON.Feature) => {
        const { ISO_3_CODE } = feature.properties as {
          ISO_3_CODE: string
        }
        const dataPoint = dataPointsByCountry.get(ISO_3_CODE)

        const isRange = dataPoint?.value
          ? dataPoint.value.match(/^\d+-\d+$/) !== null
          : false
        const [rangeMin, rangeMax] = dataPoint?.value
          ?.split('-')
          .map(Number) ?? [0, 0]

        const rangeAverage = (rangeMin + rangeMax) / 2

        const isLessThan = dataPoint?.value?.includes('<')
        const isMoreThan = dataPoint?.value?.includes('>')

        const value = (() => {
          if (isRange) return rangeAverage
          if (isLessThan) return dataPoint?.value.trim().split('<')[1]
          if (isMoreThan) return dataPoint?.value.trim().split('>')[1]

          return dataPoint?.value
        })()

        return {
          ...feature,
          properties: {
            ...feature.properties,
            dataPointId: dataPoint?.id.toString(),
            change: dataPoint?.change,
            originalValue: dataPoint?.originalValue,
            value,
            isRange,
            isLessThan,
            isMoreThan
          }
        }
      }) ?? []

    return {
      features: linkedFeatures,
      dataPoints,
      legend: legendObject
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch map data',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
})
