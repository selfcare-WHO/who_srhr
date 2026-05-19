export const MIN_DATA_YEAR = 2016

// Keeps NULL-year rows; excludes only non-null years < MIN_DATA_YEAR
export const dataYearCutoffFilter = {
  NOT: { currentYear: { lt: MIN_DATA_YEAR } }
}
