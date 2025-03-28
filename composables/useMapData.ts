export const useMapData = () => {
  const mapFiltersStore = useMapFiltersStore()
  const {
    indicatorFilterValue,
    subgroupFilterValue,
    dataTypeFilterValue,
    currentIndicator,
    currentSubgroup
  } = storeToRefs(mapFiltersStore)

  const isFetching = ref(false)

  const { data: mapData } = useAsyncData<Map.DataPoints | null>(
    '/api/map-data',
    async () => {
      if (!indicatorFilterValue.value) return Promise.resolve(null)

      isFetching.value = true
      const data = await $fetch<Map.DataPoints>('/api/map-data', {
        query: {
          indicatorId: indicatorFilterValue.value,
          subgroupId: subgroupFilterValue.value
        }
      })
      isFetching.value = false

      return data
    },
    {
      watch: [indicatorFilterValue, subgroupFilterValue],
      immediate: true
    }
  )

  const nominalLegend = computed(() => mapData.value?.legend)

  const linkedGeoJSON = computed<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: mapData.value?.features || []
  }))

  const linkedFeaturesSource = computed<mapboxgl.SourceSpecification>(() => ({
    type: 'geojson',
    data: linkedGeoJSON.value,
    tolerance: 0.75
  }))

  const hasOther = computed(() => {
    return mapData.value?.features.some(feature => {
      const value = feature.properties?.value

      const isNull = value === null || value === undefined
      const numberValue = Number(value)
      const isZero = numberValue === 0

      return !isNull && !isZero && isNaN(numberValue)
    })
  })

  const hasNoData = computed(() => {
    return mapData.value?.features.some(feature => {
      const value = feature.properties?.value
      return value === undefined || value === null
    })
  })

  const jenksBreaks = computed(() => mapData.value?.jenksBreaks)

  return {
    mapData,
    isFetching,
    linkedFeaturesSource,
    currentIndicator,
    currentSubgroup,
    dataTypeFilterValue,
    nominalLegend,
    hasOther,
    hasNoData,
    jenksBreaks
  }
}
