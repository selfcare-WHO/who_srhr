import fetch from 'node-fetch'

async function checkResponseSize() {
  const url = 'http://localhost:3000/api/map-data?indicatorId=4&subgroupId=35471'
  
  console.log('Fetching map data to check response size...')
  
  const response = await fetch(url)
  const text = await response.text()
  const sizeInBytes = Buffer.byteLength(text, 'utf8')
  const sizeInMB = sizeInBytes / 1024 / 1024
  
  console.log(`Response size: ${sizeInBytes} bytes (${sizeInMB.toFixed(2)} MB)`)
  
  const data = JSON.parse(text)
  console.log(`Number of features: ${data.features?.length || 0}`)
  console.log(`Number of legend items: ${Object.keys(data.legend || {}).length}`)
  console.log(`Number of jenks breaks: ${data.jenksBreaks?.length || 0}`)
  
  // Check the size of individual parts
  const featuresSize = Buffer.byteLength(JSON.stringify(data.features || []), 'utf8') / 1024 / 1024
  const legendSize = Buffer.byteLength(JSON.stringify(data.legend || {}), 'utf8') / 1024
  const jenksSize = Buffer.byteLength(JSON.stringify(data.jenksBreaks || []), 'utf8')
  
  console.log(`\nSize breakdown:`)
  console.log(`- Features: ${featuresSize.toFixed(2)} MB`)
  console.log(`- Legend: ${legendSize.toFixed(2)} KB`)
  console.log(`- Jenks breaks: ${jenksSize} bytes`)
}

checkResponseSize().catch(console.error)