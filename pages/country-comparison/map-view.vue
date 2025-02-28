<template lang="pug">
  .map-view(class="relative min-h-[80vh] bg-page my-4 flex-1" v-loading="isFetching")
    MapboxMap(
      ref="mapRef"
      class="h-full min-h-[80vh] rounded-lg"
      map-id="world-map"
      :options="mapOptions"
      @wheel="() => {}"
      @drag="() => {}"
    )
      MapboxSource(
        source-id="who-world-basemap"
        :source="WHOWorldBasemapSource"
      )

      MapboxSource(
        source-id="who-world-features"
        :source="linkedFeaturesSource"
      )
      
      MapboxLayer(:layer="backgroundLayer")
      MapboxLayer(:layer="landLayer")
      MapboxLayer(:layer="countriesLayer")
      MapboxLayer(:layer="admin0Layer")
      MapboxLayer(:layer="disputedTerritoriesLayer")
      MapboxLayer(:layer="disputedBordersLayer")
      MapboxLayer(:layer="countryNamesLayer")

      MapboxAttributionControl(
        :options="{ compact: true }"
        position="top-right"
      )

    MapFilters(class="absolute top-[20px] left-[20px]")

    MapLegend(
      class="absolute bottom-[20px] left-[20px]"
      :min-value="dataMinValue"
      :max-value="dataMaxValue"
      :current-indicator="currentIndicator"
      :data-type="dataTypeFilterValue"
    )

</template>

<script lang="ts" setup>
  import type {
    MapboxComponentOptions,
    MapboxInstancesObject
  } from 'nuxt-mapbox'
  import type {
    LayerSpecification,
    SourceSpecification,
    DataDrivenPropertyValueSpecification
  } from 'mapbox-gl'

  definePageMeta({
    name: 'CountryComparisonMap'
  })

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
      immediate: false
    }
  )

  const linkedGeoJSON = computed<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: mapData.value?.features || []
  }))

  const linkedFeaturesSource = computed<SourceSpecification>(() => ({
    type: 'geojson',
    data: linkedGeoJSON.value,
    tolerance: 0.5
  }))

  const mapRef = ref<MapboxInstancesObject>()

  const mapOptions: MapboxComponentOptions = {
    center: [20, 20],
    maxBounds: [
      [-200, -70],
      [200, 80]
    ],
    style: {
      version: 8,
      sources: {},
      layers: [],
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
    },
    zoom: 1.5,
    maxZoom: 4,
    minZoom: 1,
    projection: 'mercator',
  }

  const tilesUrl =
    'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_with_labels_VTP/VectorTileServer/tile/{z}/{y}/{x}.pbf'

  const WHOWorldBasemapSource: SourceSpecification = {
    type: 'vector',
    tiles: [tilesUrl]
  }

  const backgroundLayer: LayerSpecification = {
    id: 'background',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'Background_VTP',
    paint: {
      'fill-color': '#FFFFFF'
    }
  }

  const landLayer: LayerSpecification = {
    id: 'land',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'Land (ADM0)',
    paint: {
      'fill-color': parseCssVar('--el-bg-color-none')
    }
  }

  const lineWidth: DataDrivenPropertyValueSpecification<number> = [
    'interpolate',
    ['linear'],
    ['zoom'],
    0,
    1.5,
    4,
    2,
    8,
    3,
    12,
    4
  ]

  const targetsPaint: LayerSpecification['paint'] = {
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.75
    ],
    'fill-color': [
      'case',
      ['==', ['get', 'change'], 'Achieved'],
      getStatusColor('Achieved'),
      ['==', ['get', 'change'], 'Challenges remain'],
      getStatusColor('Challenges remain'),
      ['==', ['get', 'change'], 'Major challenges remain'],
      getStatusColor('Major challenges remain'),
      ['==', ['get', 'change'], 'Data not available '],
      getStatusColor('Data not available'),
      // fallback color
      getStatusColor('Data not available')
    ]
  }

  const dataMinValue = computed(() => {
    if (!mapData.value?.features?.length) return 0

    const values = mapData.value.features
      .map(feature => feature.properties?.originalValue)
      .filter(val => val !== undefined && val !== null)

    return values.length ? Math.min(...values) : 0
  })

  const dataMaxValue = computed(() => {
    if (!mapData.value?.features?.length) return 6

    const values = mapData.value.features
      .map(feature => feature.properties?.originalValue)
      .filter(val => val !== undefined && val !== null)

    return values.length ? Math.max(...values) : 6
  })

  const heatmapPaint = computed<LayerSpecification['paint']>(() => ({
    'fill-color': [
      'interpolate',
      ['linear'],
      ['to-number', ['get', 'originalValue']],
      dataMinValue.value,
      parseCssVar('--el-bg-color-heatmap-min'),
      dataMaxValue.value,
      parseCssVar('--el-bg-color-heatmap-max')
    ]
  }))

  const countriesPaint = computed<LayerSpecification['paint']>(() => {
    if (dataTypeFilterValue.value === 'targets') return targetsPaint
    if (dataTypeFilterValue.value === 'nominal') return targetsPaint
    if (dataTypeFilterValue.value === 'heatmap') return heatmapPaint.value

    return {}
  })

  const countriesLayer = computed<LayerSpecification>(() => ({
    id: 'countries',
    type: 'fill',
    source: 'who-world-features',
    paint: {
      ...countriesPaint.value
    }
  }))

  const admin0Layer: LayerSpecification = {
    id: 'admin-0',
    type: 'line',
    source: 'who-world-basemap',
    'source-layer': 'GLOBAL_ADM_L_Merge_20201201',
    filter: ['==', '_symbol', 0],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#FFFFFF',
      'line-width': lineWidth
    }
  }

  const disputedTerritoriesLayer: LayerSpecification = {
    id: 'disputed-territories',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'DISPUTED_AREAS',
    // filter: ['==', '_symbol', 1],
    paint: {
      'fill-color': '#E1E1E1'
    }
  }

  const disputedBordersLayer: LayerSpecification = {
    id: 'disputed-borders-dashed',
    type: 'line',
    source: 'who-world-basemap',
    'source-layer': 'DISPUTED_BORDERS',
    // filter: ['==', '_symbol', 0],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#828282',
      'line-dasharray': [0.1, 2.5],
      'line-width': lineWidth
    }
  }

  const countryNamesLayer: LayerSpecification = {
    id: 'country-names',
    type: 'symbol',
    source: 'who-world-basemap',
    'source-layer': 'Country Names/label',
    minzoom: 1,
    layout: {
      'text-font': ['Oswald Regular'],
      'text-size': 16,
      'text-field': '{_name}',
      'text-optional': true
    },
    paint: {
      'text-color': '#686868',
      'text-halo-color': '#FFFFFF',
      'text-halo-width': 2
    }
  }
</script>

<style lang="sass">
  .map-view
    .mapboxgl-ctrl-logo
      display: none !important
</style>
