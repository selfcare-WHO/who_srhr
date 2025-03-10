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

  const subgroupOptions = computed<Filter.Option[]>(() => {
    if (!currentIndicator.value) return []

    return currentIndicator.value.subgroups.map(subgroup => ({
      id: String(subgroup.id),
      value: String(subgroup.id),
      name: subgroup.name
    }))
  })

  const dataTypeFilterValue = ref<Filter.MapDataType>('heatmap')
  const indicatorFilterValue = ref<string>('')
  const subgroupFilterValue = ref<string>('')

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

  const subgroupFilter = reactive<Filter.Item>({
    key: 'subgroup',
    label: 'Subgroup',
    value: subgroupFilterValue,
    tree: false,
    multiple: false,
    clearable: false,
    options: subgroupOptions
  })

  const currentIndicator = computed<Prisma.IndicatorWithSubgroups | undefined>(
    () =>
      indicators.value.find(
        indicator => indicator.id === indicatorFilterValue.value
      )
  )

  const currentSubgroup = computed<Prisma.Subgroup | undefined>(() => {
    if (!currentIndicator.value) return undefined

    return currentIndicator.value.subgroups.find(
      subgroup => String(subgroup.id) === subgroupFilterValue.value
    )
  })

  watchImmediate(indicatorOptions, val => {
    const indicatorId = val[0]?.children?.[0]?.id
    indicatorFilterValue.value = indicatorId ? String(indicatorId) : ''

    const subgroupId = currentIndicator.value?.subgroups[0]?.id
    subgroupFilterValue.value = subgroupId ? String(subgroupId) : ''
  })

  return {
    dataTypeOptions,
    indicatorOptions,
    indicatorFilter,
    subgroupFilter,
    dataTypeFilterValue,
    indicatorFilterValue,
    subgroupFilterValue,
    currentIndicator,
    currentSubgroup
  }
})
