import { capitalizeNominalValue } from './capitalizeNominalValue'

const COMPARISON_RE = /^([<>≤≥])\s*(.+)/

/** Separate a leading comparison operator (`<`, `>`, `≤`, `≥`) from the rest. */
const parseComparison = (raw: string) => {
  const m = raw.match(COMPARISON_RE)
  return m ? { sign: m[1], body: m[2] } : { sign: '', body: raw }
}

/** Format a number respecting indicator-type conventions. */
const formatNumber = (n: number, type?: string): string => {
  if (type === 'Monetary') {
    const fractionDigits = Math.abs(n) < 1000 ? 2 : 0
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(n)
  }
  return new Intl.NumberFormat('en-US').format(n)
}

/** Wrap a formatted body with the indicator-type prefix ($) and postfix (%). */
const applyTypeAffixes = (body: string, type?: string): string => {
  const pre = type === 'Monetary' ? '$' : ''
  const post = type === 'Percentage' ? '%' : ''
  return `${pre}${body}${post}`
}

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

  // 1. Resolve the raw display string
  const raw = (() => {
    if (dataPoint) {
      const v =
        displayValue === 'original_value'
          ? dataPoint.originalValue
          : dataPoint.value
      return v?.trim() ?? ''
    }
    return value?.trim() ?? ''
  })()

  if (!raw) return 'No data'

  // 2. Translate categorical values via the indicator's lookup map
  if (translateValue) {
    const map = JSON.parse(translateValue)
    if (map[raw])
      return applyTypeAffixes(
        capitalizeNominalValue(map[raw]) as string,
        type
      )
  }

  // 3. Separate optional comparison sign and parse the numeric body
  const { sign, body } = parseComparison(raw)
  const num = Number(body)

  if (Number.isNaN(num))
    return applyTypeAffixes(capitalizeNominalValue(raw) as string, type)

  // 4. Format and wrap
  return applyTypeAffixes(`${sign}${formatNumber(num, type)}`, type)
}
