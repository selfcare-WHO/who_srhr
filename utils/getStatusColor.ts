export default (status: string | null) => {
  if (!status) return ''

  const colorStore = useColorStore()
  const { targetColor } = storeToRefs(colorStore)
  const { targetStatus } = useEnum()

  const statusObject = Object.values(targetStatus).find(
    ({ dbValue }) => dbValue === status
  )

  if (!statusObject) return ''

  const statusColor =
    targetColor.value[statusObject.name as keyof typeof targetColor.value]

  return parseCssVar(statusColor)
}
