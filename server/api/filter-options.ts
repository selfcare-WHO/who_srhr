import prisma from '@lib/prisma'

export default defineEventHandler(async event => {
  const domains = await prisma.domain.findMany()
  const indicators = await prisma.indicator.findMany({
    include: { subgroups: true }
  })
  const countries = await prisma.country.findMany()

  return { domains, indicators, countries }
})
