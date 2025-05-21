import { defineStore } from 'pinia'

export const useTableFiltersStore = defineStore('TableFilters', () => {
  const filtersStore = useFiltersStore()
  const { domains, indicators, countries } = storeToRefs(filtersStore)
  const dataTypeOptions = computed<Filter.Option[]>(() => [
    {
      id: 'numerical_categorical',
      name: 'Health statistics'
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
          label: indicator.displayName
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

  const dataTypeFilterValue = ref<Filter.DataType>('numerical_categorical')
  const indicatorFilterValue = ref<string[]>([])
  const countryFilterValue = ref<string[]>([])

  const filterValues = computed<Filter.TableValues>(() => ({
    dataType: dataTypeFilterValue.value,
    indicator: indicatorFilterValue.value,
    country: countryFilterValue.value
  }))

  const dataTypeFilter = reactive<Filter.Item>({
    key: 'dataType',
    label: 'Data Type',
    value: dataTypeFilterValue,
    tree: false,
    multiple: false,
    clearable: false,
    options: dataTypeOptions
  })

  const indicatorFilter = reactive<Filter.Item>({
    key: 'indicator',
    childrenKey: 'indicator',
    label: 'Indicator',
    placeholder: 'All Domains / Indicators',
    value: indicatorFilterValue,
    tree: true,
    multiple: true,
    clearable: true,
    options: indicatorOptions
  })

  const countryFilter = reactive<Filter.Item>({
    key: 'country',
    label: 'Country',
    placeholder: 'All Countries',
    value: countryFilterValue,
    multiple: true,
    clearable: true,
    options: countryOptions
  })

  const tableFilters = reactive<Filter.Item[]>([
    dataTypeFilter,
    indicatorFilter,
    countryFilter
  ])

  const filteredIndicators = computed<Prisma.IndicatorWithSubgroups[]>(() => {
    return indicators.value.filter(indicator => {
      const belongsToDataType =
        dataTypeFilterValue.value === 'laws_policies'
          ? indicator.isLaw
          : !indicator.isLaw

      const belongsToFilteredIndicators =
        indicatorFilterValue.value.length > 0
          ? indicatorFilterValue.value.includes(indicator.id)
          : true

      return belongsToDataType && belongsToFilteredIndicators
    })
  })

  watch(dataTypeFilterValue, () => {
    indicatorFilterValue.value = []
  })

  return {
    tableFilters,
    indicatorFilter,
    filterValues,
    filteredIndicators,
    indicatorFilterValue,
    countryFilterValue
  }
})
