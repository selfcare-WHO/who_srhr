import { defineStore, storeToRefs } from 'pinia'
import type { DataPoint } from '@prisma/client'

export const useDataStore = defineStore('Data', () => {
  const filtersStore = useFiltersStore()
  const { filterValues } = storeToRefs(filtersStore)

  const isLoadingData = ref(false)
  const dataPoints = ref<DataPoint[]>([])

  async function fetchData() {
    isLoadingData.value = true

    const data = await $fetch<DataPoint[]>(`/api/data`, {
      method: 'POST',
      body: {
        filters: filterValues.value
      }
    })

    dataPoints.value = data

    isLoadingData.value = false
  }

  return { isLoadingData, dataPoints, fetchData }
})
