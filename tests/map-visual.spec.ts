import { test, expect } from '@playwright/test'
import { CAPTURE_STATES, openMap, probeLayers, settle } from './helpers/map'

/**
 * Visual-parity gates for the WHO map refactor.
 *
 * Baselines are generated on unmodified code and committed. Re-run after each
 * change:
 *   - PR A (basemap from WHO's published style) is *expected* to differ, and
 *     only in disputed areas / lakes / borders. Nothing may disappear.
 *   - PR B (geometry from ArcGIS) must be visually inert.
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
