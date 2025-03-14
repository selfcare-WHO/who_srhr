export default (status: string | null) => {
  if (!status) return ''

  const { targetStatus } = useEnums()

  const statusObject = Object.values(targetStatus).find(
    ({ dbValue }) => dbValue === status
  )

  return parseCssVar(statusObject?.color)
}
