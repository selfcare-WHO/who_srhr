import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('Filters', () => {
  const isFetchingFilters = ref(true)

  const { data, refresh: refreshFilterOptions } = useAsyncData<Filter.Options>(
    'filter-options',
    async () => {
      isFetchingFilters.value = true
      const res = await $fetch('/api/filter-options')
      isFetchingFilters.value = false

      return res
    },
    {
      server: false
    }
  )

  const domains = computed<Prisma.Domain[]>(() => data.value?.domains || [])
  const indicators = computed<Prisma.SerializedIndicatorWithSubgroups[]>(
    () => data.value?.indicators || []
  )
  const countries = computed<Prisma.Country[]>(
    () => data.value?.countries || []
  )

  return {
    isFetchingFilters,
    refreshFilterOptions,
    domains,
    indicators,
    countries
  }
})
