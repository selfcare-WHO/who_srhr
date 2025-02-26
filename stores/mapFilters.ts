import { defineStore } from 'pinia'

export const useMapFiltersStore = defineStore('TableFilters', () => {
  const filtersStore = useFiltersStore()
  const { indicators, domains, isFetchingFilters } = storeToRefs(filtersStore)

  const dataTypeOptions = computed<Filter.MapToggleFilterOption[]>(() => [
    {
      id: 'heatmap',
      value: false,
      name: 'Heatmap'
    },
    {
      id: 'targets',
      value: true,
      name: 'Targets'
    }
  ])

  const indicatorOptions = computed<Filter.Option[]>(() => {
    if (!domains.value) return []

    return domains.value.reduce<Filter.Option[]>((acc, domain) => {
      const filteredIndicators = indicators.value
        .filter(indicator => {
          const belongsToDomain = indicator.domainId === domain.id

          if (dataTypeFilterValue.value) {
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

  const dataTypeFilterValue = ref<boolean>(true)
  const indicatorFilterValue = ref<string>('')

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

  const currentIndicator = computed<Prisma.IndicatorWithSubgroups | undefined>(
    () =>
      indicators.value.find(
        indicator => indicator.id === indicatorFilterValue.value
      )
  )

  watch(indicatorOptions, val => {
    indicatorFilterValue.value = String(val[0]?.children?.[0]?.id)
  })
  return {
    dataTypeOptions,
    indicatorFilter,
    dataTypeFilterValue,
    indicatorFilterValue,
    currentIndicator
  }
})
