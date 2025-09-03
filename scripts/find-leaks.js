#!/usr/bin/env node

/**
 * Advanced Memory Leak Detection Script
 * This script helps identify specific types of memory leaks
 */

import { request } from 'http'
import { spawn } from 'child_process'

const scenarios = [
  {
    name: 'API Endpoint Memory Test',
    description: 'Tests each API endpoint for memory leaks',
    test: async (port) => {
      const endpoints = [
        '/api/filter-options',
        '/api/chart-data?country=6598&indicator=4',
        '/api/map-data?indicatorId=4&subgroupId=35471',
        '/api/table-data?page=1&filters=' + encodeURIComponent(JSON.stringify({ country: [6598], indicator: ['4'] }))
      ]
      
      console.log('Testing API endpoints...')
      
      for (const endpoint of endpoints) {
        console.log(`\n  Testing: ${endpoint}`)
        
        // Take initial memory
        const before = await getMemoryUsage(port)
        console.log(`    Before: ${(before.heapUsed / 1024 / 1024).toFixed(2)} MB`)
        
        // Make 50 requests
        for (let i = 0; i < 50; i++) {
          await makeRequest(port, endpoint)
          process.stdout.write('.')
        }
        console.log('')
        
        // Force GC and wait
        await forceGC(port)
        await sleep(2000)
        
        // Take final memory
        const after = await getMemoryUsage(port)
        console.log(`    After:  ${(after.heapUsed / 1024 / 1024).toFixed(2)} MB`)
        
        const growth = after.heapUsed - before.heapUsed
        console.log(`    Growth: ${(growth / 1024 / 1024).toFixed(2)} MB`)
        
        if (growth > 5 * 1024 * 1024) { // 5MB
          console.log(`    ⚠️  LEAK DETECTED in ${endpoint}!`)
        } else {
          console.log(`    ✅ No leak detected`)
        }
      }
    }
  },
  {
    name: 'Database Connection Test',
    description: 'Tests for database connection leaks',
    test: async (port) => {
      console.log('Testing database connections...')
      
      const before = await getMemoryUsage(port)
      console.log(`  Before: ${(before.heapUsed / 1024 / 1024).toFixed(2)} MB`)
      
      // Spam database-heavy endpoint
      console.log('  Making 100 concurrent requests...')
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(makeRequest(port, '/api/filter-options'))
      }
      await Promise.all(promises)
      
      await forceGC(port)
      await sleep(3000)
      
      const after = await getMemoryUsage(port)
      console.log(`  After:  ${(after.heapUsed / 1024 / 1024).toFixed(2)} MB`)
      
      const growth = after.heapUsed - before.heapUsed
      console.log(`  Growth: ${(growth / 1024 / 1024).toFixed(2)} MB`)
      
      if (growth > 10 * 1024 * 1024) { // 10MB
        console.log('  ⚠️  LEAK DETECTED - Database connections not being released!')
      } else {
        console.log('  ✅ No connection leak detected')
      }
    }
  },
  {
    name: 'Large Data Processing Test',
    description: 'Tests memory cleanup after processing large datasets',
    test: async (port) => {
      console.log('Testing large data processing...')
      
      const before = await getMemoryUsage(port)
      console.log(`  Before: ${(before.heapUsed / 1024 / 1024).toFixed(2)} MB`)
      
      // Request large datasets
      console.log('  Requesting large datasets...')
      for (let i = 0; i < 10; i++) {
        await makeRequest(port, '/api/table-data?page=1&size=100&filters=' + 
          encodeURIComponent(JSON.stringify({ country: [], indicator: [] })))
        process.stdout.write('.')
      }
      console.log('')
      
      await forceGC(port)
      await sleep(3000)
      
      const after = await getMemoryUsage(port)
      console.log(`  After:  ${(after.heapUsed / 1024 / 1024).toFixed(2)} MB`)
      
      const growth = after.heapUsed - before.heapUsed
      console.log(`  Growth: ${(growth / 1024 / 1024).toFixed(2)} MB`)
      
      if (growth > 20 * 1024 * 1024) { // 20MB
        console.log('  ⚠️  LEAK DETECTED - Large objects not being released!')
      } else {
        console.log('  ✅ No large object leak detected')
      }
    }
  }
]

// Helper functions
function makeRequest(port, path) {
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
    req.setTimeout(5000, () => {
      req.destroy()
      resolve(null)
    })
    req.end()
  })
}

async function getMemoryUsage(port) {
  const data = await makeRequest(port, '/api/memory-stats')
  try {
    return JSON.parse(data)
  } catch {
    // Fallback to process memory
    return process.memoryUsage()
  }
}

async function forceGC(port) {
  try {
    await makeRequest(port, '/api/force-gc')
  } catch {
    if (global.gc) global.gc()
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Main execution
async function runTests() {
  console.log('🔍 Memory Leak Detection Tool')
  console.log('=' .repeat(60))
  console.log('\nStarting production server with debugging...\n')
  
  const serverProcess = spawn('node', [
    '--expose-gc',
    '--inspect',
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
    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('Listening')) {
        console.log('✅ Server ready on port 3001\n')
        resolve()
      }
    })
  })
  
  // Run each test scenario
  for (const scenario of scenarios) {
    console.log('\n' + '=' .repeat(60))
    console.log(`🧪 ${scenario.name}`)
    console.log(`   ${scenario.description}`)
    console.log('=' .repeat(60) + '\n')
    
    await scenario.test(3001)
    await sleep(2000)
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 LEAK DETECTION SUMMARY')
  console.log('=' .repeat(60))
  console.log('\nIf leaks were detected:')
  console.log('1. Use yarn memory:debug to inspect with Chrome DevTools')
  console.log('2. Take heap snapshots before/after the leaking operation')
  console.log('3. Look for objects that are not being garbage collected')
  console.log('4. Common causes:')
  console.log('   - Event listeners not removed')
  console.log('   - Closures holding references')
  console.log('   - Global variables')
  console.log('   - Unclosed database connections')
  console.log('   - Large objects in memory')
  
  console.log('\nShutting down server...')
  serverProcess.kill('SIGTERM')
  process.exit(0)
}

// Add memory stats endpoint to your app first
console.log('\n⚠️  Note: For best results, add this to your server/api/memory-stats.ts:')
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

console.log('\nAnd this to server/api/force-gc.ts:')
console.log(`
export default defineEventHandler(() => {
  if (global.gc) {
    global.gc()
    return { success: true }
  }
  return { success: false }
})
`)

console.log('\nStarting tests in 3 seconds...\n')
setTimeout(runTests, 3000)