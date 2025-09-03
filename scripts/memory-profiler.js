#!/usr/bin/env node

import { spawn } from 'child_process'
import v8 from 'v8'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const PROFILE_DURATION = 0 // 0 ms for unlimited duration
const SNAPSHOT_INTERVAL = 5000 // 5 seconds

console.log('🔬 Memory Profiler for Production Build')
console.log('='.repeat(60))
console.log('\nThis tool will:')
console.log('1. Start your production server')
console.log('2. Take heap snapshots every 5 seconds')
console.log('3. Track memory growth over time')
console.log('4. Generate a report after 30 seconds\n')

const resultsDir = join(process.cwd(), 'memory-profiles')
mkdirSync(resultsDir, { recursive: true })

const memoryData = []
let snapshotCount = 0

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function takeMemorySnapshot() {
  const mem = process.memoryUsage()
  const heapStats = v8.getHeapStatistics()

  const snapshot = {
    timestamp: Date.now(),
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    rss: mem.rss,
    external: mem.external,
    arrayBuffers: mem.arrayBuffers,
    heapUsedPercent: ((mem.heapUsed / mem.heapTotal) * 100).toFixed(1),
    totalHeapSize: heapStats.total_heap_size,
    totalHeapSizeExecutable: heapStats.total_heap_size_executable,
    totalPhysicalSize: heapStats.total_physical_size,
    totalAvailableSize: heapStats.total_available_size,
    usedHeapSize: heapStats.used_heap_size,
    heapSizeLimit: heapStats.heap_size_limit,
    mallocedMemory: heapStats.malloced_memory,
    peakMallocedMemory: heapStats.peak_malloced_memory,
    doesZapGarbage: heapStats.does_zap_garbage,
    numberOfNativeContexts: heapStats.number_of_native_contexts,
    numberOfDetachedContexts: heapStats.number_of_detached_contexts
  }

  memoryData.push(snapshot)
  snapshotCount++

  console.log(`📸 Snapshot #${snapshotCount}:`)
  console.log(
    `   Heap: ${formatBytes(snapshot.heapUsed)} / ${formatBytes(snapshot.heapTotal)} (${snapshot.heapUsedPercent}%)`
  )
  console.log(`   RSS: ${formatBytes(snapshot.rss)}`)
  console.log(`   Native contexts: ${snapshot.numberOfNativeContexts}`)
  console.log(`   Detached contexts: ${snapshot.numberOfDetachedContexts}`)

  // Check for potential leaks
  if (snapshot.numberOfDetachedContexts > 5) {
    console.log(
      '   ⚠️  High number of detached contexts - possible memory leak!'
    )
  }

  if (memoryData.length > 1) {
    const prevSnapshot = memoryData[memoryData.length - 2]
    const heapGrowth = snapshot.heapUsed - prevSnapshot.heapUsed

    if (heapGrowth > 0) {
      console.log(`   📈 Heap grew by ${formatBytes(heapGrowth)}`)
    }
  }

  console.log('')
}

console.log('Starting server...\n')

const serverProcess = spawn(
  'node',
  [
    '--expose-gc',
    '--trace-gc',
    '--max-old-space-size=256',
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

let serverReady = false

serverProcess.stdout.on('data', data => {
  const output = data.toString()
  if (!serverReady && output.includes('Listening')) {
    serverReady = true
    console.log('✅ Server is ready!\n')
    console.log('Starting memory profiling...\n')

    // Start profiling
    const interval = setInterval(takeMemorySnapshot, SNAPSHOT_INTERVAL)

    // Run load test in parallel
    setTimeout(() => {
      console.log('🚀 Starting automated load generation...\n')

      const loadProcess = spawn('node', ['scripts/load-test.js'], {
        stdio: ['inherit', 'ignore', 'ignore']
      })

      loadProcess.on('exit', () => {
        console.log('Load test completed.\n')
      })
    }, 2000)

    // Stop after duration
    if (PROFILE_DURATION) {
      setTimeout(() => {
        clearInterval(interval)
        generateReport()
      }, PROFILE_DURATION)
    }
  }
})

serverProcess.stderr.on('data', data => {
  // Ignore GC traces
  const output = data.toString()
  if (!output.includes('[GC]') && !output.includes('Scavenge')) {
    console.error(`⚠️  ${output}`)
  }
})

function generateReport() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 MEMORY PROFILING REPORT')
  console.log('='.repeat(60))

  if (memoryData.length < 2) {
    console.log('Not enough data collected.')
    process.exit(1)
  }

  const first = memoryData[0]
  const last = memoryData[memoryData.length - 1]

  console.log('\n📈 Memory Growth:')
  console.log(`   Initial Heap: ${formatBytes(first.heapUsed)}`)
  console.log(`   Final Heap: ${formatBytes(last.heapUsed)}`)
  console.log(`   Growth: ${formatBytes(last.heapUsed - first.heapUsed)}`)
  console.log(
    `   Growth Rate: ${(((last.heapUsed - first.heapUsed) / first.heapUsed) * 100).toFixed(1)}%`
  )

  console.log('\n📊 Statistics:')
  const avgHeap =
    memoryData.reduce((sum, d) => sum + d.heapUsed, 0) / memoryData.length
  const maxHeap = Math.max(...memoryData.map(d => d.heapUsed))
  const minHeap = Math.min(...memoryData.map(d => d.heapUsed))

  console.log(`   Average Heap: ${formatBytes(avgHeap)}`)
  console.log(`   Max Heap: ${formatBytes(maxHeap)}`)
  console.log(`   Min Heap: ${formatBytes(minHeap)}`)

  console.log('\n🔍 Leak Indicators:')
  const contextGrowth =
    last.numberOfDetachedContexts - first.numberOfDetachedContexts
  console.log(`   Detached Contexts Growth: ${contextGrowth}`)

  if (contextGrowth > 0) {
    console.log('   ⚠️  Detached contexts are growing - likely memory leak!')
  }

  const heapGrowthRate =
    ((last.heapUsed - first.heapUsed) / PROFILE_DURATION) * 1000 * 60 // per minute
  console.log(`   Heap Growth Rate: ${formatBytes(heapGrowthRate)}/minute`)

  if (heapGrowthRate > 1024 * 1024) {
    // 1MB per minute
    console.log('   ⚠️  High memory growth rate detected!')
  }

  // Save detailed data
  const reportPath = join(resultsDir, `memory-profile-${Date.now()}.json`)
  writeFileSync(reportPath, JSON.stringify(memoryData, null, 2))
  console.log(`\n📁 Detailed data saved to: ${reportPath}`)

  console.log('\n🎯 Recommendations:')
  if (heapGrowthRate > 1024 * 1024) {
    console.log(
      '   • Memory is growing too fast - investigate with heap snapshots'
    )
    console.log('   • Run: yarn memory:snapshot')
  }
  if (contextGrowth > 0) {
    console.log(
      '   • Detached contexts indicate uncleaned event listeners or closures'
    )
    console.log('   • Check for removeEventListener calls')
  }
  if (last.external > 50 * 1024 * 1024) {
    console.log(
      '   • High external memory usage - check for Buffer allocations'
    )
  }

  console.log('\n' + '='.repeat(60))

  serverProcess.kill('SIGTERM')
  process.exit(0)
}

process.on('SIGINT', () => {
  console.log('\nStopping profiler...')
  serverProcess.kill('SIGTERM')
  process.exit(0)
})
