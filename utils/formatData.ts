export default ({
  indicator,
  dataPoint,
  value
}: {
  indicator?: Prisma.IndicatorWithSubgroups
  dataPoint?: Prisma.DataPoint
  value?: number
}): string => {
  const { type, translateValue, displayValue } = indicator || {}
  const { value: dataPointValue, originalValue } = dataPoint || {}
  const renderedValue = (() => {
    if (dataPoint) {
      return displayValue === 'original_value' ? originalValue : dataPointValue
    }

    return value !== undefined && value !== null
      ? Number.isInteger(value)
        ? value.toString()
        : value.toFixed(2)
      : ''
  })()

  const postfix = type === 'Percentage' ? '%' : ''

  if ([null, undefined, ''].includes(renderedValue)) return 'No data'

  if (translateValue) {
    const translateObject = JSON.parse(translateValue)

    if (renderedValue && translateObject[renderedValue]) {
      const translatedValue = translateObject[renderedValue]
      return `${translatedValue}${postfix}`
    }
  }

  const formatter = new Intl.NumberFormat('en-US')
  const formattedNumber = isNaN(Number(renderedValue))
    ? renderedValue
    : formatter.format(Number(renderedValue))

  return `${formattedNumber}${postfix}`
}
