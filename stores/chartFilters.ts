import { defineStore } from 'pinia'
import { useFiltersStore } from './filters'
import { storeToRefs } from 'pinia'

export const useChartFiltersStore = defineStore('ChartFilters', () => {
  const filtersStore = useFiltersStore()
  const { domains, indicators, countries } = storeToRefs(filtersStore)

  const indicatorOptions = computed<Filter.Option[]>(() => {
    if (!domains.value) return []

    const options = domains.value.reduce<Filter.Option[]>((acc, domain) => {
      const filteredIndicators = indicators.value
        .filter(indicator => {
          const belongsToDomain = indicator.domainId === domain.id

          return belongsToDomain && !indicator.isLaw
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

    return options
  })

  const countryOptions = computed<Filter.Option[]>(() =>
    countries.value.map(country => ({
      id: String(country.id),
      name: country.name
    }))
  )

  const highlightOptions = computed<Filter.Option[]>(() => [
    {
      id: 'none',
      name: 'None',
      label: 'None'
    },
    ...countryOptions.value
  ])

  const indicatorFilterValue = ref<string[]>([])
  const countryFilterValue = ref<string[]>([])
  const highlightFilterValue = ref<string>('none')

  const filterValues = computed<Filter.ChartValues>(() => ({
    indicator: indicatorFilterValue.value,
    country: countryFilterValue.value,
    highlight: highlightFilterValue.value
  }))

  const indicatorFilter = reactive<Filter.Item>({
    key: 'indicator',
    childrenKey: 'indicator',
    label: 'Indicators',
    placeholder: 'All domains / indicators',
    value: indicatorFilterValue,
    tree: true,
    multiple: true,
    clearable: true,
    options: indicatorOptions
  })

  const countryFilter = reactive<Filter.Item>({
    key: 'country',
    label: 'Countries to display',
    placeholder: 'All Countries',
    value: countryFilterValue,
    multiple: true,
    clearable: true,
    options: countryOptions
  })

  const highlightFilter = reactive<Filter.Item>({
    key: 'highlight',
    label: 'Country to highlight',
    value: highlightFilterValue,
    multiple: false,
    clearable: false,
    options: highlightOptions
  })

  const chartFilters = reactive<Filter.Item[]>([
    indicatorFilter,
    countryFilter,
    highlightFilter
  ])

  return {
    chartFilters,
    filterValues,
    indicatorFilterValue,
    countryFilterValue,
    highlightFilterValue
  }
})
