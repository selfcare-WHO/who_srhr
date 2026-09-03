import { defineConfig } from '@playwright/test'

/**
 * Visual-parity harness for the map view.
 *
 * The map is WebGL, so runs are pinned to a fixed viewport and device scale
 * factor — a different DPR silently rescales every screenshot and makes the
 * pixel diff meaningless.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  reporter: [['list']],
  expect: {
    toHaveScreenshot: {
      // Mapbox label placement and antialiasing jitter slightly between runs.
      maxDiffPixelRatio: 0.002
    }
  },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    launchOptions: {
      // Headless Chromium has no GPU; SwiftShader provides the WebGL context
      // mapbox-gl needs.
      args: ['--enable-unsafe-swiftshader', '--disable-lcd-text']
    }
  },
  webServer: {
    command: 'yarn dev:nuxt',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180_000
  }
})
