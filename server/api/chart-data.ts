import type { H3Event } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event: H3Event) => {
  const {
    indicator,
    country,
    highlight
  }: { indicator: string[]; country: string[]; highlight: string } =
    getQuery(event)

  try {
    // Build where clauses for the database query
    const where: any = {}

    // Filter by indicators
    if (indicator?.length) {
      const indicatorIds = indicator
        .filter(id => !id.startsWith('[domain]'))
        .map(String)

      const domainIds = indicator
        .filter(id => id.startsWith('[domain]'))
        .map(id => Number(id.replace('[domain]-', '')))

      if (indicatorIds.length || domainIds.length) {
        where.OR = []

        if (indicatorIds.length) {
          where.OR.push({ indicatorId: { in: indicatorIds } })
        }

        if (domainIds.length) {
          where.OR.push({ indicator: { domainId: { in: domainIds } } })
        }
      }
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
    const chartData = indicators.map(indicator => {
      // Map to the expected format
      const mappedDataPoints: Chart.DataPoint[] = dataPoints.map(point => ({
        countryId: String(point.countryId),
        countryName: point.country.name,
        value: Number(point.value) || 0,
        isHighlighted: String(point.countryId) === highlight
      }))

      // Calculate min and max values for scale
      const values = mappedDataPoints.map(d => d.value).filter(v => !isNaN(v))
      const minValue = values.length ? Math.floor(Math.min(...values, 0)) : 0
      const maxValue = values.length ? Math.ceil(Math.max(...values, 0)) : 1

      return {
        id: indicator.id,
        name: indicator.name,
        minValue,
        maxValue,
        globalTarget: indicator.hasTarget ?? null,
        dataPoints
      }
    })

    return chartData
  } catch (error) {
    console.error('Error fetching chart data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chart data'
    })
  }
})
