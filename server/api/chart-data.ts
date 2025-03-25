import prisma from '~/lib/prisma'

export default defineEventHandler(async (event): Promise<Chart.Data[]> => {
  const filters: { indicator: string[]; country: string[]; highlight: string } =
    getQuery(event)

  if (!Array.isArray(filters.country) && filters.country) {
    filters.country = [filters.country]
  }

  if (!Array.isArray(filters.indicator) && filters.indicator) {
    filters.indicator = [filters.indicator]
  }

  try {
    const where: any = {}

    if (filters.indicator?.length) {
      where.OR = []

      where.OR.push({ indicatorId: { in: filters.indicator } })
    }

    if (filters.country?.length > 0) {
      where.countryId = {
        in: filters.country?.map(Number)
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

    const createChartData = (
      filteredDataPoints: any[],
      indicator: any,
      subgroup?: any
    ) => {
      if (filteredDataPoints.length === 0) return null

      const mappedDataPoints: Chart.DataPoint[] = filteredDataPoints.map(
        point => ({
          countryId: String(point.countryId),
          countryName: point.country.name,
          value: point.value || '0',
          isHighlighted: String(point.countryId) === filters.highlight
        })
      )

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

    indicators.forEach(indicator => {
      if (indicator.subgroups && indicator.subgroups.length > 0) {
        indicator.subgroups.forEach(subgroup => {
          const subgroupDataPoints = dataPoints.filter(
            dp =>
              dp.indicatorId === indicator.id && dp.subgroupId === subgroup.id
          )

          const chartData = createChartData(
            subgroupDataPoints,
            indicator,
            subgroup
          )
          if (chartData) chartsData.push(chartData)
        })
      } else {
        const indicatorDataPoints = dataPoints.filter(
          dp => dp.indicatorId === indicator.id
        )

        const chartData = createChartData(indicatorDataPoints, indicator)
        if (chartData) chartsData.push(chartData)
      }
    })

    return chartsData
  } catch (error) {
    console.error('Error fetching chart data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chart data'
    })
  }
})
