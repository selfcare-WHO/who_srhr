import prisma from '~/lib/prisma'

export default async (
  indicatorId: string
): Promise<Prisma.DataPointWithCountry[]> => {
  try {
    // Fetch the indicator with its data points and related data
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

    // Transform data points into the format needed for the map
    return indicator.dataPoints
  } catch (error) {
    console.error('Error in mapDataPoints:', error)
    return []
  }
}
