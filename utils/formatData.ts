import StringMask from 'string-mask'

export default ({
  indicator,
  dataPoint,
  value
}: {
  indicator?: Prisma.IndicatorWithSubgroups
  dataPoint?: Prisma.DataPoint
  value?: number
}): string => {
  const { type, translateValue, displayValue, mask } = indicator || {}
  const { value: dataPointValue, originalValue } = dataPoint || {}
  const renderedValue = (() => {
    if (dataPoint) {
      return displayValue === 'original_value' ? originalValue : dataPointValue
    }

    return (value !== undefined && value !== null)
      ? value.toFixed(2)
      : ''
  })()

  const postfix = type === 'Percentage' ? '%' : ''

  if (
    renderedValue === null ||
    renderedValue === undefined ||
    renderedValue === ''
  )
    return 'n/d'

  if (translateValue) {
    const translateObject = JSON.parse(translateValue)

    if (translateObject[renderedValue]) {
      const translatedValue = translateObject[renderedValue]
      return `${translatedValue}${postfix}`
    }
  }

  if (mask) {
    const maskedValue = StringMask.apply(renderedValue, mask, {
      reverse: true
    })

    return `${maskedValue}${postfix}`
  }

  return `${renderedValue}${postfix}`
}
