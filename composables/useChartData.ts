import { useChartFiltersStore } from '~/stores/chartFilters'
import { storeToRefs } from 'pinia'

export const useChartData = () => {
  const chartFiltersStore = useChartFiltersStore()
  const { indicatorFilterValue, countryFilterValue, highlightFilterValue } =
    storeToRefs(chartFiltersStore)

  const isFetching = ref(false)

  const { data: chartData } = useAsyncData(
    'chart-data',
    async () => {
      console.log('indicatorFilterValue', indicatorFilterValue.value)
      console.log('countryFilterValue', countryFilterValue.value)
      console.log('highlightFilterValue', highlightFilterValue.value)
      if (
        !indicatorFilterValue?.value?.length ||
        !countryFilterValue?.value?.length ||
        isNullish(highlightFilterValue?.value)
      ) {
        return Promise.resolve([])
      }

      isFetching.value = true
      try {
        const data = await $fetch<Chart.Data[]>('/api/chart-data', {
          query: {
            indicator: indicatorFilterValue.value,
            country: countryFilterValue.value,
            highlight: highlightFilterValue.value
          }
        })
        return data
      } finally {
        isFetching.value = false
      }
    },
    {
      watch: [indicatorFilterValue, countryFilterValue, highlightFilterValue],
      deep: true,
      immediate: true
    }
  )

  return {
    chartData,
    isFetching
  }
}
