import { Client as QuickStatClient } from '@quickstat/core'
import { NodeJsPlugin } from '@quickstat/nodejs'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'

import http from 'http'

// Create QuickStat Client
const quickStatClient = new QuickStatClient<PrometheusDataSource<ScrapeStrategy>>({
  metrics: [],
  plugins: [
    // Register Node.js Plugin
    new NodeJsPlugin(),
  ],
  // Register the data source
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

// Let Prometheus scrape the metrics at http://localhost:3242
// WARNING: On production, properly secure the endpoint
const server = http.createServer(async (req, res) => {
  const response = await quickStatClient.dataSource?.strategy?.getResponse()

  // Write the prometheus response file
  if (response) {
    res.writeHead(200, response.headers)
    res.end(response.file)
  } else {
    res.writeHead(500)
    res.end('Error retrieving metrics')
  }
}).listen(3242)

console.log('Node.js metrics server started on http://localhost:3242')
console.log('You can view the metrics by visiting http://localhost:3242')
console.log('Press Ctrl+C to stop the server')

// Simulate some work to generate interesting metrics
const simulateWork = () => {
  // Create some objects to trigger garbage collection
  const data = new Array(1000).fill(0).map(() => ({
    id: Math.random(),
    data: new Array(100).fill(Math.random()),
  }))

  // Simulate some CPU work
  let sum = 0
  for (let i = 0; i < 10000; i++) {
    sum += Math.sqrt(i) * Math.random()
  }

  // Simulate some async work
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      // Clean up to trigger GC
      data.length = 0
      resolve(sum)
    }, Math.random() * 100)
  })
}

// Run simulation work every 3 seconds
const workInterval = setInterval(async () => {
  try {
    const result = await simulateWork()
    console.log(`Simulated work completed at ${new Date().toISOString()}, result: ${result.toFixed(2)}`)
  } catch (error) {
    console.error('Error during simulation:', error)
  }
}, 3000)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...')
  clearInterval(workInterval)
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...')
  clearInterval(workInterval)
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
