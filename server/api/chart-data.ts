import prisma from '~/lib/prisma'
import isNullish from '~/utils/isNullish'
import type { Prisma, Indicator, Subgroup } from '@prisma/client'

type ChartFilters = {
  indicator: string[]
  country: string[]
  highlight: string
}

type DataPointInclude = Prisma.DataPointGetPayload<{
  include: {
    country: true
    indicator: true
    subgroup: true
  }
}>

export default defineEventHandler(async (event): Promise<Chart.Data[]> => {
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
    const where: Prisma.DataPointWhereInput = {}

    if (filters.indicator?.length) {
      where.indicatorId = { in: filters.indicator }
    }

    if (filters.country?.length > 0) {
      where.countryId = {
        in: filters.country.map(Number)
      }
    }

    const dataPoints = await prisma.dataPoint.findMany({
      where,
      include: {
        indicator: true,
        country: true,
        subgroup: true
      }
    })

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

    for (const indicator of indicators) {
      if (indicator.subgroups?.length) {
        for (const subgroup of indicator.subgroups) {
          const subgroupDataPoints = dataPoints.filter(
            dp =>
              !isNullish(dp.value) &&
              dp.indicatorId === indicator.id &&
              dp.subgroupId === subgroup.id
          )

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
        const indicatorDataPoints = dataPoints.filter(
          dp => !isNullish(dp.value) && dp.indicatorId === indicator.id
        )

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

function hasHighlightedCountryData(
  dataPoints: any[],
  highlightId: string
): boolean {
  return dataPoints.some(
    dp => dp.countryId === Number(highlightId) && !isNullish(dp.value)
  )
}

function createChartData(
  filteredDataPoints: DataPointInclude[],
  indicator: Indicator,
  subgroup?: Subgroup,
  highlightId?: string
): Chart.Data | undefined {
  if (!filteredDataPoints.length) return

  const mappedDataPoints: Chart.DataPoint[] = filteredDataPoints.map(point => ({
    countryId: String(point.countryId),
    countryName: point.country.name,
    value: point.value ?? undefined,
    isHighlighted: String(point.countryId) === highlightId
  }))

  const values = mappedDataPoints
    .map(d => Number(d.value))
    .filter(v => !isNaN(v))

  const minValue = values.length ? Math.floor(Math.min(...values)) : 0
  const maxValue = values.length ? Math.ceil(Math.max(...values, 0)) : 1

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.fullName,
    subheading: indicator.subheading || '',
    subgroupName: subgroup?.name || '',
    type: indicator.type as Data.IndicatorDataType,
    minValue,
    maxValue,
    dataPoints: mappedDataPoints
  }
}
