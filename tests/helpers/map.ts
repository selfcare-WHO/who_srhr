import type { Page } from '@playwright/test'

/**
 * nuxt-mapbox keeps its map registry in a module-scoped ref with no global
 * handle. Vite serves it as ESM, so re-importing the same module URL in page
 * context yields the same singleton — that's how we reach the live Map.
 */
const ATTACH_MAP = `
  const url = performance.getEntriesByType('resource')
    .map(e => e.name)
    .find(n => /mapboxInstances\\.js/.test(n))
  if (!url) return false
  const mod = await import(url)
  const entry = mod._useMapboxInstances().value['world-map']
  if (!entry || !entry.map) return false
  window.__map = entry.map
  return true
`

/** Kill transitions/animations so a screenshot never catches a mid-fade frame. */
const FREEZE_CSS = `
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }
`

export type MapQuery = {
  dataType: string
  indicator: string
  subgroup: string
}

export const CAPTURE_STATES: Array<{ name: string; query: MapQuery }> = [
  {
    name: 'heatmap',
    query: {
      dataType: 'numerical_categorical',
      indicator: '4',
      subgroup: '37263'
    }
  },
  {
    name: 'nominal',
    query: {
      dataType: 'numerical_categorical',
      indicator: '39',
      subgroup: '37270'
    }
  },
  {
    name: 'laws',
    query: { dataType: 'laws_policies', indicator: '19', subgroup: '37270' }
  },
  {
    name: 'targets',
    query: { dataType: 'targets', indicator: '5', subgroup: '37264' }
  }
]

/** Fixed camera so before/after captures are pixel-comparable. */
export const WORLD_VIEW = { center: [20, 20] as [number, number], zoom: 1.5 }

/**
 * Poll a page-side check from Node. Deliberately not page.waitForFunction:
 * an async page function returns a Promise, which is always truthy, so the
 * wait resolves immediately and silently.
 */
async function pollUntil<T>(
  page: Page,
  probe: () => Promise<T & { ok: boolean }>,
  timeout: number,
  describe: (last: T & { ok: boolean }) => string
) {
  const started = Date.now()
  let last = await probe()
  while (!last.ok) {
    if (Date.now() - started > timeout) throw new Error(describe(last))
    await page.waitForTimeout(250)
    last = await probe()
  }
  return last
}

export async function openMap(page: Page, query: MapQuery) {
  const qs = new URLSearchParams(query as unknown as Record<string, string>)
  await page.goto(`/country-comparison/map-view?${qs}`, {
    waitUntil: 'domcontentloaded'
  })
  await page.addStyleTag({ content: FREEZE_CSS })

  // 1. Attach the live Map instance.
  await pollUntil(
    page,
    () =>
      page.evaluate(async attach => {
        try {
          const fn = new Function(`return (async () => { ${attach} })()`)
          const ok = await fn()
          return { ok: !!ok }
        } catch (e) {
          return { ok: false, err: String(e) }
        }
      }, ATTACH_MAP),
    90_000,
    last => `Map instance never appeared (${JSON.stringify(last)})`
  )

  // 2. Wait on real state rather than the absence of a DOM node — the overlay
  //    has not mounted yet right after navigation, so "no mask" is trivially
  //    true at first and would let us screenshot a blank canvas.
  //
  //    A hang here is meaningful: the overlay is driven by
  //    `isFetching || isInitializing || isMapRefreshing` (map-view.vue:11), and
  //    isInitializing comes from useSyncRouteFilters, whose waitUntil() has no
  //    timeout. Report that rather than masking it.
  await pollUntil(
    page,
    () =>
      page.evaluate(() => {
        const map = (window as any).__map
        const features =
          map?.getSource('who-world-features')?._data?.features ?? []
        const layers = map?.style?._order?.length ?? 0
        const mask = !!document.querySelector('.map-container .el-loading-mask')
        const tiles = !!map?.areTilesLoaded?.()
        return {
          ok: features.length > 0 && layers > 0 && tiles && !mask,
          features: features.length,
          layers,
          tiles,
          mask
        }
      }),
    90_000,
    last =>
      `Map never became ready for ${JSON.stringify(query)} — ${JSON.stringify(last)}. ` +
      `If mask=true indefinitely, suspect useSyncRouteFilters waitUntil() (no timeout).`
  )

  // 3. Pin the camera, then let the map settle.
  await page.evaluate(view => {
    ;(window as any).__map.jumpTo({ center: view.center, zoom: view.zoom })
  }, WORLD_VIEW)

  await settle(page)
}

/** Resolve once mapbox reports it has nothing left to render. */
export async function settle(page: Page, timeout = 20_000) {
  await page.evaluate(async ms => {
    const map = (window as any).__map
    await new Promise<void>(resolve => {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        map.off('idle', finish)
        resolve()
      }
      map.on('idle', finish)
      setTimeout(finish, ms)
    })
  }, timeout)
}

export type ProbePoint = {
  name: string
  lngLat: [number, number]
  zoom: number
}

/**
 * Probe coordinates chosen from the WHO SOP items under review, plus controls.
 * Zoomed in because several WHO style layers carry a minzoom and simply do not
 * render at world view.
 */
export const PROBES: ProbePoint[] = [
  { name: 'kashmir', lngLat: [76.5, 34.5], zoom: 5 },
  { name: 'aksai-chin', lngLat: [79.5, 35.2], zoom: 5 },
  { name: 'kosovo', lngLat: [20.9, 42.6], zoom: 5 },
  { name: 'sudan-egypt-halayib', lngLat: [35.5, 22.2], zoom: 5 },
  { name: 'ssudan-kenya-ilemi', lngLat: [34.8, 4.9], zoom: 5 },
  { name: 'lake-victoria', lngLat: [33.0, -1.0], zoom: 5 },
  { name: 'golan', lngLat: [35.75, 33.1], zoom: 6 },
  { name: 'western-sahara', lngLat: [-13.0, 24.5], zoom: 4 },
  { name: 'brazil-member-state', lngLat: [-51.0, -10.0], zoom: 4 },
  { name: 'aruba-non-member', lngLat: [-69.97, 12.52], zoom: 6 },
  // Inland Luzon. An archipelago needs a point that is actually on land —
  // [122, 12] sits in the Sibuyan Sea and probes nothing.
  { name: 'philippines', lngLat: [121.0, 16.5], zoom: 6 }
]

/**
 * At each probe, record which layers paint. Order matters: this is what
 * catches the choropleth being stacked above WHO's disputed-area fills, which
 * a screenshot can hide.
 */
export async function probeLayers(page: Page) {
  const results: Record<string, unknown[]> = {}

  for (const probe of PROBES) {
    await page.evaluate(p => {
      ;(window as any).__map.jumpTo({ center: p.lngLat, zoom: p.zoom })
    }, probe)
    await settle(page, 10_000)

    results[probe.name] = await page.evaluate(p => {
      const map = (window as any).__map
      const point = map.project(p.lngLat)
      return map
        .queryRenderedFeatures(point)
        .slice(0, 12)
        .map((f: any) => ({
          layer: f.layer?.id ?? null,
          sourceLayer: f.sourceLayer ?? null,
          symbol: f.properties?._symbol ?? null,
          name: f.properties?.NAME ?? f.properties?.ISO_3_CODE ?? null
        }))
    }, probe)
  }

  await page.evaluate(view => {
    ;(window as any).__map.jumpTo({ center: view.center, zoom: view.zoom })
  }, WORLD_VIEW)
  await settle(page)

  return results
}
