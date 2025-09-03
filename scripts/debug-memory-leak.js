#!/usr/bin/env node

import { spawn } from 'child_process'
import open from 'open'

console.log('🔍 Starting Memory Leak Debugging Session')
console.log('=' .repeat(60))
console.log('\nThis will start your app with Chrome DevTools debugging enabled.')
console.log('Follow these steps to find memory leaks:\n')

console.log('1. The server will start with --inspect flag')
console.log('2. Chrome DevTools will open automatically')
console.log('3. Go to the Memory tab in DevTools')
console.log('4. Take heap snapshots before and after actions')
console.log('5. Compare snapshots to find leaks\n')

console.log('Starting server with inspector...\n')

const serverProcess = spawn(
  'node',
  [
    '--inspect',
    '--expose-gc',
    '--max-old-space-size=256',
    '--trace-warnings',
    '--trace-deprecation',
    '.output/server/index.mjs'
  ],
  {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NITRO_PORT: '3000',
      NODE_OPTIONS: '--expose-gc'
    },
    stdio: ['inherit', 'pipe', 'pipe']
  }
)

serverProcess.stdout.on('data', (data) => {
  const output = data.toString()
  console.log(`📦 ${output}`)
  
  if (output.includes('Debugger listening on ws://')) {
    console.log('\n✅ Inspector is ready!')
    console.log('Opening Chrome DevTools...\n')
    
    // Open Chrome DevTools
    setTimeout(() => {
      open('chrome://inspect').catch(() => {
        console.log('⚠️  Could not auto-open Chrome. Please open manually:')
        console.log('   1. Open Chrome')
        console.log('   2. Navigate to: chrome://inspect')
        console.log('   3. Click "inspect" under Remote Target')
      })
    }, 2000)
    
    console.log('\n📝 MEMORY LEAK DETECTION STEPS:')
    console.log('=' .repeat(60))
    console.log('\n1. In Chrome DevTools, go to the Memory tab')
    console.log('\n2. Take initial heap snapshot:')
    console.log('   - Click "Take snapshot"')
    console.log('   - Name it "Initial"')
    console.log('\n3. Perform actions in your app:')
    console.log('   - Navigate to: http://localhost:3000')
    console.log('   - Click through different pages')
    console.log('   - Perform data-heavy operations')
    console.log('\n4. Force garbage collection:')
    console.log('   - Click the trash can icon in DevTools')
    console.log('   - Or run gc() in Console')
    console.log('\n5. Take second snapshot:')
    console.log('   - Click "Take snapshot" again')
    console.log('   - Name it "After Actions"')
    console.log('\n6. Compare snapshots:')
    console.log('   - Select second snapshot')
    console.log('   - Change view from "Summary" to "Comparison"')
    console.log('   - Sort by "Size Delta" to see growing objects')
    console.log('\n7. Look for memory leaks:')
    console.log('   - Objects with high "# Delta" (count increase)')
    console.log('   - Large "Size Delta" values')
    console.log('   - Detached DOM nodes')
    console.log('   - Event listeners not cleaned up')
    console.log('\n' + '=' .repeat(60))
  }
})

serverProcess.stderr.on('data', (data) => {
  console.error(`⚠️  ${data}`)
})

process.on('SIGINT', () => {
  console.log('\n\nShutting down debugging session...')
  serverProcess.kill('SIGTERM')
  process.exit(0)
})

// Keep process alive
process.stdin.resume()