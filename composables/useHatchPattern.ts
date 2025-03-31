import HatchPattern from '~/assets/images/hatch-pattern.svg?raw'

export const useHatchPattern = () => {
  const hatchUri = encodeHatchPattern(HatchPattern)
  return { hatchUri }
}
