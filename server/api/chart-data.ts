import prisma from '~/lib/prisma'
import isNullish from '~/utils/isNullish'

export default defineEventHandler(async (event): Promise<Chart.Data[]> => {
  const {
    indicator,
    country,
    highlight
  }: { indicator: string[]; country: string[]; highlight: string } =
    getQuery(event)

  if (!indicator?.length || !country?.length || isNullish(highlight)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Indicator, country, and highlight are required'
    })
  }

  try {
    // Build where clauses for the database query
    const where: any = {}

    // Filter by indicators
    if (indicator.length) {
      where.OR = []

      where.OR.push({ indicatorId: { in: indicator } })
    }

    // Filter by countries
    if (country?.length) {
      where.countryId = {
        in: country.map(Number)
      }
    }

    // Get data points with related information
    const dataPoints = await prisma.dataPoint.findMany({
      where,
      include: {
        indicator: true,
        country: true
      }
    })

    // Get all the indicators we need to process
    const uniqueIndicatorIds = [
      ...new Set(dataPoints.map(dp => dp.indicatorId))
    ]
    const indicators = await prisma.indicator.findMany({
      where: {
        id: {
          in: uniqueIndicatorIds
        },
        type: {
          not: 'Nominal'
        }
      }
    })
    // Format data for chart rendering
    const chartsData: Chart.Data[] = indicators.map(indicator => {
      // Get only data points for this indicator
      const indicatorDataPoints = dataPoints.filter(
        dp => dp.indicatorId === indicator.id
      )

      // Map to the expected format
      const mappedDataPoints: Chart.DataPoint[] = indicatorDataPoints.map(
        point => ({
          countryId: String(point.countryId),
          countryName: point.country.name,
          value: Number(point.value) || 0,
          isHighlighted: String(point.countryId) === highlight
        })
      )

      // Calculate min and max values for scale
      const values = mappedDataPoints.map(d => d.value).filter(v => !isNaN(v))
      const minValue = values.length ? Math.floor(Math.min(...values, 0)) : 0
      const maxValue = values.length ? Math.ceil(Math.max(...values, 0)) : 1

      return {
        id: indicator.id,
        name: indicator.name,
        type: indicator.type as Data.IndicatorDataType,
        minValue,
        maxValue,
        dataPoints: mappedDataPoints
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
