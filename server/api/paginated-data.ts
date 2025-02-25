import type { H3Event } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event: H3Event) => {
  // Get pagination parameters from the request
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const size = Number(query.size) || 12
  const filters = JSON.parse(query.filters as string) as Filter.TableValues

  const offset = (page - 1) * size

  try {
    // Build where clause based on filters
    const where: any = {}

    const countryWhere: any = {}

    if (filters?.country?.length) {
      countryWhere.id = {
        in: filters.country.map(Number)
      }
    }

    if (filters?.indicator?.length) {
      const indicatorIds = filters.indicator
        .filter(id => !id.startsWith('[domain]'))
        .map(String) // Keep as string since indicator.id is string

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

    if (filters?.dataType) {
      where.indicator = {
        ...where.indicator,
        isLaw: filters.dataType === 'laws_policies'
      }
    }

    // Use transaction to combine count and findMany queries
    const [countries, total] = await prisma.$transaction([
      prisma.country.findMany({
        where: countryWhere,
        skip: offset,
        take: size,
        orderBy: { name: 'asc' }
      }),
      prisma.country.count({ where: countryWhere })
    ])

    // Get all relevant data points for these countries
    const dataPoints = await prisma.dataPoint.findMany({
      where: {
        ...(Object.keys(where).length ? where : {}),
        countryId: {
          in: countries.map(c => c.id)
        }
      },
      include: {
        indicator: {
          include: {
            subgroups: true
          }
        },
        subgroup: true,
        country: true
      }
    })

    // Create a map for quick data point lookup
    const dataPointsMap = new Map<string, Prisma.DataPoint>()
    dataPoints.forEach(dp => {
      const key = `${dp.countryId}-${dp.indicatorId}-${dp.subgroupId}`
      dataPointsMap.set(key, dp)
    })

    // Format data according to the table structure
    const formattedData = countries.map(country => {
      const row: Record<string, any> = {
        country: country.name
      }

      // Add data points for each indicator-subgroup combination
      dataPoints
        .filter(dp => dp.countryId === country.id)
        .forEach(dp => {
          const key = `${dp.indicatorId}-${dp.subgroupId}`
          row[key] = dp
        })

      return row
    })

    return {
      last_page: Math.ceil(total / size),
      data: formattedData
    }
  } catch (error) {
    console.error('Error fetching paginated data:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch paginated data'
    })
  }
})
