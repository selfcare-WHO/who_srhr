# Memory Debugging Guide

This guide helps you debug and monitor memory usage for the WHO SRHR application.

## Quick Start

1. **Build and Monitor Memory Usage**
   ```bash
   yarn memory:analyze
   ```
   This builds the production app and starts monitoring memory in real-time.

2. **Monitor Existing Build**
   ```bash
   yarn memory:monitor
   ```
   Monitors memory usage of the already built application.

3. **Take Heap Snapshots**
   ```bash
   yarn memory:snapshot
   ```
   Press 's' to take snapshots, then analyze in Chrome DevTools.

4. **Run Load Test**
   ```bash
   # Terminal 1: Start server with monitoring
   yarn memory:monitor
   
   # Terminal 2: Run load test
   yarn memory:load-test
   ```

## Memory Monitoring Scripts

### 1. Real-time Memory Monitor (`yarn memory:monitor`)
- Tracks heap usage, RSS memory, and peak memory
- Shows memory growth over time
- Alerts if memory exceeds 512MB
- Generates a report when stopped

**What to look for:**
- Steady memory growth (indicates leak)
- Peak memory exceeding your hosting limit
- Large jumps in memory usage

### 2. Heap Snapshot Tool (`yarn memory:snapshot`)
- Takes V8 heap snapshots for detailed analysis
- Press 's' while running to capture snapshot
- Analyze in Chrome DevTools Memory tab

**How to analyze snapshots:**
1. Open Chrome and go to `chrome://inspect`
2. Click "Open dedicated DevTools for Node"
3. Go to Memory tab
4. Load your `.heapsnapshot` files
5. Compare snapshots to find memory leaks

### 3. Load Test (`yarn memory:load-test`)
- Simulates concurrent user traffic
- Tests multiple endpoints
- Reports response times and failures

## Common Memory Issues & Solutions

### 1. Memory Leaks in SSR/API Routes

**Symptoms:**
- Memory grows continuously
- Never goes down even after garbage collection

**Common causes:**
- Unclosed database connections
- Event listeners not removed
- Large objects kept in memory
- Circular references

**Debug steps:**
```bash
# 1. Take initial snapshot
yarn memory:snapshot
# Navigate through app, wait 1 minute
# Take second snapshot (press 's')
# Compare in Chrome DevTools
```

### 2. Large Data Processing

**Symptoms:**
- Memory spikes when loading data
- Crashes on large datasets

**Solutions:**
- Implement pagination (already done)
- Stream large responses
- Limit query results
- Add database indexes

### 3. Memory Configuration

**Current Render.com limits:**
- Starter: 512 MB
- Starter Plus: 1 GB
- Standard: 2 GB

**Optimize for 512MB:**
```javascript
// In nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,
    minify: true,
  },
  experimental: {
    payloadExtraction: false, // Reduce memory usage
  }
})
```

## Prisma Memory Optimization

### 1. Connection Pool Settings
Check your database URL in `.env`:
```
DATABASE_URL="file:./database.sqlite3?connection_limit=1"
```

### 2. Query Optimization
```javascript
// Bad - loads all data
const data = await prisma.dataPoint.findMany({
  include: {
    country: true,
    indicator: true,
    subgroup: true
  }
})

// Good - selective loading
const data = await prisma.dataPoint.findMany({
  select: {
    value: true,
    year: true,
    country: { select: { name: true } }
  },
  take: 100 // Limit results
})
```

### 3. Use Raw Queries for Heavy Operations
```javascript
// For complex aggregations
const result = await prisma.$queryRaw`
  SELECT COUNT(*) FROM DataPoint WHERE year = ${year}
`
```

## Monitoring in Production

### Using Chrome DevTools Remotely

1. **SSH tunnel to production:**
```bash
ssh -L 9229:localhost:9229 your-server
```

2. **Start Node with inspector:**
```javascript
// In your start script
node --inspect=0.0.0.0:9229 .output/server/index.mjs
```

3. **Connect Chrome DevTools:**
- Open `chrome://inspect`
- Add `localhost:9229` to targets

### Logging Memory Usage

Add to your server middleware:
```javascript
// server/middleware/memory-logger.ts
export default defineEventHandler(async (event) => {
  if (event.node.req.url === '/api/health') {
    const mem = process.memoryUsage()
    return {
      heap: Math.round(mem.heapUsed / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024)
    }
  }
})
```

## Emergency Fixes

### If app is crashing due to memory:

1. **Immediate fix - Increase swap:**
```bash
# On Linux server
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

2. **Reduce Node memory usage:**
```bash
# Set max heap size
NODE_OPTIONS="--max-old-space-size=400" yarn start
```

3. **Enable garbage collection:**
```javascript
// In your app
if (global.gc) {
  setInterval(() => {
    global.gc()
  }, 30000) // Every 30 seconds
}
```

## Render.com Specific

### Check logs for memory warnings:
```bash
# Look for these patterns:
- "JavaScript heap out of memory"
- "FATAL ERROR: Reached heap limit"
- "Cannot allocate memory"
```

### Recommended settings for Render:
```yaml
# render.yaml
services:
  - type: web
    name: who-srhr-staging
    env: node
    buildCommand: yarn install && yarn build
    startCommand: node --max-old-space-size=400 .output/server/index.mjs
    envVars:
      - key: NODE_ENV
        value: production
      - key: NITRO_PRESET
        value: node-server
```

## Next Steps

1. **Run memory analysis locally:**
   ```bash
   yarn memory:analyze
   ```

2. **Simulate production load:**
   ```bash
   # Terminal 1
   yarn memory:monitor
   
   # Terminal 2
   yarn memory:load-test
   ```

3. **Take heap snapshots before/after navigation:**
   - Start with `yarn memory:snapshot`
   - Take snapshot at startup
   - Navigate through all pages
   - Take another snapshot
   - Compare in Chrome DevTools

4. **Check for common issues:**
   - Large arrays/objects in memory
   - Unclosed database connections
   - Event listeners not cleaned up
   - Cached data not being cleared

5. **Report findings:**
   - Peak memory usage
   - Memory growth rate
   - Specific pages/APIs causing spikes
   - Heap snapshot analysis results

## Support

If memory issues persist after optimization:
1. Upgrade Render instance to Starter Plus (1GB RAM)
2. Implement Redis for caching (offload memory)
3. Consider serverless deployment (auto-scaling)