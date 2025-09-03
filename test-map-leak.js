#!/usr/bin/env node

import { request } from 'http'

async function makeRequest(port, path) {
  return new Promise((resolve, reject) => {
    const req = request({
      hostname: 'localhost',
      port,
      path,
      method: 'GET'
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.end()
  })
}

async function getMemoryUsage(port) {
  const data = await makeRequest(port, '/api/memory-stats')
  return JSON.parse(data)
}

async function forceGC(port) {
  await makeRequest(port, '/api/force-gc')
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testMapEndpoint() {
  console.log('🔍 Testing /api/map-data endpoint for memory leaks...\n')
  
  const port = 3001
  const endpoint = '/api/map-data?indicatorId=4&subgroupId=35471'
  
  // Initial memory
  const before = await getMemoryUsage(port)
  console.log(`Before: ${(before.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  
  // Make 50 requests
  console.log('Making 50 requests...')
  for (let i = 0; i < 50; i++) {
    await makeRequest(port, endpoint)
    process.stdout.write('.')
  }
  console.log('\n')
  
  // Force GC and wait
  await forceGC(port)
  await sleep(2000)
  
  // Final memory
  const after = await getMemoryUsage(port)
  console.log(`After:  ${(after.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  
  const growth = after.heapUsed - before.heapUsed
  const growthMB = growth / 1024 / 1024
  console.log(`Growth: ${growthMB.toFixed(2)} MB`)
  
  if (growthMB > 10) {
    console.log('❌ MEMORY LEAK STILL PRESENT!')
  } else if (growthMB > 5) {
    console.log('⚠️  Moderate memory growth detected')
  } else {
    console.log('✅ Memory leak appears to be fixed!')
  }
}

// Start production server
import { spawn } from 'child_process'

console.log('Starting production server...')
const server = spawn('node', [
  '--expose-gc',
  '.output/server/index.mjs'
], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NITRO_PORT: '3001'
  },
  stdio: ['inherit', 'pipe', 'pipe']
})

// Wait for server to start
await new Promise((resolve) => {
  server.stdout.on('data', (data) => {
    if (data.toString().includes('Listening')) {
      console.log('Server ready on port 3001\n')
      resolve()
    }
  })
})

// Run test
await testMapEndpoint()

// Cleanup
console.log('\nShutting down server...')
server.kill('SIGTERM')
process.exit(0)
