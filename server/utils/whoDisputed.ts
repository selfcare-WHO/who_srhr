import type { Feature, FeatureCollection } from 'geojson'

/**
 * WHO's disputed borders and areas, classified into the symbol classes their
 * approved cartography draws them in.
 *
 * WHO publish that symbology as a Mapbox GL style, but the classification only
 * survives there as *layer ids* — each id lists the feature names it draws, and
 * the `_symbol` codes its filters use are baked per tileset (WHO's two styles
 * number the same features differently). The feature services carry no symbol
 * field at all, only NAME. So the mapping has to be restated here.
 *
 * Source of truth — re-read it before editing these lists:
 * https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_Disputed_Areas_and_Borders_VTP/VectorTileServer/resources/styles/root.json
 */

const ORG = 'https://services.arcgis.com/5T5nSi527N4F7luB/arcgis/rest/services'

const SERVICES = {
  borders: 'Detailed_Boundary_Disputed_Borders',
  areas: 'Detailed_Boundary_Disputed_Areas'
} as const

export type DisputedLayer = keyof typeof SERVICES

/**
 * NAME → symbol class, transcribed from WHO's style layer ids.
 *
 * Golan is listed because WHO's style classifies it, but neither feature
 * service actually serves it — which is how the SOP's "remove the blanked-out
 * Golan Heights" item is satisfied, by construction rather than by a filter.
 * It stays listed so this remains a faithful copy of WHO's classification.
 *
 * `Western Sahara (coastline)` is deliberately absent: no filter in WHO's style
 * matches it, so their own map does not draw it, and neither do we.
 */
const SYMBOL_CLASSES: Record<DisputedLayer, Record<string, string[]>> = {
  borders: {
    dotted: [
      'J&K Line of Control',
      'Ilemi Triangle',
      'Abyei (SSD Claim)',
      'Abyei (SDN Claim)'
    ],
    kosovo: ['Kosovo'],
    dashed: [
      'Sudan-South Sudan',
      'Gaza Strip',
      'West Bank',
      'Ethiopia-Somalia',
      'Halayib Triangle (SDN Claim)',
      'Korean DMZ',
      'J&K (IND Claim)',
      'J&K (PAK Claim)',
      'Bir Tawil (SDN Claim)'
    ],
    solid: [
      'Aksai Chin (IND Claim)',
      'Aksai Chin (CHN Claim)',
      'Arunachal Pradesh',
      'Halayib Triangle (EGY Claim)',
      'Bir Tawil (EGY Claim)',
      'Jammu and Kashmir',
      'Western Sahara',
      'Golan'
    ]
  },
  areas: {
    lakes: [
      'Aral Sea',
      'Great Lakes of NA',
      'Lake Albert',
      'Lake Malawi',
      'Lake Tanganyika',
      'Lake Titicaca',
      'Lake Victoria'
    ],
    notApplicable: ['Golan', 'Jammu and Kashmir', 'Western Sahara', 'Abyei'],
    aksaiChin: ['Aksai Chin']
  }
}

const symbolClassByName = (layer: DisputedLayer): Record<string, string> => {
  const lookup: Record<string, string> = {}

  for (const [symbolClass, names] of Object.entries(SYMBOL_CLASSES[layer])) {
    for (const name of names) lookup[name] = symbolClass
  }

  return lookup
}

/**
 * Round to 4 decimal places (~11 m), which halves the payload.
 *
 * The map stops at zoom 6, where a pixel spans about 0.0021°, so this grid is
 * ~20x finer than a pixel and cannot show up as a staircase. Worth stating
 * because the obvious alternative — ArcGIS's own `maxAllowableOffset` — snaps
 * vertices to a far coarser grid and visibly does.
 */
const roundCoordinates = (coordinates: any): any =>
  typeof coordinates[0] === 'number'
    ? [
        Math.round(coordinates[0] * 1e4) / 1e4,
        Math.round(coordinates[1] * 1e4) / 1e4
      ]
    : coordinates.map(roundCoordinates)

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] }

const fetchDisputed = async (
  layer: DisputedLayer
): Promise<FeatureCollection> => {
  const query = new URLSearchParams({
    where: '1=1',
    outFields: 'NAME,EndDate',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geojson'
  })

  const collection = await $fetch<FeatureCollection>(
    `${ORG}/${SERVICES[layer]}/FeatureServer/0/query?${query}`,
    { responseType: 'json', timeout: 30_000 }
  )

  const symbolClass = symbolClassByName(layer)
  const now = Date.now()
  const features: Feature[] = []

  for (const feature of collection.features ?? []) {
    const name = feature.properties?.NAME as string | undefined
    const endDate = feature.properties?.EndDate as number | null | undefined

    // Both services are date-ranged; drop anything already superseded.
    if (typeof endDate === 'number' && endDate <= now) continue
    if (!name || !symbolClass[name]) continue

    const geometry = feature.geometry as any

    features.push({
      ...feature,
      geometry: {
        ...geometry,
        coordinates: roundCoordinates(geometry.coordinates)
      },
      properties: { NAME: name, symbolClass: symbolClass[name] }
    } as Feature)
  }

  if (features.length === 0) {
    throw new Error(`WHO disputed ${layer} returned no classifiable features`)
  }

  return { type: 'FeatureCollection', features }
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

type CachedCollection = { fetchedAt: number; collection: FeatureCollection }

export const disputedCollection = async (
  layer: DisputedLayer
): Promise<FeatureCollection> => {
  const storage = useStorage()
  const key = `who-disputed-${layer}`
  const cached = await storage.getItem<CachedCollection>(key)

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.collection
  }

  try {
    const collection = await fetchDisputed(layer)
    await storage.setItem(key, { fetchedAt: Date.now(), collection })
    return collection
  } catch (error) {
    if (cached) {
      console.error(
        `WHO disputed ${layer} refresh failed, serving stale copy:`,
        error
      )
      return cached.collection
    }

    // Nothing cached and WHO are unreachable. The map still draws, just without
    // the cartography their map SOP requires — and nothing on the map says so.
    // The server log is the only signal, so make it unambiguous.
    console.error(
      `WHO disputed ${layer} unavailable and nothing cached — the map will render WITHOUT SOP-required cartography:`,
      error
    )
    return EMPTY
  }
}
