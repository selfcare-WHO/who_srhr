export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return await disputedCollection('borders')
})
