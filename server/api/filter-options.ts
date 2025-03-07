import prisma from '@lib/prisma'

export default defineEventHandler(async event => {
  const domains = await prisma.domain.findMany()
  const indicators = await prisma.indicator.findMany({
    include: { subgroups: true }
  })

  const enrichedIndicators = indicators.map(indicator => ({
    ...indicator,
    displayName: `${indicator.fullName}${indicator.subheading ? ` - ${indicator.subheading}` : ''}`
  }))

  enrichedIndicators.sort((a, b) => {
    const aId = a.id
    const bId = b.id

    // Split the ID into numeric and alphabetic parts
    const [aNum, aLetter = ''] = aId.match(/(\d+)([a-z])?/i)?.slice(1) || []
    const [bNum, bLetter = ''] = bId.match(/(\d+)([a-z])?/i)?.slice(1) || []

    // Compare numeric parts first
    const numCompare = parseInt(aNum) - parseInt(bNum)

    // If numbers are equal, compare letters
    return numCompare !== 0 ? numCompare : aLetter.localeCompare(bLetter)
  })

  const countries = await prisma.country.findMany()

  return { domains, indicators: enrichedIndicators, countries }
})
