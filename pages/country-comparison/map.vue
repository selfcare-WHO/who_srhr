<template lang="pug">
  .map-view(class="bg-page py-4 flex-1")
    MapboxMap(
      ref="mapRef"
      class="h-full relative min-h-[75vh] rounded-lg"
      map-id="world-map"
      :options="mapOptions"
      @wheel="() => {}"
      @drag="() => {}"
    )
      MapboxSource(
        source-id="who-world-basemap"
        :source="WHOWorldBasemapSource"
      )
      
      MapboxLayer(:layer="backgroundLayer")
      MapboxLayer(:layer="landLayer")
      MapboxLayer(:layer="admin0Layer")
      MapboxLayer(:layer="disputedTerritoriesLayer")
      MapboxLayer(:layer="disputedBordersLayer")
      //- MapboxLayer(:layer="countryNamesLayer")
</template>

<script lang="ts" setup>
  defineOptions({ name: 'CountryComparisonMap' })

  import type {
    MapboxComponentOptions,
    MapboxInstancesObject
  } from 'nuxt-mapbox'
  import type { LayerSpecification, SourceSpecification } from 'mapbox-gl'

  import {} from 'nuxt-mapbox'

  const mapRef = ref<MapboxInstancesObject>()

  const mapOptions: MapboxComponentOptions = {
    center: [0, 0],

    zoom: 2,
    maxZoom: 8.5,
    projection: 'mercator',
    attributionControl: false
  }

  const WHOWorldBasemapSource: SourceSpecification = {
    type: 'vector',
    tiles: [
      'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_with_labels_VTP/VectorTileServer/tile/{z}/{y}/{x}.pbf'
    ]
  }

  const backgroundLayer: LayerSpecification = {
    id: 'background',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'Background_VTP',
    paint: {
      'fill-color': '#E8E9EC'
    }
  }

  const landLayer: LayerSpecification = {
    id: 'land',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'Land (ADM0)',
    paint: {
      'fill-color': '#FFFFFF'
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
      'line-color': '#828282',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        0.133333,
        7,
        1.33333,
        12,
        2.66667,
        18,
        8
      ]
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
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        0.133333,
        4,
        1.33333,
        8,
        2.66667,
        12,
        4
      ]
    }
  }

  const countryNamesLayer: LayerSpecification = {
    id: 'country-names',
    type: 'symbol',
    source: 'who-world-basemap',
    'source-layer': 'Country Names/label',
    minzoom: 1,
    layout: {
      'text-font': ['Arial Regular'],
      'text-size': 13.3333,
      'text-field': '{_name}',
      'text-optional': true
    },
    paint: {
      'text-color': '#686868',
      'text-halo-color': '#FFFFFF',
      'text-halo-width': 1
    }
  }

  // useMapbox('world-map', mapInstance => {
  // })
</script>

<style lang="sass" scoped></style>
