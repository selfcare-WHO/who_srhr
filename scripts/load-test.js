#!/usr/bin/env node

import { request } from 'http'

const HOST = 'localhost'
const PORT = 3000
const CONCURRENT_REQUESTS = 10
const TOTAL_REQUESTS = 100
const REQUEST_INTERVAL = 100

const endpoints = [
  '/',
  '/api/filter-options',
  '/api/chart-data?country=6598&country=6602&indicator=4&indicator=5',
  '/api/map-data?indicatorId=4&subgroupId=35471',
  '/api/table-data?page=1&size=10&filters=' + encodeURIComponent(JSON.stringify({ country: [6598, 6602], indicator: ['4', '5'], dataType: 'all' }))
]

let completedRequests = 0
let failedRequests = 0
let totalResponseTime = 0
const responseTimes = []

const makeRequest = (path) => {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const req = request(
      {
        hostname: HOST,
        port: PORT,
        path: path,
        method: 'GET',
        headers: {
          'User-Agent': 'Memory-Load-Test/1.0'
        }
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          const responseTime = Date.now() - startTime
          totalResponseTime += responseTime
          responseTimes.push(responseTime)
          completedRequests++

          if (res.statusCode !== 200) {
            failedRequests++
            console.log(`❌ ${path} - Status: ${res.statusCode} (${responseTime}ms)`)
          } else {
            process.stdout.write(
              `\r✅ Completed: ${completedRequests}/${TOTAL_REQUESTS} | Failed: ${failedRequests} | Avg: ${(
                totalResponseTime / completedRequests
              ).toFixed(0)}ms`
            )
          }
          resolve()
        })
      }
    )

    req.on('error', (error) => {
      failedRequests++
      completedRequests++
      console.log(`\n❌ Request failed: ${error.message}`)
      resolve()
    })

    req.setTimeout(30000, () => {
      req.destroy()
      failedRequests++
      completedRequests++
      console.log(`\n⏱️  Request timeout: ${path}`)
      resolve()
    })

    req.end()
  })
}

const runLoadTest = async () => {
  console.log('🚀 Starting Load Test for Memory Monitoring')
  console.log('=' .repeat(60))
  console.log(`Target: http://${HOST}:${PORT}`)
  console.log(`Total Requests: ${TOTAL_REQUESTS}`)
  console.log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`)
  console.log(`Endpoints: ${endpoints.length}`)
  console.log('=' .repeat(60))
  console.log('\nMake sure the server is running with memory monitoring!')
  console.log('Run in another terminal: yarn memory:monitor\n')
  console.log('Starting in 3 seconds...\n')

  await new Promise((resolve) => setTimeout(resolve, 3000))

  const startTime = Date.now()
  const queue = []

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const endpoint = endpoints[i % endpoints.length]
    queue.push(makeRequest(endpoint))

    if (queue.length >= CONCURRENT_REQUESTS) {
      await Promise.race(queue)
      queue.splice(
        queue.findIndex((p) => p === undefined),
        1
      )
    }

    if (i < TOTAL_REQUESTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, REQUEST_INTERVAL))
    }
  }

  await Promise.all(queue)

  const totalTime = Date.now() - startTime
  console.log('\n\n' + '=' .repeat(60))
  console.log('📊 LOAD TEST RESULTS')
  console.log('=' .repeat(60))
  console.log(`\n✅ Completed Requests: ${completedRequests - failedRequests}`)
  console.log(`❌ Failed Requests: ${failedRequests}`)
  console.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(2)}s`)
  console.log(`📈 Requests/second: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)}`)

  if (responseTimes.length > 0) {
    const sorted = responseTimes.sort((a, b) => a - b)
    console.log(`\n📊 Response Time Statistics:`)
    console.log(`   • Average: ${(totalResponseTime / completedRequests).toFixed(0)}ms`)
    console.log(`   • Min: ${sorted[0]}ms`)
    console.log(`   • Max: ${sorted[sorted.length - 1]}ms`)
    console.log(`   • P50: ${sorted[Math.floor(sorted.length * 0.5)]}ms`)
    console.log(`   • P95: ${sorted[Math.floor(sorted.length * 0.95)]}ms`)
    console.log(`   • P99: ${sorted[Math.floor(sorted.length * 0.99)]}ms`)
  }

  if (failedRequests > TOTAL_REQUESTS * 0.1) {
    console.log('\n⚠️  WARNING: More than 10% of requests failed!')
    console.log('   This might indicate memory pressure or resource exhaustion.')
  }

  console.log('\n' + '=' .repeat(60))
  process.exit(failedRequests > 0 ? 1 : 0)
}

runLoadTest().catch(console.error)