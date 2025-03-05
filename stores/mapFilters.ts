import { defineStore } from 'pinia'

export const useMapFiltersStore = defineStore('MapFilters', () => {
  const filtersStore = useFiltersStore()
  const { indicators, domains } = storeToRefs(filtersStore)

  const dataTypeOptions = computed<Filter.MapDataTypeOption[]>(() => [
    {
      id: 'heatmap',
      name: 'Heatmap'
    },
    {
      id: 'nominal',
      name: 'Nominal'
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
          if (!indicator.mapView || indicator.domainId !== domain.id)
            return false

          switch (dataTypeFilterValue.value) {
            case 'targets':
              return indicator.hasTarget
            case 'nominal':
              return indicator.type === 'Nominal'
            default:
              return !indicator.hasTarget && indicator.type !== 'Nominal'
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

  const dataTypeFilterValue = ref<Filter.MapDataType>('heatmap')
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

  watchImmediate(indicatorOptions, val => {
    indicatorFilterValue.value = String(val[0]?.children?.[0]?.id)
  })

  return {
    dataTypeOptions,
    indicatorOptions,
    indicatorFilter,
    dataTypeFilterValue,
    indicatorFilterValue,
    currentIndicator
  }
})
