import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

export const useResponsive = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind)

  const isMobile = breakpoints.smallerOrEqual('md')
  const isDesktop = breakpoints.greaterOrEqual('xl')

  return { isMobile, isDesktop }
}
