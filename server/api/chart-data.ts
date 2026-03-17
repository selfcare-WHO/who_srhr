import prisma from '~/lib/prisma'
import isNullish from '~/utils/isNullish'
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
    let realChartsCount = 0

    for (const indicator of indicators) {
      let pushedAnyForIndicator = false

      if (indicator.subgroups?.length) {
        for (const subgroup of indicator.subgroups) {
          const subgroupDataPoints = dataPoints.filter(
            dp =>
              !isNullish(dp.value) &&
              dp.indicatorId === indicator.id &&
              dp.subgroupId === subgroup.id
          )

          const passesHighlight =
            filters.highlight === 'none' ||
            hasHighlightedCountryData(subgroupDataPoints, filters.highlight)

          if (subgroupDataPoints.length && passesHighlight) {
            const chartData = createChartData(
              subgroupDataPoints,
              indicator,
              subgroup,
              filters.highlight
            )

            allChartsData.push(chartData)
            realChartsCount += 1
            pushedAnyForIndicator = true
          }
        }

        if (
          !pushedAnyForIndicator &&
          filters.indicator?.includes(indicator.id)
        ) {
          allChartsData.push(createPlaceholderChartData(indicator))
        }
      } else {
        const indicatorDataPoints = dataPoints.filter(
          dp => !isNullish(dp.value) && dp.indicatorId === indicator.id
        )

        const passesHighlight =
          filters.highlight === 'none' ||
          hasHighlightedCountryData(indicatorDataPoints, filters.highlight)

        if (indicatorDataPoints.length && passesHighlight) {
          const chartData = createChartData(
            indicatorDataPoints,
            indicator,
            undefined,
            filters.highlight
          )

          allChartsData.push(chartData)
          realChartsCount += 1
          pushedAnyForIndicator = true
        }

        if (
          !pushedAnyForIndicator &&
          filters.indicator?.includes(indicator.id)
        ) {
          allChartsData.push(createPlaceholderChartData(indicator))
        }
      }
    }

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
): Chart.Data {
  const mappedDataPoints: Chart.DataPoint[] = filteredDataPoints.map(point => ({
    countryId: String(point.countryId),
    countryName: point.country.name,
    value: point.value ?? undefined,
    originalValue: point.originalValue ?? undefined,
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

function createPlaceholderChartData(indicator: Indicator): Chart.Data {
  return {
    indicatorId: indicator.id,
    indicatorName: indicator.fullName,
    subheading: indicator.subheading || '',
    subgroupName: '',
    type: indicator.type as Data.IndicatorDataType,
    minValue: 0,
    maxValue: 1,
    dataPoints: []
  }
}
