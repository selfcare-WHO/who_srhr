import type { DataPoint } from '@prisma/client'
import prisma from '@lib/prisma'
export default defineEventHandler(async (event): Promise<DataPoint[]> => {
  const { filters }: { filters: Filter.ReadonlyValues } = await readBody(event)

  if (!filters) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Filters parameter is required'
    })
  }

  try {
    const data: DataPoint[] = await prisma.dataPoint.findMany({
      where: {
        ...(filters?.indicator.length
          ? { indicator: { id: { in: filters.indicator } } }
          : {}),
        ...(filters?.country.length
          ? { country: { id: { in: filters.country.map(Number) } } }
          : {})
      }
    })

    return data
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch data points',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
})
