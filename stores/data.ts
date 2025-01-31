import { defineStore, storeToRefs } from 'pinia'

export const useDataStore = defineStore('Data', () => {
  const filtersStore = useFiltersStore()
  const { filterValues } = storeToRefs(filtersStore)

  const isLoadingData = ref(false)
  const dataPoints = ref<Prisma.DataPointWithType[]>([])

  async function fetchData() {
    isLoadingData.value = true

    const { data } = await useFetch<Prisma.DataPointWithType[]>(`/api/data`, {
      method: 'POST',
      body: {
        filters: filterValues.value
      }
    })

    dataPoints.value = data.value ?? []

    isLoadingData.value = false
  }

  fetchData()

  return { isLoadingData, dataPoints, fetchData }
})
