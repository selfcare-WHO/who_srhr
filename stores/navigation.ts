import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('Navigation', () => {
  const {
    public: { comparisonFeatureActive }
  } = useRuntimeConfig()

  const navItems = computed(() => [
    { name: 'Home', path: '/' },
    { name: 'Country profiles', path: '/country-profiles' },
    ...(comparisonFeatureActive
      ? [{ name: 'Country comparison', path: '/country-comparison/table' }]
      : []),
    { name: 'Indicators & data', path: '/indicators-data' }
  ])

  return { navItems }
})
