import { test, expect } from '@playwright/test'
import {
  CAPTURE_STATES,
  disputedFeaturesInView,
  openMap,
  probeLayers,
  settle
} from './helpers/map'

/**
 * Gates for the WHO map's SOP compliance and for the geometry it draws from.
 *
 * The basemap and the choropleth now share one GeoJSON source, and WHO's
 * disputed cartography comes from their live feature services. That means these
 * tests assert two different things:
 *   - compliance, by naming the feature WHO's map SOP review asked for, so a
 *     failure says which item broke rather than dumping a screenshot diff;
 *   - that nothing else moved, via the screenshots and the layer-order probe.
 *
 * Update baselines deliberately with --update-snapshots once a diff has been
 * reviewed and accepted.
 */

test.describe('map view', () => {
  for (const state of CAPTURE_STATES) {
    test(`${state.name}: renders world view`, async ({ page }) => {
      await openMap(page, state.query)

      // Screenshot the map container only — page chrome and the legend's DOM
      // text are not what this gate is about.
      const container = page.locator('.map-container')
      await expect(container).toHaveScreenshot(`${state.name}-world.png`)
    })
  }

  test('layer stack probe', async ({ page }) => {
    // One representative state is enough: the basemap layer stack does not
    // vary by indicator, only the choropleth paint does.
    await openMap(page, CAPTURE_STATES[0].query)
    const probes = await probeLayers(page)

    expect(JSON.stringify(probes, null, 2)).toMatchSnapshot('layer-probes.json')
  })

  /**
   * One row per item WHO's map SOP review raised. Named by feature so a failure
   * reads as "Ilemi Triangle stopped drawing", not "some pixels changed".
   */
  test('WHO SOP disputed cartography renders', async ({ page }) => {
    const cases: Array<{
      item: string
      lngLat: [number, number]
      zoom: number
      layer: string
      name: string
    }> = [
      {
        item: '2.2.2 Kosovo',
        lngLat: [20.9, 42.6],
        zoom: 6,
        layer: 'disputed-borders-kosovo',
        name: 'Kosovo'
      },
      {
        item: '2.2.3 Sudan/Egypt solid line',
        lngLat: [35.0, 22.2],
        zoom: 5,
        layer: 'disputed-borders-solid',
        name: 'Halayib Triangle (EGY Claim)'
      },
      {
        item: '2.2.3 Sudan/Egypt dashed line',
        lngLat: [35.0, 22.2],
        zoom: 5,
        layer: 'disputed-borders-dashed',
        name: 'Halayib Triangle (SDN Claim)'
      },
      {
        item: '2.2.4 South Sudan/Kenya',
        lngLat: [34.8, 4.9],
        zoom: 6,
        layer: 'disputed-borders-dotted',
        name: 'Ilemi Triangle'
      },
      {
        item: '2.2.7 Kashmir line of control',
        lngLat: [76.0, 34.0],
        zoom: 5,
        layer: 'disputed-borders-dotted',
        name: 'J&K Line of Control'
      },
      {
        item: '2.2.8 Arunachal Pradesh',
        lngLat: [94.0, 28.0],
        zoom: 5,
        layer: 'disputed-borders-solid',
        name: 'Arunachal Pradesh'
      },
      {
        item: '2.3 great lakes',
        lngLat: [33.0, -1.0],
        zoom: 5,
        layer: 'disputed-areas-lakes',
        name: 'Lake Victoria'
      },
      {
        item: '2.4 not applicable',
        lngLat: [-13.0, 24.5],
        zoom: 4,
        layer: 'disputed-areas-not-applicable',
        name: 'Western Sahara'
      }
    ]

    await openMap(page, CAPTURE_STATES[0].query)

    for (const c of cases) {
      const rendered = await disputedFeaturesInView(page, c.lngLat, c.zoom)
      expect(rendered[c.layer] ?? [], `${c.item}: ${c.name}`).toContain(c.name)
    }
  })

  test('SOP 2.2.7 Aksai Chin renders with WHO hatch', async ({ page }) => {
    await openMap(page, CAPTURE_STATES[0].query)

    const rendered = await disputedFeaturesInView(page, [79.5, 35.2], 6)
    const tier = Object.keys(rendered).find(id =>
      id.startsWith('disputed-areas-aksai-chin')
    )

    expect(tier, 'no Aksai Chin fill layer drew').toBeTruthy()
    expect(rendered[tier!]).toContain('Aksai Chin')

    // The fill only *looks* right if WHO's sprite resolved; a missing pattern
    // still answers queryRenderedFeatures but paints nothing.
    const hasPattern = await page.evaluate(
      id => (window as any).__map.hasImage(id),
      `DISPUTED BORDERS AND AREAS/DISPUTED_AREAS/Aksai Chin_2`
    )
    expect(hasPattern, "WHO's Aksai Chin sprite image did not load").toBe(true)
  })

  test('SOP 2.2.6 Golan is not drawn', async ({ page }) => {
    // WHO's tileset bakes Golan into the same symbol class as the territories
    // that must stay, so it could not be filtered out. Their feature services
    // simply do not serve it — this asserts we are still sourced from those.
    await openMap(page, CAPTURE_STATES[0].query)

    const rendered = await disputedFeaturesInView(page, [35.75, 33.1], 6)
    const names = Object.values(rendered).flat()

    expect(names, 'Golan is back on the map').not.toContain('Golan')
  })

  test('SOP attribution and legend are present', async ({ page }) => {
    await openMap(page, CAPTURE_STATES[0].query)

    // 2.4 — the legend entry, in WHO's disputed-area colour.
    const notApplicable = page.locator('.map-view-legend', {
      hasText: 'Not applicable'
    })
    await expect(notApplicable).toBeVisible()

    // 2.5 — the disclaimer, verbatim.
    await expect(page.locator('.map-disclaimer')).toContainText(
      'do not imply the expression of any opinion whatsoever on the part of WHO'
    )
    await expect(page.locator('.map-disclaimer')).toContainText(
      'Dotted and dashed lines on maps represent approximate border lines for which there may not yet be full agreement.'
    )

    // WHO logo and copyright.
    await expect(page.locator('.map-disclaimer img')).toBeVisible()
    await expect(page.locator('.map-disclaimer')).toContainText('© WHO')

    // Optional in the SOP, but Jon asked how hard it would be.
    await expect(page.locator('.mapboxgl-ctrl-scale').first()).toBeVisible()
  })

  test('philippines is rendered and hoverable', async ({ page }) => {
    // Guards the upstream WHO defect: Detailed_Boundary_ADM0 returns empty
    // geometry for PHL (OBJECTID 158). If the fallback regresses, the country
    // silently vanishes from the choropleth with no error.
    await openMap(page, CAPTURE_STATES[0].query)

    const found = await page.evaluate(() => {
      const map = (window as any).__map
      const src = map.getSource('who-world-features')
      const data = src?._data
      const phl = data?.features?.find(
        (f: any) => f.properties?.ISO_3_CODE === 'PHL'
      )
      const countVertices = (g: any): number => {
        if (!g) return 0
        const walk = (x: any): number =>
          !Array.isArray(x)
            ? 0
            : typeof x[0] === 'number'
              ? 1
              : x.reduce((n: number, i: any) => n + walk(i), 0)
        return walk(g.coordinates)
      }
      return {
        present: !!phl,
        hasId: phl ? typeof phl.id === 'number' && phl.id > 0 : false,
        vertices: countVertices(phl?.geometry),
        whoStatus: phl?.properties?.WHO_STATUS ?? null
      }
    })

    expect(found.present, 'PHL feature missing from source').toBe(true)
    expect(found.vertices, 'PHL geometry is empty').toBeGreaterThan(100)
    expect(found.whoStatus).toBe('Member state')
    expect(found.hasId, 'PHL has no top-level id — hover would break').toBe(
      true
    )
  })

  test('every feature has a top-level id (hover depends on it)', async ({
    page
  }) => {
    await openMap(page, CAPTURE_STATES[0].query)
    await settle(page)

    const stats = await page.evaluate(() => {
      const map = (window as any).__map
      const features =
        map.getSource('who-world-features')?._data?.features ?? []
      return {
        total: features.length,
        withId: features.filter(
          (f: any) => typeof f.id === 'number' && f.id > 0
        ).length,
        memberStates: features.filter(
          (f: any) => f.properties?.WHO_STATUS === 'Member state'
        ).length,
        emptyGeometry: features.filter((f: any) => {
          const c = f.geometry?.coordinates
          return !c || c.length === 0
        }).length
      }
    })

    expect(stats.total).toBe(241)
    expect(stats.withId).toBe(stats.total)
    expect(stats.memberStates).toBe(194)
    expect(stats.emptyGeometry).toBe(0)
  })
})
