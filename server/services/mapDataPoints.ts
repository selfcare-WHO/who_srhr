import prisma from '~/lib/prisma'

export default async (
  indicatorId: string
): Promise<Prisma.DataPointWithCountry[]> => {
  const cacheKey = `map-data-points-${indicatorId}`
  const cached =
    await useStorage().getItem<Prisma.DataPointWithCountry[]>(cacheKey)
  if (cached) return cached

  try {
    const indicator = await prisma.indicator.findUnique({
      where: { id: indicatorId },
      include: {
        dataPoints: {
          include: {
            country: true
          }
        }
      }
    })

    if (!indicator) {
      throw new Error(`Indicator with ID ${indicatorId} not found`)
    }

    await useStorage().setItem(cacheKey, indicator.dataPoints, { ttl: 3600 })

    return indicator.dataPoints
  } catch (error) {
    console.error('Error in mapDataPoints:', error)
    return []
  }
}
