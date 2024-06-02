import { Client as QuickStatClient } from '@quickstat/core'
import { Pm2Plugin } from '@quickstat/pm2'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'
import pm2 from 'pm2'
import http from 'http'
import { DemoProcessManager } from './pm2/main.js'

// Create QuickStat Client
const quickStatClient = new QuickStatClient<PrometheusDataSource<ScrapeStrategy>>({
  metrics: [],
  plugins: [
    // Register PM2 Plugin
    new Pm2Plugin({ pm2 }),
  ],
  // Register the data source
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

// Let Prometheus scrape the metrics at http://localhost:3242
// WARNING: On production, properly secure the endpoint
http.createServer(async (req, res) => {
  const response = await quickStatClient.dataSource?.strategy?.getResponse()

  // Write the prometheus response file
  if (response) {
    res.writeHead(200, response.headers)
    res.end(response.file)
  }
}).listen(3242)

// IMPORTANT: The following code below is just for demonstration purposes -> spins up some pm2 processes
new DemoProcessManager().start()
