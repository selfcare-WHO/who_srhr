import type { MapboxComponentOptions } from 'nuxt-mapbox'

export const useMapConfiguration = (
  countriesPaint: ComputedRef<mapboxgl.LayerSpecification['paint']>
) => {
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

  // Base layer configurations
  const backgroundLayer: mapboxgl.LayerSpecification = {
    id: 'background',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'Background_VTP',
    paint: {
      'fill-color': '#ffffff'
    }
  }

  const countriesLayer = computed<mapboxgl.LayerSpecification>(() => ({
    id: 'countries',
    type: 'fill',
    source: 'who-world-features',
    paint: countriesPaint.value as mapboxgl.FillLayerSpecification['paint']
  }))

  const countriesBoundaryLayer: mapboxgl.LayerSpecification = {
    id: 'countries-boundary',
    type: 'line',
    source: 'who-world-features',
    paint: {
      'line-color': '#ffffff',
      'line-width': 1
    }
  }

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
      'line-width': 1
    }
  }

  const disputedTerritoriesLayer: mapboxgl.LayerSpecification = {
    id: 'disputed-territories',
    type: 'fill',
    source: 'who-world-basemap',
    'source-layer': 'DISPUTED_AREAS',
    paint: {
      'fill-color': '#E1E1E1'
    }
  }

  const disputedBordersLayer: mapboxgl.LayerSpecification = {
    id: 'disputed-borders',
    type: 'line',
    source: 'who-world-basemap',
    'source-layer': 'DISPUTED_BORDERS',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#828282',
      'line-dasharray': [0.1, 2.5],
      'line-width': 1
    }
  }

  const countryNamesLayer: mapboxgl.LayerSpecification = {
    id: 'country-names',
    type: 'symbol',
    source: 'who-world-basemap',
    'source-layer': 'Country Names/label',
    minzoom: 3,
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

  return {
    mapOptions,
    WHOWorldBasemapSource,
    backgroundLayer,
    countriesLayer,
    countriesBoundaryLayer,
    admin0Layer,
    disputedTerritoriesLayer,
    disputedBordersLayer,
    countryNamesLayer
  }
}
