import prisma from '~/lib/prisma'
import isNullish from '~/utils/isNullish'
import { Prisma } from '@prisma/client'

type ChartFilters = {
  indicator: string[]
  country: string[]
  highlight: string
}

export default defineEventHandler(async (event): Promise<Chart.Data[]> => {
  // Parse and normalize query parameters
  const query = getQuery(event)
  const filters: ChartFilters = {
    indicator: Array.isArray(query.indicator)
      ? query.indicator
      : query.indicator
        ? [query.indicator as string]
        : [],
    country: Array.isArray(query.country)
      ? query.country
      : query.country
        ? [query.country as string]
        : [],
    highlight: query.highlight as string
  }

  try {
    // Build Prisma where clause with proper typing
    const where: Prisma.DataPointWhereInput = {}

    if (filters.indicator?.length) {
      where.indicatorId = { in: filters.indicator }
    }

    if (filters.country?.length > 0) {
      where.countryId = {
        in: filters.country.map(Number)
      }
    }

    // Fetch data points
    const dataPoints = await prisma.dataPoint.findMany({
      where,
      include: {
        indicator: true,
        country: true,
        subgroup: true
      }
    })

    // Fetch relevant indicators
    const indicators = await prisma.indicator.findMany({
      where: {
        ...(filters.indicator?.length ? { id: { in: filters.indicator } } : {}),
        type: {
          not: 'Nominal'
        }
      },
      include: {
        subgroups: true
      }
    })

    const chartsData: Chart.Data[] = []

    // Process each indicator
    for (const indicator of indicators) {
      if (indicator.subgroups?.length) {
        // Process indicators with subgroups
        for (const subgroup of indicator.subgroups) {
          const subgroupDataPoints = dataPoints.filter(
            dp =>
              dp.indicatorId === indicator.id && dp.subgroupId === subgroup.id
          )

          // Skip if highlight country is specified but has no data
          if (
            filters.highlight !== 'none' &&
            !hasHighlightedCountryData(subgroupDataPoints, filters.highlight)
          ) {
            continue
          }

          const chartData = createChartData(
            subgroupDataPoints,
            indicator,
            subgroup,
            filters.highlight
          )

          if (chartData) chartsData.push(chartData)
        }
      } else {
        // Process indicators without subgroups
        const indicatorDataPoints = dataPoints.filter(
          dp => dp.indicatorId === indicator.id
        )

        // Skip if highlight country is specified but has no data
        if (
          filters.highlight !== 'none' &&
          !hasHighlightedCountryData(indicatorDataPoints, filters.highlight)
        ) {
          continue
        }

        const chartData = createChartData(
          indicatorDataPoints,
          indicator,
          undefined,
          filters.highlight
        )

        if (chartData) chartsData.push(chartData)
      }
    }

    return chartsData
  } catch (error) {
    console.error('Error fetching chart data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chart data',
      cause: error
    })
  }
})

// Check if highlighted country has valid data
function hasHighlightedCountryData(
  dataPoints: any[],
  highlightId: string
): boolean {
  return dataPoints.some(
    dp => dp.countryId === Number(highlightId) && !isNullish(dp.value)
  )
}

// Create chart data structure from data points
function createChartData(
  filteredDataPoints: any[],
  indicator: any,
  subgroup?: any,
  highlightId?: string
): Chart.Data | null {
  if (filteredDataPoints.length === 0) return null

  const mappedDataPoints: Chart.DataPoint[] = filteredDataPoints.map(point => ({
    countryId: String(point.countryId),
    countryName: point.country.name,
    value: point.value || '0',
    isHighlighted: String(point.countryId) === highlightId
  }))

  const values = mappedDataPoints
    .map(d => Number(d.value))
    .filter(v => !isNaN(v))
  const minValue = values.length ? Math.floor(Math.min(...values, 0)) : 0
  const maxValue = values.length ? Math.ceil(Math.max(...values, 0)) : 1

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.fullName,
    subheading: indicator.subheading,
    subgroupName: subgroup?.name,
    type: indicator.type as Data.IndicatorDataType,
    minValue,
    maxValue,
    dataPoints: mappedDataPoints
  }
}
