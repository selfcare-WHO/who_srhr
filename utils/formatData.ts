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
      return `${capitalizedValue}${postfix}`
    }
  }

  const formatter = new Intl.NumberFormat('en-US')
  const formattedNumber = isNaN(Number(renderedValue))
    ? capitalizeNominalValue(renderedValue)
    : formatter.format(Number(renderedValue))

  return `${formattedNumber}${postfix}`
}
