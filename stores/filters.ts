import { defineStore } from 'pinia'
import type { Domain, Indicator, Country } from '@prisma/client'

export const useFiltersStore = defineStore('Filters', () => {
  const isFiltering = ref(false)

  const availableDomains = ref<Domain[]>([])
  const availableIndicators = ref<Indicator[]>([])
  const availableCountries = ref<Country[]>([])

  const emptyFilterValues = computed<Record<Filter.Key, Filter.Value>>(() => ({
    country: [],
    indicator: []
  }))

  const indicatorOptions = computed<Filter.Option[]>(() => {
    if (!availableDomains.value) return []

    return availableDomains.value.map(domain => ({
      id: domain.id,
      value: `[domain]-${domain.id}`,
      label: domain.name,
      children: availableIndicators.value
        .filter(indicator => indicator.domainId === domain.id)
        .map(indicator => ({
          id: indicator.id,
          value: `[indicator]-${indicator.id}`,
          label: indicator.name
        }))
    }))
  })

  const countryOptions = computed<Filter.Option[]>(() =>
    availableCountries.value.map(country => ({
      id: country.id,
      name: country.name
    }))
  )

  const filters = reactive<Filter.Filter[]>([
    {
      key: 'indicator',
      childrenKey: 'indicator',
      label: 'Indicator' as Filter.Label,
      placeholder: 'All Domains / Indicators',
      value: emptyFilterValues.value.indicator,
      tree: true,
      multiple: computed(() => true),
      clearable: computed(() => true),
      options: indicatorOptions
    },
    {
      key: 'country',
      label: 'Location' as Filter.Label,
      value: emptyFilterValues.value.country,
      childrenKey: 'country',
      multiple: true,
      clearable: true,
      options: countryOptions
    }
  ])

  const fetchFilterItems = async () => {
    console.log('fetchFilterItems')
  }

  return { isFiltering, filters, fetchFilterItems }
})
