import { defineStore } from 'pinia'

export const useMapFiltersStore = defineStore('TableFilters', () => {
  const filtersStore = useFiltersStore()
  const { indicators, domains, isFetchingFilters } = storeToRefs(filtersStore)

  const dataTypeOptions = computed<Filter.Option[]>(() => [
    {
      id: 'heatmap',
      name: 'Heatmap'
    },
    {
      id: 'targets',
      name: 'Targets'
    }
  ])

  const indicatorOptions = computed<Filter.Option[]>(() => {
    if (!domains.value) return []

    return domains.value.reduce<Filter.Option[]>((acc, domain) => {
      const filteredIndicators = indicators.value
        .filter(indicator => {
          const belongsToDomain = indicator.domainId === domain.id

          if (dataTypeFilterValue.value === 'targets') {
            return belongsToDomain && indicator.hasTarget
          } else {
            return belongsToDomain && !indicator.hasTarget
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

  const dataTypeFilterValue = ref<Filter.MapToggleFilter>('targets')
  const indicatorFilterValue = ref<string>('')

  const dataTypeFilter = ref<Filter.MapToggleFilter>('targets')

  const indicatorFilter = reactive<Filter.Item>({
    key: 'indicator',
    childrenKey: 'indicator',
    label: 'Indicator',
    value: indicatorFilterValue,
    tree: true,
    multiple: false,
    clearable: false,
    options: indicatorOptions
  })

  watch(dataTypeFilterValue, () => {
    indicatorFilterValue.value = ''
  })

  watch(isFetchingFilters, val => {
    if (!val)
      indicatorFilterValue.value = String(
        indicatorOptions.value[0]?.children?.[0]?.id
      )
  })

  return {
    dataTypeOptions,
    dataTypeFilter,
    indicatorFilter,
    dataTypeFilterValue,
    indicatorFilterValue
  }
})
