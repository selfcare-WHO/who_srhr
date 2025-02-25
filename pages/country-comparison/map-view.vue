<template lang="pug">
  .map-view(class="relative bg-page py-4 flex-1" v-loading="isFetching")
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

      div(class="absolute top-[80px] left-[50px] w-[285px] rounded-lg bg-secondary bg-opacity-20 p-4")
        ElForm(
          class="flex gap-6"
          #default
          label-position="top"
        )
          ElFormItem(
            class="w-full"
            label="Indicator"
          )
            FilterItem(
              v-model="indicatorFilter.value"
              :options="indicatorFilter.options"
              :label="indicatorFilter.label"
              :multiple="!!indicatorFilter?.multiple"
              :tree="indicatorFilter.tree"
              :placeholder="indicatorFilter.placeholder"
              :clearable="!!indicatorFilter?.clearable"
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
  const { indicatorFilter, indicatorFilterValue } = storeToRefs(mapFiltersStore)

  const isFetching = ref(false)

  const { data: mapData } = useFetch('/api/map-data', {
    method: 'GET',
    query: {
      indicatorId: indicatorFilterValue
    },
    watch: [indicatorFilterValue],
    immediate: false,
    onRequest() {
      isFetching.value = true
    },
    onResponse({ response }) {
      response.ok && (isFetching.value = false)
    }
  })

  const linkedGeoJSON = computed<GeoJSON.FeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: mapData.value?.features || []
  }))

  const linkedFeaturesSource = computed<SourceSpecification>(() => ({
    type: 'geojson',
    data: linkedGeoJSON.value
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
    attributionControl: false
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

  const countriesLayer: LayerSpecification = {
    id: 'countries',
    type: 'fill',
    source: 'who-world-features',
    paint: {
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
  }

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

  useMapbox('world-map', mapInstance => {
    mapInstance.on('load', () => {
      // const features = mapInstance.querySourceFeatures('who-world-features', {
      //   sourceLayer: 'Admin2 Names/label'
      // })
    })
  })
</script>

<style lang="sass" scoped></style>
