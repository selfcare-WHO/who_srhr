import { defineStore } from 'pinia'
import { useFiltersStore } from './filters'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

export const useChartFiltersStore = defineStore('ChartFilters', () => {
  const filtersStore = useFiltersStore()
  const { domains, indicators, countries } = storeToRefs(filtersStore)

  // Define data type options
  const dataTypeOptions = computed<Filter.Option[]>(() => [
    {
      id: 'numerical_only',
      name: 'Numerical data only',
      label: 'Numerical data only'
    }
  ])

  // Define indicator options based on domains and indicators
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

  // Country options
  const countryOptions = computed<Filter.Option[]>(() =>
    countries.value.map(country => ({
      id: String(country.id),
      name: country.name
    }))
  )

  // Country highlight options (same as countries but with "None" option)
  const highlightOptions = computed<Filter.Option[]>(() => [
    {
      id: 'none',
      name: 'None',
      label: 'None'
    },
    ...countryOptions.value
  ])

  // Filter values
  const dataTypeFilterValue = ref<string>('numerical_only')
  const indicatorFilterValue = ref<string[]>([])
  const countryFilterValue = ref<string[]>([])
  const highlightFilterValue = ref<string>('none')

  // Combined filter values
  const filterValues = computed<Filter.ChartValues>(() => ({
    dataType: dataTypeFilterValue.value,
    indicator: indicatorFilterValue.value,
    country: countryFilterValue.value,
    highlight: highlightFilterValue.value
  }))

  // Create reactive filter objects
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
    label: 'Indicators',
    placeholder: 'Select indicators',
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

  // Combine all filters
  const chartFilters = reactive<Filter.Item[]>([
    indicatorFilter,
    countryFilter,
    highlightFilter
  ])

  // Get filtered indicators for chart display
  const filteredIndicators = computed<Prisma.IndicatorWithSubgroups[]>(() => {
    return indicators.value.filter(indicator => {
      // Only include numeric indicators
      const isNumeric = indicator.type === 'Numeric'

      // Check if indicator is selected in filter
      const isSelected =
        indicatorFilterValue.value.length === 0 ||
        indicatorFilterValue.value.includes(indicator.id)

      return isNumeric && isSelected
    })
  })

  // Watch for changes in indicators
  watch(
    indicators,
    newIndicators => {
      if (newIndicators) {
        console.log(
          'Available indicators:',
          newIndicators.map(i => ({
            id: i.id,
            name: i.displayName,
            type: i.type,
            isLaw: i.isLaw
          }))
        )

        const numericIndicators = newIndicators.filter(
          i => (i.type === 'Numeric' || i.type === 'Numerical') && !i.isLaw
        )
        console.log('Filtered numeric indicators:', numericIndicators.length)
      }
    },
    { immediate: true }
  )

  return {
    chartFilters,
    filterValues,
    filteredIndicators,
    indicatorFilterValue,
    countryFilterValue,
    highlightFilterValue
  }
})
