import { TargetStatus } from '~/types/enums'

export default (status: string | null) => {
  if (!status) return ''

  const statusObject = Object.values(TargetStatus).find(
    ({ dbValue }) => dbValue === status
  )

  return parseCssVar(statusObject?.color)
}
