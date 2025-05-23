import { defineStore } from 'pinia'

export const useMapFiltersStore = defineStore('MapFilters', () => {
  const filtersStore = useFiltersStore()
  const { indicators, domains } = storeToRefs(filtersStore)

  const currentIndicator = computed<Prisma.SerializedIndicatorWithSubgroups>(
    () =>
      indicators.value.find(
        indicator => indicator.id === indicatorFilterValue.value
      ) ?? ({} as Prisma.SerializedIndicatorWithSubgroups)
  )

  const currentSubgroup = computed<Prisma.Subgroup>(() => {
    if (!currentIndicator.value) return {} as Prisma.Subgroup

    return (
      currentIndicator.value?.subgroups?.find(
        subgroup => String(subgroup.id) === subgroupFilterValue.value
      ) ?? ({} as Prisma.Subgroup)
    )
  })

  const dataTypeOptions = computed<Filter.Option[]>(() => [
    {
      id: 'numerical_categorical',
      name: 'Health statistics'
    },
    {
      id: 'laws_policies',
      name: 'Laws & policies'
    },
    {
      id: 'targets',
      name: 'Progress towards targets'
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
            case 'numerical_categorical':
              return !indicator.isLaw
            case 'laws_policies':
              return indicator.isLaw
            case 'targets':
              return indicator.hasTarget
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

    return (
      currentIndicator.value?.subgroups?.map(subgroup => ({
        id: String(subgroup.id),
        value: String(subgroup.id),
        name: subgroup.fullName
      })) ?? []
    )
  })

  const dataTypeFilterValue = ref<Filter.DataType>('numerical_categorical')
  const indicatorFilterValue = ref<string>('')
  const subgroupFilterValue = ref<string>('')

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
    value: indicatorFilterValue,
    tree: true,
    multiple: false,
    clearable: false,
    options: indicatorOptions,
    filterable: true
  })

  const subgroupFilter = reactive<Filter.Item>({
    key: 'subgroup',
    label: 'Subgroup',
    value: subgroupFilterValue,
    tree: false,
    multiple: false,
    clearable: false,
    options: subgroupOptions,
    hide: computed(() => subgroupOptions.value?.length <= 1)
  })

  const mapFilters = reactive<Filter.Item[]>([
    dataTypeFilter,
    indicatorFilter,
    subgroupFilter
  ])

  watch(indicatorOptions, async (val) => {
    await nextTick()
    
    const indicatorId = val[0]?.children?.[0]?.id
    const newIndicatorValue = indicatorId ? String(indicatorId) : ''
    
    if (indicatorFilterValue.value !== newIndicatorValue) {
      indicatorFilterValue.value = newIndicatorValue
    }
  }, { immediate: true })

  watch(currentIndicator, async (val) => {
    await nextTick()
    
    const subgroupId = val?.subgroups?.[0]?.id
    const newSubgroupValue = subgroupId ? String(subgroupId) : ''
    
    if (subgroupFilterValue.value !== newSubgroupValue) {
      subgroupFilterValue.value = newSubgroupValue
    }
  })

  return {
    mapFilters,
    dataTypeOptions,
    indicatorOptions,
    dataTypeFilter,
    indicatorFilter,
    subgroupFilter,
    dataTypeFilterValue,
    indicatorFilterValue,
    subgroupFilterValue,
    currentIndicator,
    currentSubgroup
  }
})
