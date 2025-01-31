import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('Filters', () => {
  const isFetchingFilters = ref(false)

  const domains = ref<Prisma.Domain[]>([])
  const indicators = ref<Prisma.IndicatorWithSubgroups[]>([])
  const countries = ref<Prisma.Country[]>([])

  const dataTypeOptions = computed<Filter.Option[]>(() => [
    {
      id: 'numerical_categorical',
      name: 'Numerical & categorical data'
    },
    {
      id: 'laws_policies',
      name: 'Laws & policies'
    }
  ])

  const indicatorOptions = computed<Filter.Option[]>(() => {
    if (!domains.value) return []

    return domains.value.reduce<Filter.Option[]>((acc, domain) => {
      const filteredIndicators = indicators.value
        .filter(indicator => {
          const belongsToDomain = indicator.domainId === domain.id

          if (dataTypeFilterValue.value === 'numerical_categorical') {
            return belongsToDomain && !indicator.isLaw
          } else {
            return belongsToDomain && indicator.isLaw
          }
        })
        .map(indicator => ({
          id: indicator.id,
          value: indicator.id,
          label: indicator.fullName
        }))

      if (filteredIndicators.length) {
        return [
          ...acc,
          {
            id: domain.id,
            value: `[domain]-${domain.id}`,
            label: domain.name,
            children: filteredIndicators
          }
        ]
      }

      return acc
    }, [])
  })

  const countryOptions = computed<Filter.Option[]>(() =>
    countries.value.map(country => ({
      id: String(country.id),
      name: country.name
    }))
  )

  const dataTypeFilterValue = ref<string>('numerical_categorical')
  const indicatorFilterValue = ref<string[]>([])
  const countryFilterValue = ref<string[]>([])

  const filterValues = computed<Filter.Values>(() => ({
    dataType: dataTypeFilterValue.value,
    indicator: indicatorFilterValue.value,
    country: countryFilterValue.value
  }))

  const filters: Filter.Item[] = [
    {
      key: 'dataType',
      label: 'Data Type',
      value: dataTypeFilterValue,
      tree: false,
      multiple: false,
      clearable: false,
      options: dataTypeOptions
    },
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

  const filteredIndicators = computed<Prisma.IndicatorWithSubgroups[]>(() => {
    return indicators.value.filter(indicator => {
      const belongsToDataType =
        dataTypeFilterValue.value !== 'laws_policies' || indicator.isLaw

      const belongsToFilteredIndicators =
        indicatorFilterValue.value.length > 0
          ? indicatorFilterValue.value.includes(indicator.id)
          : true

      return belongsToDataType && belongsToFilteredIndicators
    })
  })

  const fetchFilterOptions = async () => {
    isFetchingFilters.value = true

    const { data } = await useFetch<Filter.Options>('/api/filter-options')

    domains.value = data.value?.domains || []
    indicators.value = data.value?.indicators || []
    countries.value = data.value?.countries || []

    isFetchingFilters.value = false
  }

  const fetchedFilters = computed(
    () => indicators.value.length > 0 && countries.value.length > 0
  )

  watch(dataTypeFilterValue, () => {
    indicatorFilterValue.value = []
  })

  fetchFilterOptions()

  return {
    isFetchingFilters,
    filters,
    filterValues,
    fetchFilterOptions,
    fetchedFilters,
    domains,
    filteredIndicators,
    indicatorFilterValue,
    countryFilterValue
  }
})
