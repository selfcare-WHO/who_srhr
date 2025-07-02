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

  const countryOptions = computed<Filter.Option[]>(() => {
    const regionMap = new Map<string, Filter.Option>()

    countries.value.forEach(country => {
      const region = country.region ?? 'Other'

      if (!regionMap.has(region)) {
        regionMap.set(region, {
          id: region,
          value: `[region]-${region}`,
          label: region,
          children: []
        })
      }

      regionMap.get(region)!.children!.push({
        id: String(country.id),
        value: String(country.id),
        label: country.name,
        name: country.name
      })
    })

    return Array.from(regionMap.values())
  })

  const flatCountryOptions = computed<Filter.Option[]>(() =>
    countryOptions.value.flatMap(option => option.children ?? [])
  )

  const highlightOptions = computed<Filter.Option[]>(() => {
    const sourceOptions = countryFilterValue.value.length
      ? flatCountryOptions.value.filter(option =>
          countryFilterValue.value.includes(String(option.id))
        )
      : flatCountryOptions.value

    return [
      {
        id: 'none',
        name: 'None',
        label: 'None'
      },
      ...sourceOptions
    ]
  })

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
    tree: true,
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

  watch(countryFilterValue, value => {
    if (value.length && !value.includes(highlightFilterValue.value)) {
      highlightFilterValue.value = 'none'
    }
  })

  return {
    chartFilters,
    filterValues,
    indicatorFilterValue,
    countryFilterValue,
    highlightFilterValue
  }
})
