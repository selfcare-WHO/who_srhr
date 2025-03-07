export const useMapData = () => {
  const mapFiltersStore = useMapFiltersStore()
  const { indicatorFilterValue, dataTypeFilterValue, currentIndicator } =
    storeToRefs(mapFiltersStore)

  const isFetching = ref(false)

  const { data: mapData } = useAsyncData<Map.DataPoints | null>(
    '/api/map-data',
    async () => {
      if (!indicatorFilterValue.value) return Promise.resolve(null)

      isFetching.value = true
      const data = await $fetch('/api/map-data', {
        query: { indicatorId: indicatorFilterValue.value }
      })
      isFetching.value = false

      return data
    },
    {
      watch: [indicatorFilterValue],
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
    tolerance: 0.5
  }))

  // Data value calculations
  const dataMinValue = computed(() => {
    if (!mapData.value?.features?.length) return 0

    const values = mapData.value.features
      .map(feature => feature.properties?.value)
      .filter(val => val !== undefined && val !== null && !isNaN(Number(val)))

    return values.length ? Math.min(...values) : 0
  })

  const dataMaxValue = computed(() => {
    if (!mapData.value?.features?.length) return 1

    const values = mapData.value.features
      .map(feature => feature.properties?.value)
      .filter(val => val !== undefined && val !== null && !isNaN(Number(val)))

    return values.length ? Math.max(...values) : 1
  })

  return {
    mapData,
    isFetching,
    nominalLegend,
    linkedFeaturesSource,
    dataMinValue,
    dataMaxValue,
    currentIndicator,
    dataTypeFilterValue
  }
}
