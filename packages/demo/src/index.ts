import { NativeCounter, Client as QuickStatClient, NativeHistogram, MultiHistogram, SingleGauge } from '@quickstat/core'
import type { PrometheusDataSource, PushGatewayStrategy } from '@quickstat/prometheus'
import scrapeDataSource from './datasources/prometheus/ScrapeDataSource'
import pushGatewayDataSource from './datasources/prometheus/PushGatewayDataSource'
import { SingleCounter } from '@quickstat/core/src/index.js'
import { MultiCounter } from '@quickstat/core'

const quickStatClient = new QuickStatClient<PrometheusDataSource<PushGatewayStrategy>>({
  metrics: [],
  plugins: [],
})

quickStatClient.metrics.get<MultiCounter>("requests").inc([]);

const requestsCounter = new MultiCounter({
  name: 'requests',
  value: 0,
  description: 'The total number of requests.',
  labels: ['method', 'status'],
})

const activeThreadsCounter = new SingleGauge({
  name: 'active_threads',
  value: 0,
  description: 'The total number of active threads.',
})

const nativeHistogram = new MultiHistogram({
  name: 'http_request_duration_seconds',
  description: 'The HTTP request duration in seconds.',
  labels: ['method', 'status'],
  buckets: [0.1, 0.3, 1.2, 5.0],
})

// Register the metrics
quickStatClient.registerMetric(requestsCounter)
quickStatClient.registerMetric(activeThreadsCounter)
quickStatClient.registerMetric(nativeHistogram)

// Register the data source
quickStatClient.registerDataSource(pushGatewayDataSource)

setInterval(async () => {
  requestsCounter.inc(['GET', '200'], 2)
  activeThreadsCounter.inc(3)
}, 1000)

setInterval(async () => {
  nativeHistogram.observe(['GET', '200'], Math.random() * 100000000000)
}, 100)

/* // HTTP Server
import http from 'http'
http.createServer(async (req, res) => {
  requestsCounter.inc(['PROM', '200'], 1)
  const response = await quickStatClient.dataSource?.strategy?.getResponse()
  console.log(response)
  res.writeHead(200, response?.headers)
  res.end(response?.file)
}).listen(3242) */
