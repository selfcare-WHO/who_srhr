import type { H3Event } from 'h3'
import prisma from '~/lib/prisma'

// Define an interface for our chart data structure
interface ChartDataItem {
  indicator: any // Use appropriate Prisma type
  data: Array<{
    country: string
    countryId: number
    value: number
    subgroup: string
  }>
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const filters = JSON.parse(query.filters as string) as Filter.ChartValues

  try {
    const where: any = {}

    // Filter by indicators
    if (filters?.indicator?.length) {
      const indicatorIds = filters.indicator
        .filter(id => !id.startsWith('[domain]'))
        .map(String)

      const domainIds = filters.indicator
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
    if (filters?.country?.length) {
      where.countryId = {
        in: filters.country.map(Number)
      }
    }

    // Get the data points with related info
    const dataPoints = await prisma.dataPoint.findMany({
      where,
      include: {
        indicator: true,
        country: true,
        subgroup: true
      }
    })

    // Format data for chart rendering
    const chartData = dataPoints.reduce<Record<string, ChartDataItem>>(
      (acc, point) => {
        const indicatorId = point.indicatorId

        if (!acc[indicatorId]) {
          acc[indicatorId] = {
            indicator: point.indicator,
            data: []
          }
        }

        acc[indicatorId].data.push({
          country: point.country.name,
          countryId: point.countryId,
          value: parseFloat(point.value || '0'),
          subgroup: point.subgroup?.fullName || 'All'
        })

        return acc
      },
      {}
    )

    return Object.values(chartData)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chart data'
    })
  }
})
