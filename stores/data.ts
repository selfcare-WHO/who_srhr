import { defineStore, storeToRefs } from 'pinia'
import type { DataPoint } from '@prisma/client'

export const useDataStore = defineStore('Data', () => {
  const filtersStore = useFiltersStore()
  const { filterValues } = storeToRefs(filtersStore)

  const isLoadingData = ref(false)
  const dataPoints = ref<DataPoint[]>([])

  async function fetchData(filters: Filter.Values) {
    isLoadingData.value = true

    const data = await $fetch<DataPoint[]>(`/api/data`, {
      method: 'POST',
      body: {
        filters
      }
    })

    dataPoints.value = data

    isLoadingData.value = false
  }

  watch(filterValues, fetchData, { deep: true, immediate: true })

  return { isLoadingData, dataPoints, fetchData }
})
