export const capitalizeNominalValue = (value: Data.Value): Data.Value => {
  if (typeof value === 'string' && value.length > 0) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }
  return value
}
