/**
 * The basemap is drawn from the same GeoJSON as the choropleth, so the two can
 * never disagree. That mismatch — a simplified 2025 country export stacked over
 * WHO's 2022 basemap tileset — is why the vector tile source is gone.
 *
 * WHO's disputed cartography still has to be theirs, so it arrives from their
 * live feature services via /api/who-disputed-*, painted with values transcribed
 * from their published style:
 * WHO_Polygon_Basemap_Disputed_Areas_and_Borders_VTP/VectorTileServer/resources/styles/root.json
 *
 * Do not trim those paint values or drop a class that looks redundant. They are
 * WHO's legal-approved symbology, and drawing a hand-picked subset of it is
 * precisely what their map SOP review flagged.
 */

const DISPUTED_VTP =
  'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_Disputed_Areas_and_Borders_VTP/VectorTileServer'

const DISPUTED_GREY = '#828282'

/**
 * WHO's line width ramp, shared by every disputed border class. Their style
 * writes it as a legacy `stops` function; this is the same linear interpolation
 * in expression form, which is what the current typings accept.
 */
const DISPUTED_LINE_WIDTH = [
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
] as mapboxgl.ExpressionSpecification

/**
 * WHO ship the Aksai Chin hatch as eight sprite images, one per zoom band,
 * because Mapbox fill patterns do not scale with zoom. Transcribed verbatim,
 * including the bands above our maxZoom of 6 — see the note at the top of this
 * file about not cherry-picking WHO's symbology.
 */
const AKSAI_CHIN_TIERS: Array<{
  suffix: string
  minzoom?: number
  maxzoom?: number
}> = [
  { suffix: '_7', maxzoom: 2 },
  { suffix: '_6', minzoom: 2, maxzoom: 3 },
  { suffix: '_5', minzoom: 3, maxzoom: 4 },
  { suffix: '_4', minzoom: 4, maxzoom: 5 },
  { suffix: '_3', minzoom: 5, maxzoom: 6 },
  { suffix: '_2', minzoom: 6, maxzoom: 7 },
  { suffix: '_1', minzoom: 7, maxzoom: 9 },
  { suffix: '', minzoom: 9 }
]

const disputedBorderLayer = (
  id: string,
  symbolClass: string,
  paint: mapboxgl.LineLayerSpecification['paint'],
  layout: mapboxgl.LineLayerSpecification['layout'] = { 'line-join': 'round' }
): mapboxgl.LayerSpecification => ({
  id,
  type: 'line',
  source: 'who-disputed-borders',
  filter: ['==', ['get', 'symbolClass'], symbolClass],
  layout,
  paint: { 'line-width': DISPUTED_LINE_WIDTH, ...paint }
})

const disputedAreaLayer = (
  id: string,
  symbolClass: string,
  paint: mapboxgl.FillLayerSpecification['paint'],
  zoom: { minzoom?: number; maxzoom?: number } = {}
): mapboxgl.LayerSpecification => ({
  id,
  type: 'fill',
  source: 'who-disputed-areas',
  filter: ['==', ['get', 'symbolClass'], symbolClass],
  ...zoom,
  paint
})

