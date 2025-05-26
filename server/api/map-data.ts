import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { jenks } from 'simple-statistics'
import mapDataPoints from '../services/mapDataPoints'
import { useEnum } from '~/composables/useEnum'
import isNullish from '~/utils/isNullish'
import { capitalizeNominalValue } from '~/utils/capitalizeNominalValue'

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
      ) {
        return
      }

      const statusKey = (dp?.change as keyof typeof targetStatus) ?? 'noData'

      const target = targetStatus[statusKey]
      const color = target?.color

      const name = indicator.translateValue
        ? JSON.parse(indicator.translateValue)?.[dp?.value || '']
        : dp?.value

      if (color && dp?.change && name) {
        legend.set(dp.change, {
          name: capitalizeNominalValue(name) as string,
          color
        })
      } else {
        legend.set(dp.change ?? 'noData', {
          name: 'No Data',
          hatchPattern: true
        })
      }
    })

    const sortedLegend = [...legend].sort(
      (a: [string, Map.Legend], b: [string, Map.Legend]) =>
        a[1].name.localeCompare(b[1].name)
    )

    const legendObject = Object.fromEntries(sortedLegend)

    const processValue = (dataPoint: any): number | null => {
      if (!dataPoint?.value) return null

      const isRange = dataPoint.value.match(/^\d+-\d+$/) !== null
      if (isRange) {
        const [rangeMin, rangeMax] = dataPoint.value.split('-').map(Number)
        return (rangeMin + rangeMax) / 2
      }

      const isLessThan = dataPoint.value.includes('<')
      if (isLessThan) return Number(dataPoint.value.trim().split('<')[1])

      const isMoreThan = dataPoint.value.includes('>')
      if (isMoreThan) return Number(dataPoint.value.trim().split('>')[1])

      return Number(dataPoint.value)
    }

    // Process values and strictly filter to only include numbers
    const numericalValues: number[] = Array.from(dataPointsByCountry.values())
      .map(dp => processValue(dp))
      .filter((val): val is number => val !== null && !isNaN(val))

    console.log('🚀 ~: numericalValues', numericalValues)
    const NUM_BREAKS = 5
    let jenksBreaks: number[] = []

    try {
      // Ensure there are enough unique values for Jenks calculation
      const uniqueNumericalValues = [...new Set(numericalValues)]
      if (uniqueNumericalValues.length >= NUM_BREAKS) {
        jenksBreaks = jenks(numericalValues, NUM_BREAKS)
      } else if (
        uniqueNumericalValues.length > 0 &&
        uniqueNumericalValues.length < NUM_BREAKS
      ) {
        // Fallback: if there are some unique values but not enough for NUM_BREAKS,
        // create a simpler break system. For example, use unique values as breaks
        // or a subset if there are too many for a simple scale but too few for Jenks.
        // This is a placeholder, adjust according to desired behavior.
        // For now, we can just use the unique values, sorted.
        jenksBreaks = uniqueNumericalValues.sort((a, b) => a - b)
        // If you need exactly NUM_BREAKS, you might need to pad this array
        // or handle it differently in the frontend.
        // For simplicity, if we have 1 to 4 unique values, we'll use them.
        // The frontend already checks for jenksBreaks.length < 5.
      }
      // If uniqueNumericalValues.length is 0, jenksBreaks remains []
    } catch (error) {
      console.error('Jenks calculation failed:', error)
      jenksBreaks = []
    }
    console.log('🚀 ~: jenksBreaks', jenksBreaks)

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

        const value = dataPoint ? processValue(dataPoint) : null

        return {
          ...feature,
          properties: {
            ...feature.properties,
            dataPointId: dataPoint?.id.toString(),
            change: dataPoint?.change,
            originalValue: dataPoint?.originalValue,
            value: capitalizeNominalValue(value) as any,
            isRange,
            isLessThan,
            isMoreThan
          }
        }
      }) ?? []

    return {
      features: linkedFeatures,
      dataPoints:
        type === 'Nominal'
          ? dataPoints.map(dp => ({
              ...dp,
              value: capitalizeNominalValue(dp.value) as any
            }))
          : dataPoints,
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
