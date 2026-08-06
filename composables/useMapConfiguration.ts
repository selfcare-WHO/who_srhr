/**
 * The basemap — background, boundaries, disputed areas and borders, great
 * lakes, labels — comes from WHO's published style via /api/who-basemap-style.
 * Only the data layers below are ours.
 */

/**
 * Where our data layers slot into WHO's stack. WHO order the style
 * `Background_VTP/1` → `Land (ADM0)/1` → `Boundaries/*` → disputed areas and
 * borders → labels, so anchoring at the first boundary layer puts the
 * choropleth directly above the land fill and below everything WHO draws on
 * top of it.
 */
export const WHO_BASEMAP_ANCHOR_LAYER =
  'Boundaries/GLOBAL_ADM_L_Merge_20201201/2'

/** WHO's English country-label layer, restyled at runtime for Türkiye. */
export const WHO_COUNTRY_LABEL_LAYER = 'Country Names/label/English'

export const useMapConfiguration = (
  countriesPaint: ComputedRef<mapboxgl.LayerSpecification['paint']>
) => {
  const mapOptions: Omit<mapboxgl.MapOptions, 'container'> = {
    center: [20, 20],
    maxBounds: [
      [-200, -70],
      [200, 80]
    ],
    // Mapbox GL fetches this itself. The route serves absolute sprite, glyph
    // and tile URLs, so nothing here needs resolving against a base.
    style: '/api/who-basemap-style',
    zoom: 1.5,
    maxZoom: 6,
    minZoom: 0.5,
    projection: 'mercator',
    maxTileCacheSize: 0,
    maxPitch: 0,
    pitchWithRotate: false,
    touchPitch: false,
    touchZoomRotate: false,
    dragRotate: false
  }

  const countriesLayer = computed<mapboxgl.LayerSpecification>(() => ({
    id: 'countries',
    type: 'fill',
    source: 'who-world-features',
    paint: countriesPaint.value as mapboxgl.FillLayerSpecification['paint']
  }))

  const countriesHatchLayer: mapboxgl.LayerSpecification = {
    id: 'countries-hatch',
    type: 'fill',
    source: 'who-world-features',
    paint: { 'fill-pattern': 'hatch-pattern' }
  }

  const countriesBoundaryLayer: mapboxgl.LayerSpecification = {
    id: 'countries-boundary',
    type: 'line',
    source: 'who-world-features',
    paint: {
      'line-color': '#ffffff',
      'line-width': 1
    }
  }

  return {
    mapOptions,
    countriesLayer,
    countriesHatchLayer,
    countriesBoundaryLayer
  }
}
