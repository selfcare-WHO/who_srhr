import prisma from '~/lib/prisma'

export default async (
  indicatorId: string
): Promise<Prisma.IndicatorWithDataPoints | null> => {
  const cacheKey = `map-data-points-${indicatorId}`
  const cached =
    await useStorage().getItem<Prisma.IndicatorWithDataPoints>(cacheKey)
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

    await useStorage().setItem(cacheKey, indicator)

    return indicator
  } catch (error) {
    console.error('Error in mapDataPoints:', error)
    return null
  }
}
