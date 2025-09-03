#!/usr/bin/env node

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getMemoryUsage() {
  try {
    const res = await fetch('http://localhost:3000/api/memory-stats')
    const data = await res.json()
    return data.heapUsed
  } catch {
    return null
  }
}

async function forceGC() {
  try {
    await fetch('http://localhost:3000/api/force-gc')
  } catch {}
}

async function testMapEndpoint() {
  console.log('🎯 Targeted Map Endpoint Memory Leak Test')
  console.log('=========================================\n')

  // Wait for server
  console.log('Waiting for server to be ready...')
  await sleep(3000)

  // Test parameters
  const requestsPerBatch = 10
  const batches = 10
  const endpoint =
    'http://localhost:3000/api/map-data?indicatorId=4&subgroupId=35471'

  console.log(`Testing: ${endpoint}`)
  console.log(
    `Will make ${requestsPerBatch} requests × ${batches} batches = ${requestsPerBatch * batches} total requests\n`
  )

  const memoryHistory = []

  // Initial memory
  await forceGC()
  await sleep(1000)
  const initialMemory = await getMemoryUsage()
  if (!initialMemory) {
    console.log(
      '⚠️  Could not get memory stats. Make sure server has memory-stats endpoint.'
    )
    console.log(
      '   Add the endpoints from the find-leaks.js output to your server.'
    )
    return
  }

  console.log(
    `Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)} MB\n`
  )
  memoryHistory.push(initialMemory)

  // Run batches
  for (let batch = 1; batch <= batches; batch++) {
    process.stdout.write(`Batch ${batch}/${batches}: `)

    // Make concurrent requests
    const promises = []
    for (let i = 0; i < requestsPerBatch; i++) {
      promises.push(fetch(endpoint))
      process.stdout.write('.')
    }
    await Promise.all(promises)

    // Force GC and measure
    await forceGC()
    await sleep(500)
    const currentMemory = await getMemoryUsage()
    memoryHistory.push(currentMemory)

    const growth = currentMemory - initialMemory
    const totalGrowth = (growth / 1024 / 1024).toFixed(2)
    const currentMB = (currentMemory / 1024 / 1024).toFixed(2)

    console.log(` Memory: ${currentMB} MB (Growth: ${totalGrowth} MB)`)
  }

  console.log('\n=========================================')
  console.log('📊 Memory Growth Analysis')
  console.log('=========================================')

  // Calculate average growth per request
  const finalMemory = memoryHistory[memoryHistory.length - 1]
  const totalGrowth = finalMemory - initialMemory
  const totalRequests = requestsPerBatch * batches
  const growthPerRequest = totalGrowth / totalRequests

  console.log(`Initial Memory: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Final Memory:   ${(finalMemory / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total Growth:   ${(totalGrowth / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Growth per request: ${(growthPerRequest / 1024).toFixed(2)} KB`)

  // Check if it's a leak
  const leakThreshold = 0.5 * 1024 * 1024 // 0.5 MB per request is definitely a leak
  if (growthPerRequest > leakThreshold) {
    console.log('\n❌ MEMORY LEAK CONFIRMED!')
    console.log(
      '   The endpoint is leaking approximately',
      (growthPerRequest / 1024).toFixed(2),
      'KB per request'
    )
  } else if (growthPerRequest > 100 * 1024) {
    // 100 KB per request is suspicious
    console.log('\n⚠️  Possible memory leak detected')
    console.log('   The endpoint shows concerning memory growth')
  } else {
    console.log('\n✅ No significant memory leak detected')
  }

  // Show growth trend
  console.log('\n📈 Memory Growth Trend:')
  const maxBarWidth = 40
  const maxMemory = Math.max(...memoryHistory)
  memoryHistory.forEach((mem, i) => {
    const barLength = Math.round((mem / maxMemory) * maxBarWidth)
    const bar = '█'.repeat(barLength)
    const label = i === 0 ? 'Start' : `Batch ${i}`
    const mb = (mem / 1024 / 1024).toFixed(2)
    console.log(`  ${label.padEnd(8)} ${bar} ${mb} MB`)
  })
}

// Add the required endpoints if they don't exist
console.log('⚠️  Make sure your server has these endpoints:\n')
console.log('1. server/api/memory-stats.ts:')
console.log(`
export default defineEventHandler(() => {
  const mem = process.memoryUsage()
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    rss: mem.rss,
    external: mem.external
  }
})
`)
console.log('\n2. server/api/force-gc.ts:')
console.log(`
export default defineEventHandler(() => {
  if (global.gc) {
    global.gc()
    return { success: true }
  }
  return { success: false }
})
`)
console.log('\nThen run: NODE_OPTIONS="--expose-gc" yarn dev:nuxt')
console.log('\n=========================================\n')

// Run the test
testMapEndpoint().catch(console.error)
