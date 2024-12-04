import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('Filters', () => {
  const isFetchingFilters = ref(false)

  const availableDomains = ref<Prisma.Domain[]>([])
  const availableIndicators = ref<Prisma.IndicatorWithSubgroups[]>([])
  const availableCountries = ref<Prisma.Country[]>([])

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
          value: indicator.id,
          label: indicator.fullName
        }))
    }))
  })

  const countryOptions = computed<Filter.Option[]>(() =>
    availableCountries.value.map(country => ({
      id: String(country.id),
      name: country.name
    }))
  )

  const indicatorFilterValue = ref<string[]>([])
  const countryFilterValue = ref<string[]>([])

  const filterValues = computed<Filter.Values>(() => ({
    indicator: indicatorFilterValue.value,
    country: countryFilterValue.value
  }))

  const filters: Filter.Item[] = [
    {
      key: 'indicator',
      childrenKey: 'indicator',
      label: 'Indicator',
      placeholder: 'All Domains / Indicators',
      value: indicatorFilterValue,
      tree: true,
      multiple: true,
      clearable: true,
      options: indicatorOptions
    },
    {
      key: 'country',
      label: 'Country',
      placeholder: 'All Countries',
      value: countryFilterValue,
      multiple: true,
      clearable: true,
      options: countryOptions
    }
  ]

  const fetchFilterOptions = async () => {
    isFetchingFilters.value = true

    const { domains, indicators, countries } = await $fetch<Filter.Options>(
      '/api/filter-options'
    )

    availableDomains.value = domains
    availableIndicators.value = indicators
    availableCountries.value = countries

    isFetchingFilters.value = false
  }

  const fetchedFilters = computed(
    () =>
      availableIndicators.value.length > 0 &&
      availableCountries.value.length > 0
  )

  return {
    isFetchingFilters,
    filters,
    filterValues,
    fetchFilterOptions,
    fetchedFilters,
    availableDomains,
    availableCountries,
    availableIndicators,
    indicatorFilterValue,
    countryFilterValue
  }
})
