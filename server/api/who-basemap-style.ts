/**
 * Serves WHO's officially published basemap style to the map view.
 *
 * WHO publish their legal-approved cartography as a Mapbox GL style at
 * <service>/resources/styles/root.json. We proxy it rather than hand-writing
 * layer specs, so their symbology — disputed borders, disputed areas, great
 * lakes — is whatever WHO says it is, and their updates propagate to us.
 *
 * Only URLs are rewritten. `layers` passes through verbatim; that array is the
 * approved symbology and must not be edited here.
 *
 * The rewrite is necessary because the published style uses paths relative to
 * its own URL, and one of them is not something Mapbox GL can consume:
 * `sources.esri.url` resolves to the VectorTileServer root, which returns
 * ArcGIS service metadata (a *relative* `tiles` path, no `tilejson` field)
 * rather than TileJSON. So the source is replaced with an inline vector source
 * pointing at absolute tile URLs.
 */

const VECTOR_TILE_SERVICE =
  'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_with_labels_VTP/VectorTileServer'

const CACHE_KEY = 'who-basemap-style'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

type MapboxStyle = Record<string, any>
type CachedStyle = { fetchedAt: number; style: MapboxStyle }

/** Note the {z}/{y}/{x} order — ArcGIS serves row before column. */
const TILE_URL = `${VECTOR_TILE_SERVICE}/tile/{z}/{y}/{x}.pbf`

const normalizeStyle = (style: MapboxStyle): MapboxStyle => {
  const sources = Object.fromEntries(
    Object.entries(style.sources ?? {}).map(([key, source]) => {
      const src = source as Record<string, any>
      return [
        key,
        {
          type: 'vector',
          tiles: [TILE_URL],
          minzoom: src.minzoom ?? 0,
          maxzoom: src.maxzoom ?? 22,
          ...(src.bounds ? { bounds: src.bounds } : {}),
          attribution: 'WHO'
        }
      ]
    })
  )

  return {
    ...style,
    sprite: `${VECTOR_TILE_SERVICE}/resources/sprites/sprite`,
    glyphs: `${VECTOR_TILE_SERVICE}/resources/fonts/{fontstack}/{range}.pbf`,
    sources
  }
}

export default defineEventHandler(async (event): Promise<MapboxStyle> => {
  const storage = useStorage()
  const cached = await storage.getItem<CachedStyle>(CACHE_KEY)

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
    return cached.style
  }

  try {
    const published = await $fetch<MapboxStyle>(
      `${VECTOR_TILE_SERVICE}/resources/styles/root.json`,
      { responseType: 'json', timeout: 20_000 }
    )

    if (!published?.layers?.length) {
      throw new Error('WHO style returned no layers')
    }

    const style = normalizeStyle(published)
    await storage.setItem(CACHE_KEY, { fetchedAt: Date.now(), style })

    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
    return style
  } catch (error) {
    // The map cannot render without a style, so a stale copy beats an error.
    if (cached) {
      console.error('WHO style refresh failed, serving stale copy:', error)
      setResponseHeader(event, 'Cache-Control', 'public, max-age=60')
      return cached.style
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Could not fetch the WHO basemap style'
    })
  }
})
