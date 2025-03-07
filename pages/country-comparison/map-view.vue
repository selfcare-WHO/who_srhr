<template lang="pug">
  .map-view(
    class="relative min-h-[80vh] bg-page my-4 flex-1"
    @mousemove="onGlobalMouseMove"
    v-loading="isFetching"
  )
    MapDetailsPopover(
      v-model="showPopover"
      :popover-data="popoverData"
    )

    div(
      class="virtual-element absolute"
      ref="virtualElementRef"
      :style="coordinatesStyle"
      :id="String(popoverData?.country?.id)"
      :key="String(popoverData?.country?.id)"
    )

    MapboxMap(
      class="h-full min-h-[80vh] rounded-lg"
      map-id="world-map"
      :options="mapOptions"
      @wheel="onWheel"
      @drag="showPopover = false"
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
      MapboxLayer(
        :layer="countriesLayer"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      )
      MapboxLayer(:layer="countriesLayer")
      MapboxLayer(:layer="admin0Layer")
      MapboxLayer(:layer="disputedTerritoriesLayer")
      MapboxLayer(:layer="disputedBordersLayer")
      MapboxLayer(:layer="countryNamesLayer")

      MapboxAttributionControl(
        class="hide-popover-on-hover"
        :options="{ compact: true }"
        position="top-right"
      )

      MapboxNavigationControl(
        class="hide-popover-on-hover"
        :options="{ showCompass: false, visualizePitch: false }"
        position="bottom-right"
      )

      ElButton(
        class=`hide-popover-on-hover center-map-button absolute top-[10px] right-[10px] w-[29px] h-[29px]
          shadow-[0_0_0_1px_rgba(0,0,0,0.1)] z-10
        `
        plain
        :icon="Aim"
        @click="onCenterMap"
      )

    MapFilters(
      class="hide-popover-on-hover absolute top-[20px] left-[20px]"
    )

    MapLegend(
      class="hide-popover-on-hover absolute bottom-[20px] left-[20px]"
      :min-value="dataMinValue"
      :max-value="dataMaxValue"
      :current-indicator="currentIndicator"
      :data-type="dataTypeFilterValue"
      :nominal-legend="nominalLegend"
    )
</template>

<script lang="ts" setup>
  import type { MapboxComponentOptions } from 'nuxt-mapbox'

  import { Aim } from '@element-plus/icons-vue'

  defineOptions({ name: 'CountryComparisonMap' })

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
    projection: 'mercator'
  }

  const tilesUrl =
    'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_with_labels_VTP/VectorTileServer/tile/{z}/{y}/{x}.pbf'

  const WHOWorldBasemapSource: mapboxgl.SourceSpecification = {
    type: 'vector',
    tiles: [tilesUrl]
  }

  const backgroundLayer: mapboxgl.LayerSpecification = {
    id: 'background',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'Background_VTP',
    paint: {
      'fill-color': '#FFFFFF'
    }
  }

  const lineWidth: mapboxgl.DataDrivenPropertyValueSpecification<number> = [
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

  const targetsPaint: mapboxgl.LayerSpecification['paint'] = {
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

  const heatmapPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    const min = dataMinValue.value
    const max =
      dataMinValue.value === dataMaxValue.value
        ? dataMinValue.value + 1
        : dataMaxValue.value

    return {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['to-number', ['get', 'value']],
        min,
        parseCssVar('--el-bg-color-heatmap-min'),
        max,
        parseCssVar('--el-bg-color-heatmap-max')
      ]
    }
  })

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (dataTypeFilterValue?.value === 'targets') return targetsPaint
    if (dataTypeFilterValue?.value === 'nominal') return targetsPaint
    if (dataTypeFilterValue?.value === 'heatmap') return heatmapPaint.value

    return {}
  })

  const countriesLayer = computed<mapboxgl.LayerSpecification>(() => ({
    id: 'countries',
    type: 'fill',
    source: 'who-world-features',
    paint: {
      ...countriesPaint.value
    }
  }))

  const admin0Layer: mapboxgl.LayerSpecification = {
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

  const disputedTerritoriesLayer: mapboxgl.LayerSpecification = {
    id: 'disputed-territories',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'DISPUTED_AREAS',
    // filter: ['==', '_symbol', 1],
    paint: {
      'fill-color': '#E1E1E1'
    }
  }

  const disputedBordersLayer: mapboxgl.LayerSpecification = {
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

  const countryNamesLayer: mapboxgl.LayerSpecification = {
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

  const mapRef = useMapboxRef('world-map')

  const onCenterMap = () => {
    mapRef.value?.flyTo({
      center: [20, 20],
      zoom: 1.5
    })
  }

  const showPopover = ref(false)

  const onWheel = (e: mapboxgl.MapWheelEvent) => {
    const map = e.target
    const { deltaY } = e.originalEvent
    const currentZoom = map.getZoom()

    if (!currentZoom) return

    const newZoom = currentZoom - deltaY / 120

    showPopover.value = false
    map.flyTo({ zoom: newZoom })
  }

  const hoveredFeatureId = ref<string | number>('')
  const virtualElementRef = ref<HTMLElement | undefined>()
  const popoverData = reactive<Map.PopoverData>({})
  const popoverCoordinates = ref<mapboxgl.Point | undefined>()

  const onGlobalMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    if (
      target?.classList?.contains('hide-popover-on-hover') &&
      showPopover.value
    ) {
      showPopover.value = false
      return
    }
  }

  const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
    const map = e.target
    const feature = e.features?.[0]
    const featureId = feature?.id
    const { length } = e?.features ?? []
    const isSameFeature = featureId === hoveredFeatureId.value

    if (length === 0 || !featureId || isSameFeature) return

    map.setFeatureState(
      { source: 'who-world-features', id: hoveredFeatureId.value },
      { hover: false }
    )

    map.setFeatureState(
      {
        source: 'who-world-features',
        id: featureId
      },
      { hover: true }
    )

    hoveredFeatureId.value = feature?.id || ''
    map.getCanvas().style.cursor = 'pointer'

    const { dataPointId, CENTER_LAT, CENTER_LON } = feature.properties as {
      dataPointId: string
      CENTER_LAT: number
      CENTER_LON: number
    }

    const dataPoint = mapData.value?.dataPoints.find(
      dp => dp.id.toString() === dataPointId
    )

    popoverData.lngLat = [CENTER_LON, CENTER_LAT]
    popoverData.country = feature.properties?.ADM0_VIZ_NAME
    popoverData.value = formatData({
      indicator: currentIndicator.value,
      dataPoint
    })
    popoverData.element = undefined

    nextTick(() => {
      popoverData.element = virtualElementRef.value

      popoverCoordinates.value = map.project([CENTER_LON, CENTER_LAT])
      showPopover.value = true
    })
  }

  const onMouseLeave = (e: mapboxgl.MapMouseEvent) => {
    const map = e.target
    const features = map.queryRenderedFeatures(e.point)

    if (features.some(f => f.layer?.id === 'countries')) return

    map.setFeatureState(
      { source: 'who-world-features', id: hoveredFeatureId.value },
      { hover: false }
    )

    hoveredFeatureId.value = ''
    map.getCanvas().style.cursor = ''
    showPopover.value = false
  }

  const hidePopover = () => {
    showPopover.value = false
  }

  const coordinatesStyle = computed(() =>
    popoverCoordinates.value
      ? {
          left: `${popoverCoordinates.value.x}px`,
          top: `${popoverCoordinates.value.y}px`
        }
      : {}
  )

  onBeforeUnmount(() => {
    showPopover.value = false
    mapRef.value?.remove()
  })
</script>

<style lang="sass">
  .map-view
    .mapboxgl-ctrl-logo
      display: none !important

    .center-map-button
      border-color: rgb(229, 231, 235) !important

      &:hover
        border-color: rgb(229, 231, 235) !important
        background-color: #f2f2f2 !important
</style>