export const useMapConfiguration = (
  countriesPaint: ComputedRef<mapboxgl.LayerSpecification['paint']>
) => {
  const mapOptions: Omit<mapboxgl.MapOptions, 'container'> = {
    center: [20, 20],
    maxBounds: [
      [-200, -70],
      [200, 80]
    ],
    style: {
      version: 8,
      sources: {},
      // Replaces the white Background_VTP fill that used to come from the
      // tileset we no longer load.
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#ffffff' }
        }
      ],
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      // Only used for the Aksai Chin hatch. If it fails to load the map still
      // renders; that one fill pattern just stops drawing.
      sprite: `${DISPUTED_VTP}/resources/sprites/sprite`
    },
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

  const disputedBordersSource: mapboxgl.SourceSpecification = {
    type: 'geojson',
    data: '/api/who-disputed-borders'
  }

  const disputedAreasSource: mapboxgl.SourceSpecification = {
    type: 'geojson',
    data: '/api/who-disputed-areas'
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
    source: 'who-country-boundaries',
    paint: {
      'line-color': '#ffffff',
      'line-width': 1
    }
  }

  /**
   * Disputed areas sit above the choropleth on purpose: that is what makes
   * Western Sahara, Jammu and Kashmir and Abyei read as "Not applicable"
   * whichever indicator is selected. Hover is unaffected — it is bound to the
   * `countries` layer, not to whatever happens to be topmost.
   */
  // WHO paint lakes #E8E9EC, which is also their ocean. Ours is white, so the
  // lakes follow it — otherwise they read as "Not applicable" grey.
  const disputedAreaLakesLayer = disputedAreaLayer(
    'disputed-areas-lakes',
    'lakes',
    { 'fill-color': '#ffffff' }
  )

  const disputedAreaNotApplicableLayer = disputedAreaLayer(
    'disputed-areas-not-applicable',
    'notApplicable',
    { 'fill-color': '#E1E1E1' }
  )

  const disputedAreaAksaiChinLayers: mapboxgl.LayerSpecification[] =
    AKSAI_CHIN_TIERS.map(({ suffix, minzoom, maxzoom }) =>
      disputedAreaLayer(
        `disputed-areas-aksai-chin${suffix}`,
        'aksaiChin',
        {
          'fill-pattern': `DISPUTED BORDERS AND AREAS/DISPUTED_AREAS/Aksai Chin${suffix}`
        },
        {
          ...(minzoom !== undefined && { minzoom }),
          ...(maxzoom !== undefined && { maxzoom })
        }
      )
    )

  // J&K Line of Control, Ilemi Triangle, both Abyei claims. The round cap is
  // what turns a 0.1-long dash into a dot rather than an invisible sliver.
  const disputedBorderDottedLayer = disputedBorderLayer(
    'disputed-borders-dotted',
    'dotted',
    { 'line-color': DISPUTED_GREY, 'line-dasharray': [0.1, 2.5] },
    { 'line-cap': 'round', 'line-join': 'round' }
  )

  const disputedBorderKosovoLayer = disputedBorderLayer(
    'disputed-borders-kosovo',
    'kosovo',
    { 'line-color': DISPUTED_GREY, 'line-dasharray': [3, 3] }
  )

  const disputedBorderSolidLayer = disputedBorderLayer(
    'disputed-borders-solid',
    'solid',
    { 'line-color': DISPUTED_GREY },
    { 'line-cap': 'round', 'line-join': 'round' }
  )

  // WHO draw this class twice: a near-white casing, then the grey dashes over
  // it. Both are needed — the casing is what separates the dashes from whatever
  // the choropleth painted underneath.
  const disputedBorderDashedCasingLayer = disputedBorderLayer(
    'disputed-borders-dashed-casing',
    'dashed',
    { 'line-color': '#FAFAFA' }
  )

  const disputedBorderDashedLayer = disputedBorderLayer(
    'disputed-borders-dashed',
    'dashed',
    { 'line-color': DISPUTED_GREY, 'line-dasharray': [5, 4] }
  )

  const countryNamesLayer: mapboxgl.LayerSpecification = {
    id: 'country-names',
    type: 'symbol',
    source: 'who-country-labels',
    minzoom: 3,
    layout: {
      'text-font': ['Oswald Regular'],
      'text-size': 16,
      'text-field': ['get', 'name'],
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
    disputedBordersSource,
    disputedAreasSource,
    countriesLayer,
    countriesHatchLayer,
    countriesBoundaryLayer,
    disputedAreaLakesLayer,
    disputedAreaNotApplicableLayer,
    disputedAreaAksaiChinLayers,
    disputedBorderDottedLayer,
    disputedBorderKosovoLayer,
    disputedBorderSolidLayer,
    disputedBorderDashedCasingLayer,
    disputedBorderDashedLayer,
    countryNamesLayer
  }
}
