import fetch from 'node-fetch'

async function testMinimalLeak() {
  console.log('Testing minimal leak - just the Prisma query...')
  
  const url = 'http://localhost:3000/api/map-data?indicatorId=4&subgroupId=35471'
  
  // Initial memory
  if (global.gc) global.gc()
  const initialMem = process.memoryUsage().heapUsed / 1024 / 1024
  console.log(`Initial memory: ${initialMem.toFixed(2)} MB`)
  
  // Make 100 requests
  for (let i = 0; i < 100; i++) {
    await fetch(url)
    if (i % 10 === 0) process.stdout.write('.')
  }
  console.log()
  
  // Force GC and check memory
  if (global.gc) global.gc()
  await new Promise(resolve => setTimeout(resolve, 1000))
  if (global.gc) global.gc()
  
  const finalMem = process.memoryUsage().heapUsed / 1024 / 1024
  const growth = finalMem - initialMem
  const perRequest = (growth * 1024) / 100
  
  console.log(`Final memory: ${finalMem.toFixed(2)} MB`)
  console.log(`Growth: ${growth.toFixed(2)} MB`)
  console.log(`Per request: ${perRequest.toFixed(2)} KB`)
  
  if (growth > 50) {
    console.log('❌ LEAK DETECTED')
  } else {
    console.log('✅ No significant leak')
  }
}

testMinimalLeak().catch(console.error)