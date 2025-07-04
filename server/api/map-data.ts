import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { jenks } from 'simple-statistics'
import mapDataPoints from '../services/mapDataPoints'
import { useEnum } from '~/composables/useEnum'
import isNullish from '~/utils/isNullish'

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

    // Keep track of how many buckets we already assigned per target status
    const statusCounters = new Map<string, number>()

    dataPoints.forEach(dp => {
      dataPointsByCountry.set(dp.country.code, dp)

      if (type !== 'Nominal') return

      const bucketKey =
        indicator.displayValue === 'original_value'
          ? dp.originalValue
          : dp.value

      const bucketKeyStr = String(bucketKey)

      // Treat missing or invalid bucket values as "No Data" so they don't appear as literal "null" in the legend
      const isMissingBucket =
        bucketKey === null ||
        bucketKey === undefined ||
        bucketKeyStr === 'null' ||
        bucketKeyStr === 'undefined' ||
        bucketKeyStr.trim() === ''

      if (isMissingBucket) {
        if (!legend.has('No Data')) {
          legend.set('No Data', {
            name: 'No Data',
            hatchPattern: true
          })
        }
        return
      }

      if (!bucketKeyStr) return

      // Avoid duplicating legend entries
      if (legend.has(bucketKeyStr)) return

      const statusKey = String(dp?.change ?? 'noData')

      if (
        statusKey === 'noData' ||
        !targetStatus[statusKey as keyof typeof targetStatus]
      ) {
        legend.set(bucketKeyStr, {
          name: 'No Data',
          hatchPattern: true
        })
        return
      }

      const target = targetStatus[statusKey as keyof typeof targetStatus]

      const alreadyUsed = statusCounters.get(statusKey) ?? 0
      const chosenColor =
        alreadyUsed === 0
          ? target.color
          : (target.secondaryColor ?? target.color)

      statusCounters.set(statusKey, alreadyUsed + 1)

      legend.set(bucketKeyStr, {
        name: bucketKeyStr,
        color: chosenColor
      })
    })

    const sortedLegend = [...legend].sort(
      (a: [string, Map.Legend], b: [string, Map.Legend]) =>
        a[1].name.localeCompare(b[1].name)
    )

    const legendObject = Object.fromEntries(sortedLegend)

    const numericalValues = Array.from(dataPointsByCountry.values())
      .map(dp => Number(dp.value))
      .filter(val => !isNullish(val) && !isNaN(val))

    const NUM_BREAKS = 5
    let jenksBreaks: number[] = []

    try {
      // Ensure there are enough unique values for Jenks calculation
      const uniqueNumericalValues = [...new Set(numericalValues)]

      if (uniqueNumericalValues.length >= NUM_BREAKS) {
        const rawJenksBreaks = jenks(numericalValues, NUM_BREAKS)
        // Remove duplicates from Jenks breaks and ensure we have unique values
        jenksBreaks = [...new Set(rawJenksBreaks)]

        // If we lost breaks due to duplicates, try with fewer breaks
        if (
          jenksBreaks.length < NUM_BREAKS &&
          uniqueNumericalValues.length > jenksBreaks.length
        ) {
          const adjustedBreaks = Math.min(
            uniqueNumericalValues.length,
            jenksBreaks.length + 1
          )
          const newRawBreaks = jenks(numericalValues, adjustedBreaks)
          jenksBreaks = [...new Set(newRawBreaks)]
        }
      } else if (
        uniqueNumericalValues.length > 0 &&
        uniqueNumericalValues.length < NUM_BREAKS
      ) {
        // Use the unique values as breaks when we don't have enough for Jenks
        jenksBreaks = uniqueNumericalValues.sort((a, b) => a - b)
      }
      // If uniqueNumericalValues.length is 0, jenksBreaks remains []
    } catch (error) {
      console.error('Jenks calculation failed:', error)
      jenksBreaks = []
    }

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
            isMoreThan,
            bucketKey:
              type === 'Nominal'
                ? ((indicator.displayValue === 'original_value'
                    ? dataPoint?.originalValue
                    : dataPoint?.value) ?? null)
                : undefined
          }
        }
      }) ?? []

    return {
      features: linkedFeatures,
      dataPoints,
      legend: legendObject,
      jenksBreaks
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch map data',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
})
