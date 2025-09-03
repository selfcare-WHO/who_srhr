let cachedGeoJSON: GeoJSON.FeatureCollection | null = null

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
  const geoJSONFeatures = ref<GeoJSON.Feature[]>([])

  const loadGeoJSON = async () => {
    if (cachedGeoJSON) {
      geoJSONFeatures.value = cachedGeoJSON.features
      return
    }

    try {
      const response = await fetch('/maps/who_countries.json')
      cachedGeoJSON = await response.json()
      geoJSONFeatures.value = cachedGeoJSON?.features || []
    } catch (error) {
      console.error('Failed to load GeoJSON:', error)
      geoJSONFeatures.value = []
    }
  }

  onMounted(() => {
    loadGeoJSON()
  })

  const { data: mapData } = useAsyncData<Map.DataPoints | null>(
    '/api/map-data',
    async () => {
      if (
        !indicatorFilterValue.value ||
        !subgroupFilterValue.value ||
        !dataTypeFilterValue.value
      )
        return Promise.resolve(null)

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
      watch: [indicatorFilterValue, subgroupFilterValue, dataTypeFilterValue],
      immediate: true
    }
  )

  const nominalLegend = computed(() => mapData.value?.legend)

  const linkedGeoJSON = computed<GeoJSON.FeatureCollection>(() => {
    if (!mapData.value || !geoJSONFeatures.value.length) {
      return {
        type: 'FeatureCollection',
        features: []
      }
    }

    const features = geoJSONFeatures.value.map(feature => {
      const countryCode = feature.properties?.ISO_3_CODE
      const dataProperties = mapData.value?.propertiesMap?.[countryCode] || {}

      return {
        ...feature,
        properties: {
          ...feature.properties,
          ...dataProperties
        }
      }
    })

    return {
      type: 'FeatureCollection',
      features
    }
  })

  const linkedFeaturesSource = computed<mapboxgl.SourceSpecification>(() => ({
    type: 'geojson',
    data: linkedGeoJSON.value
  }))

  const hasOther = computed(() => {
    return linkedGeoJSON.value.features.some(feature => {
      const value = feature.properties?.value

      const isNull = value === null || value === undefined
      const numberValue = Number(value)
      const isZero = numberValue === 0

      return !isNull && !isZero && isNaN(numberValue)
    })
  })

  const hasNoData = computed(() => {
    return linkedGeoJSON.value.features.some(feature => {
      const value = feature.properties?.value
      return value === undefined || value === null
    })
  })

  const jenksBreaks = computed(() => mapData.value?.jenksBreaks)

  onUnmounted(() => {
    cachedGeoJSON = null
  })

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
