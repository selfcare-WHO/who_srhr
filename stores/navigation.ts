import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('Navigation', () => {
  const {
    public: { comparisonFeatureActive }
  } = useRuntimeConfig()

  const portal =
    'https://platform.who.int/data/maternal-newborn-child-adolescent-ageing/sexual-and-reproductive-health-and-rights-data-portal'

  const navItems = computed<Navigation.Item[]>(() => [
    {
      name: 'Home',
      path: 'https://platform.who.int/data/sexual-and-reproductive-health-and-rights/data-portal'
    },
    { name: 'Country profiles', path: `${portal}/country-profiles` },
    ...(comparisonFeatureActive
      ? [{ name: 'Country comparison', path: `${portal}/country-comparison` }]
      : []),
    { name: 'Indicators & data', path: `${portal}/indicators-data` }
  ])

  return { navItems }
})
