export default defineEventHandler(() => {
  const mem = process.memoryUsage()
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    rss: mem.rss,
    external: mem.external
  }
})