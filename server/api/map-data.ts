import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { jenks } from 'simple-statistics'
import mapDataPoints from '../services/mapDataPoints'
import { useEnum } from '~/composables/useEnum'
import isNullish from '~/utils/isNullish'

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

    const { dataPoints, type, translateValue } = indicator
    const dataPointsByCountry = new Map()

    const legend = new Map<string, Map.Legend>()

    const { targetStatus } = useEnum()

    const statusCounters = new Map<string, number>()

    const extractNumbers = (value: string): number[] => {
      const numbers: number[] = []

      const percentageMatches = value.match(/(\d+(?:\.\d+)?)\s*%/g)
      if (percentageMatches) {
        percentageMatches.forEach(match => {
          const num = parseFloat(match.replace('%', ''))
          numbers.push(num)
        })
      }

      const rangeMatches = value.match(/(\d+)\s*-\s*(\d+)/g)
      if (rangeMatches && !percentageMatches) {
        rangeMatches.forEach(match => {
          const [min, max] = match.split('-').map(s => parseFloat(s.trim()))
          numbers.push((min + max) / 2)
        })
      }

      const standaloneMatches = value.match(/<?\s*(\d+)(?![\d%-])/g)
      if (standaloneMatches && !percentageMatches && !rangeMatches) {
        standaloneMatches.forEach(match => {
          const num = parseFloat(match.replace(/[<>]/g, '').trim())
          numbers.push(num)
        })
      }

      return numbers
    }

    const allUniqueValues = new Set<string>()
    const valueToNumbers = new Map<string, number[]>()

    dataPoints.forEach(dp => {
      if (type === 'Nominal') {
        const bucketKey =
          indicator.displayValue === 'original_value'
            ? dp.originalValue
            : dp.value

        if (bucketKey !== null && bucketKey !== undefined) {
          const bucketKeyStr = String(bucketKey).trim()
          if (
            bucketKeyStr !== '' &&
            bucketKeyStr !== 'null' &&
            bucketKeyStr !== 'undefined'
          ) {
            allUniqueValues.add(bucketKeyStr)

            const numbers = extractNumbers(bucketKeyStr)
            if (numbers.length > 0) {
              valueToNumbers.set(bucketKeyStr, numbers)
            }
          }
        }
      }
    })

    const useJenksColors = type === 'Nominal' && allUniqueValues.size > 3

    let sortedValuesByNumber: string[] = []
    if (useJenksColors) {
      sortedValuesByNumber = Array.from(valueToNumbers.entries())
        .sort((a, b) => {
          const aNum = Math.min(...a[1])
          const bNum = Math.min(...b[1])
          return aNum - bNum
        })
        .map(entry => entry[0])
    }

    const jenksColorMap = new Map<string, number>()
    sortedValuesByNumber.forEach((value, index) => {
      jenksColorMap.set(value, index)
    })

    dataPoints.forEach(dp => {
      dataPointsByCountry.set(dp.country.code, dp)

      if (type !== 'Nominal') return

      const bucketKey =
        indicator.displayValue === 'original_value'
          ? dp.originalValue
          : dp.value

      let bucketKeyStr = String(bucketKey)

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

      if (legend.has(bucketKeyStr)) return

      const translatedValue = (() => {
        if (translateValue) {
          const translateObject = JSON.parse(translateValue)
          return translateObject[bucketKeyStr]
        }
        return bucketKeyStr
      })()

      if (useJenksColors) {
        const jenksIndex = jenksColorMap.get(bucketKeyStr)

        if (jenksIndex !== undefined) {
          legend.set(bucketKeyStr, {
            name: translatedValue,
            color: `var(--el-bg-color-jenks-${jenksIndex})`
          })
        } else {
          const statusKey = String(dp?.change ?? 'noChange')

          if (
            statusKey === 'noChange' ||
            !targetStatus[statusKey as keyof typeof targetStatus]
          ) {
            legend.set(bucketKeyStr, {
              name: translatedValue,
              color: 'var(--no-data)'
            })
          } else {
            const target = targetStatus[statusKey as keyof typeof targetStatus]
            const alreadyUsed = statusCounters.get(statusKey) ?? 0
            const chosenColor =
              alreadyUsed === 0
                ? target.color
                : (target.secondaryColor ?? target.color)

            statusCounters.set(statusKey, alreadyUsed + 1)

            legend.set(bucketKeyStr, {
              name: translatedValue,
              color: chosenColor
            })
          }
        }
      } else {
        const statusKey = String(dp?.change ?? 'noChange')

        if (
          statusKey === 'noChange' ||
          !targetStatus[statusKey as keyof typeof targetStatus]
        ) {
          legend.set(bucketKeyStr, {
            name: translatedValue,
            color: 'var(--no-data)'
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
          name: translatedValue,
          color: chosenColor
        })
      }
    })

    const sortedLegend = [...legend].sort(
      (a: [string, Map.Legend], b: [string, Map.Legend]) => {
        const aName = a[1].name
        const bName = b[1].name

        if (aName === 'No Data') return 1
        if (bName === 'No Data') return -1

        return aName.localeCompare(bName)
      }
    )

    const legendObject = Object.fromEntries(sortedLegend)

    const numericalValues = Array.from(dataPointsByCountry.values())
      .map(dp => Number(dp.value))
      .filter(val => !isNullish(val) && !isNaN(val))

    const NUM_BREAKS = 5
    let jenksBreaks: number[] = []

    try {
      const uniqueNumericalValues = [...new Set(numericalValues)]

      if (uniqueNumericalValues.length >= NUM_BREAKS) {
        const rawJenksBreaks = jenks(numericalValues, NUM_BREAKS)
        jenksBreaks = [...new Set(rawJenksBreaks)]

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
        jenksBreaks = uniqueNumericalValues.sort((a, b) => a - b)
      }
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
