import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('Filters', () => {
  const isFetchingFilters = ref(false)

  const domains = ref<Prisma.Domain[]>([])
  const indicators = ref<Prisma.IndicatorWithSubgroups[]>([])
  const countries = ref<Prisma.Country[]>([])

  const fetchFilterOptions = async () => {
    isFetchingFilters.value = true

    const { data } = await useFetch<Filter.Options>('/api/filter-options')

    domains.value = data.value?.domains || []
    indicators.value = data.value?.indicators || []
    countries.value = data.value?.countries || []

    isFetchingFilters.value = false
  }

  const fetchedFilters = computed(
    () => indicators.value.length > 0 && countries.value.length > 0
  )

  fetchFilterOptions()

  return {
    isFetchingFilters,
    fetchFilterOptions,
    fetchedFilters,
    domains,
    indicators,
    countries
  }
})
