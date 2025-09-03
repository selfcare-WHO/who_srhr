#!/usr/bin/env node

import { spawn } from 'child_process'
import { performance } from 'perf_hooks'

const formatBytes = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let size = bytes

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

const monitorMemory = () => {
  const startTime = performance.now()
  let peakMemory = 0
  let samples = []

  console.log('🔍 Starting memory monitoring for production build...\n')
  console.log('Starting server with Node.js memory tracking...')
  console.log('Access the app at: http://localhost:3000\n')
  console.log('Press Ctrl+C to stop monitoring and see the report.\n')
  console.log('-'.repeat(80))

  const serverProcess = spawn(
    'node',
    [
      '--expose-gc',
      '--max-old-space-size=512',
      '--trace-warnings',
      '.output/server/index.mjs'
    ],
    {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NITRO_PORT: '3000'
      },
      stdio: ['inherit', 'pipe', 'pipe']
    }
  )

  const interval = setInterval(() => {
    if (serverProcess.pid) {
      try {
        const pidUsage = process.memoryUsage()
        const heapUsed = pidUsage.heapUsed
        const heapTotal = pidUsage.heapTotal
        const rss = pidUsage.rss
        const external = pidUsage.external

        const currentMemory = {
          timestamp: Date.now(),
          heapUsed,
          heapTotal,
          rss,
          external,
          heapPercent: ((heapUsed / heapTotal) * 100).toFixed(1)
        }

        samples.push(currentMemory)

        if (rss > peakMemory) {
          peakMemory = rss
        }

        const runtime = formatTime(performance.now() - startTime)
        process.stdout.write(
          `\r⏱️  ${runtime} | 🧠 Heap: ${formatBytes(heapUsed)}/${formatBytes(
            heapTotal
          )} (${currentMemory.heapPercent}%) | RSS: ${formatBytes(
            rss
          )} | Peak: ${formatBytes(peakMemory)}`
        )
      } catch (error) {
        console.error('Error getting memory usage:', error)
      }
    }
  }, 1000)

  serverProcess.stdout.on('data', (data) => {
    console.log(`\n📦 Server: ${data}`)
  })

  serverProcess.stderr.on('data', (data) => {
    console.error(`\n⚠️  Server Error: ${data}`)
  })

  const cleanup = () => {
    clearInterval(interval)
    serverProcess.kill('SIGTERM')

    console.log('\n\n' + '='.repeat(80))
    console.log('📊 MEMORY MONITORING REPORT')
    console.log('='.repeat(80))

    if (samples.length > 0) {
      const avgHeap =
        samples.reduce((sum, s) => sum + s.heapUsed, 0) / samples.length
      const avgRSS =
        samples.reduce((sum, s) => sum + s.rss, 0) / samples.length
      const maxHeap = Math.max(...samples.map((s) => s.heapUsed))
      const minHeap = Math.min(...samples.map((s) => s.heapUsed))

      console.log('\n📈 Statistics:')
      console.log(`  • Samples collected: ${samples.length}`)
      console.log(`  • Runtime: ${formatTime(performance.now() - startTime)}`)
      console.log('\n💾 Memory Usage:')
      console.log(`  • Peak RSS Memory: ${formatBytes(peakMemory)}`)
      console.log(`  • Average Heap: ${formatBytes(avgHeap)}`)
      console.log(`  • Average RSS: ${formatBytes(avgRSS)}`)
      console.log(`  • Max Heap: ${formatBytes(maxHeap)}`)
      console.log(`  • Min Heap: ${formatBytes(minHeap)}`)

      const memoryGrowth = samples[samples.length - 1].heapUsed - samples[0].heapUsed
      if (memoryGrowth > 0) {
        console.log(
          `\n⚠️  Memory Growth Detected: +${formatBytes(
            memoryGrowth
          )} during monitoring`
        )
        console.log(
          '    This might indicate a memory leak. Check for unfreed resources.'
        )
      }

      if (peakMemory > 512 * 1024 * 1024) {
        console.log('\n🚨 WARNING: Peak memory exceeded 512MB!')
        console.log('    Consider optimizing your application or upgrading your instance.')
      }
    }

    console.log('\n' + '='.repeat(80))
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

monitorMemory()