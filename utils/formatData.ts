import { capitalizeNominalValue } from './capitalizeNominalValue'

export default ({
  indicator,
  dataPoint,
  value
}: {
  indicator?: Prisma.IndicatorWithSubgroups
  dataPoint?: Prisma.DataPoint
  value?: string
}): string => {
  const { type, translateValue, displayValue } = indicator || {}
  const { value: dataPointValue, originalValue } = dataPoint || {}
  const renderedValue = (() => {
    let returnValue: Data.Value

    if (dataPoint) {
      returnValue =
        displayValue === 'original_value' ? originalValue : dataPointValue
    } else if (
      value !== undefined &&
      value !== null &&
      !Number.isNaN(Number(value))
    ) {
      returnValue = Number.isInteger(Number(value))
        ? value.toString()
        : Number(value).toFixed(2)
    } else {
      returnValue = ''
    }

    return returnValue
  })()

  const postfix = type === 'Percentage' ? '%' : ''
  const prefix = type === 'Monetary' ? '$' : ''

  if (
    renderedValue === '' ||
    renderedValue === null ||
    renderedValue === undefined
  )
    return 'No data'

  if (translateValue) {
    const translateObject = JSON.parse(translateValue)

    if (renderedValue && translateObject[renderedValue]) {
      const translatedValue = translateObject[renderedValue]
      const capitalizedValue = capitalizeNominalValue(translatedValue)
      return `${prefix}${capitalizedValue}${postfix}`
    }
  }

  // Handle Monetary type with special formatting
  if (type === 'Monetary' && !isNaN(Number(renderedValue))) {
    const numericValue = Number(renderedValue)

    // For small numbers (< 1000), show 2 decimal places
    if (Math.abs(numericValue) < 1000) {
      const formattedSmall = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericValue)
      return `${prefix}${formattedSmall}`
    }

    // For large numbers (>= 1000), omit decimals and add commas
    const formattedLarge = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue)
    return `${prefix}${formattedLarge}`
  }

  const formattedNumber = isNaN(Number(renderedValue))
    ? capitalizeNominalValue(renderedValue)
    : renderedValue

  return `${prefix}${formattedNumber}${postfix}`
}
