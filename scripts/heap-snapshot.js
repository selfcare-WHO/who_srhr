#!/usr/bin/env node

import { spawn } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import v8 from 'v8'

console.log('🔍 Starting server with heap snapshot capability...\n')
console.log('Instructions:')
console.log('1. Access your app at http://localhost:3000')
console.log('2. Navigate through the app to simulate normal usage')
console.log('3. Press "s" + Enter to take a heap snapshot')
console.log('4. Press Ctrl+C to exit\n')
console.log('-'.repeat(80))

const snapshotsDir = join(process.cwd(), 'memory-snapshots')
mkdirSync(snapshotsDir, { recursive: true })

let snapshotCount = 0

const serverProcess = spawn(
  'node',
  [
    '--expose-gc',
    '--inspect=9229',
    '.output/server/index.mjs'
  ],
  {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NITRO_PORT: '3000'
    },
    stdio: ['pipe', 'inherit', 'inherit']
  }
)

console.log('✅ Server started with inspector on port 9229')
console.log('   You can also connect Chrome DevTools to chrome://inspect\n')

process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', (key) => {
  if (key === '\u0003') {
    console.log('\nShutting down...')
    serverProcess.kill('SIGTERM')
    process.exit()
  } else if (key === 's' || key === 'S') {
    snapshotCount++
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `heap-snapshot-${timestamp}.heapsnapshot`
    const filepath = join(snapshotsDir, filename)

    console.log(`\n📸 Taking heap snapshot #${snapshotCount}...`)

    try {
      if (global.gc) {
        global.gc()
        console.log('   Garbage collection forced before snapshot')
      }

      const snapshot = v8.writeHeapSnapshot()
      writeFileSync(filepath, snapshot)
      console.log(`   ✅ Snapshot saved to: ${filepath}`)
      console.log('   📊 Current memory usage:')
      const mem = process.memoryUsage()
      console.log(`      Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`)
      console.log(`      Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`)
      console.log(`      RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`)
      console.log('\n   To analyze:')
      console.log('   1. Open Chrome DevTools')
      console.log('   2. Go to Memory tab')
      console.log('   3. Click "Load" and select the .heapsnapshot file\n')
    } catch (error) {
      console.error('   ❌ Error taking snapshot:', error.message)
    }
  }
})

serverProcess.on('exit', () => {
  console.log('\nServer stopped.')
  if (snapshotCount > 0) {
    console.log(`\n📁 ${snapshotCount} heap snapshot(s) saved in: ${snapshotsDir}`)
  }
  process.exit()
})