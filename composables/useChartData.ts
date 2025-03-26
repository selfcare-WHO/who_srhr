import { useChartFiltersStore } from '~/stores/chartFilters'
import { storeToRefs } from 'pinia'

export const useChartData = (options?: { pagination?: boolean }) => {
  const chartFiltersStore = useChartFiltersStore()
  const { indicatorFilterValue, countryFilterValue, highlightFilterValue } =
    storeToRefs(chartFiltersStore)

  const isFetching = ref(false)
  const page = ref(1)
  const itemsPerPage = ref(5)
  const total = ref(0)

  const { data: chartData, refresh } = useAsyncData(
    'chart-data',
    async () => {
      isFetching.value = true
      try {
        const response = await $fetch<{ data: Chart.Data[]; total: number }>(
          '/api/chart-data',
          {
            query: {
              indicator: indicatorFilterValue.value,
              country: countryFilterValue.value,
              highlight: highlightFilterValue.value,
              ...(options?.pagination
                ? {
                    page: page.value,
                    size: itemsPerPage.value
                  }
                : {})
            }
          }
        )

        total.value = response.total
        return options?.pagination ? response.data : response.data
      } finally {
        isFetching.value = false
      }
    },
    {
      watch: [
        indicatorFilterValue,
        countryFilterValue,
        highlightFilterValue,
        ...(options?.pagination ? [page, itemsPerPage] : [])
      ],
      deep: true,
      immediate: true
    }
  )

  watch(
    [indicatorFilterValue, countryFilterValue, highlightFilterValue],
    () => {
      page.value = 1
    },
    { deep: true }
  )

  const goToPage = (newPage: number) => {
    page.value = newPage
  }

  const updateItemsPerPage = (size: number) => {
    itemsPerPage.value = size
    page.value = 1 // Reset to first page when changing items per page
  }

  return {
    chartData,
    isFetching,
    page,
    itemsPerPage,
    total,
    goToPage,
    updateItemsPerPage,
    refresh
  }
}
