import prisma from '@lib/prisma'

export default defineEventHandler(
  async (event): Promise<Prisma.DataPointWithType[]> => {
    const { filters }: { filters: Filter.ReadonlyValues } = await readBody(
      event
    )

    if (!filters) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Filters parameter is required'
      })
    }

    try {
      const whereConditions: Prisma.DataPointWhereInput = {}

      if (filters.indicator.length > 0) {
        whereConditions.indicatorId = { in: filters.indicator }
      }

      if (filters.country.length > 0) {
        whereConditions.countryId = { in: filters.country.map(Number) }
      }

      const data: Prisma.DataPointWithType[] = await prisma.dataPoint.findMany({
        where: whereConditions,
        include: {
          indicator: {
            select: {
              type: true,
              id: true
            }
          }
        }
      })

      // data.sort((a, b) => {
      //   const aId = a.indicator.id
      //   const bId = b.indicator.id

      //   // Split the ID into numeric and alphabetic parts
      //   const [aNum, aLetter = ''] = aId.match(/(\d+)([a-z])?/i)?.slice(1) || []
      //   const [bNum, bLetter = ''] = bId.match(/(\d+)([a-z])?/i)?.slice(1) || []

      //   // Compare numeric parts first
      //   const numCompare = parseInt(aNum) - parseInt(bNum)

      //   // If numbers are equal, compare letters
      //   return numCompare !== 0 ? numCompare : aLetter.localeCompare(bLetter)
      // })

      return data
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch data points',
        stack: error instanceof Error ? error.stack : undefined
      })
    }
  }
)
