import prisma from '~/lib/prisma'
import isNullish from '~/utils/isNullish'
import { capitalizeNominalValue } from '~/utils/capitalizeNominalValue'
import type { Prisma, Indicator, Subgroup } from '@prisma/client'

type ChartFilters = {
  indicator: string[]
  country: string[]
  highlight: string
  size?: number
  page?: number
}

type DataPointInclude = Prisma.DataPointGetPayload<{
  include: {
    country: true
    indicator: true
    subgroup: true
  }
}>

export default defineEventHandler(async event => {
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
    highlight: query.highlight as string,
    page: query.page ? Number(query.page) : 1,
    size: query.size ? Number(query.size) : 5
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

    const allChartsData: Chart.Data[] = []

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

          if (chartData) allChartsData.push(chartData)
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

        if (chartData) allChartsData.push(chartData)
      }
    }

    // Pagination
    const page = Number(filters.page)
    const size = Number(filters.size)
    const total = allChartsData.length

    const startIndex = (page - 1) * size
    const endIndex = startIndex + size
    const paginatedData = allChartsData.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      total
    }
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
    value:
      indicator.type === 'Nominal'
        ? (capitalizeNominalValue(point.value) as string)
        : point.value ?? undefined,
    isHighlighted: String(point.countryId) === highlightId
  }))

  const values = mappedDataPoints
    .map(d => Number(d.value))
    .filter(v => !isNaN(v))

  const minValue = values.length ? Math.min(...values) : 0
  const maxValue = values.length ? Math.max(...values) : 1

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
