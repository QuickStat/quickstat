import { Client as QuickStatClient } from '@quickstat/core'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'
import { FastifyPlugin } from '@quickstat/fastify'

import fastify from 'fastify'
import http from 'http'
import { getRandomStatusCode, simulateRequests } from './utils.js'

const app = fastify()

// Create QuickStat Client
const quickStatClient = new QuickStatClient<PrometheusDataSource<ScrapeStrategy>>({
  metrics: [],
  plugins: [
    // Register Fastify Plugin
    new FastifyPlugin({
      app: app,
    }),
  ],
  // Register the data source
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

app.get('/users/:id/todos', async (request, reply) => {
  // Simulate asynchronous work
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
  reply.status(getRandomStatusCode()).send('Todos')
})

app.post('/users/:id', async (request, reply) => {
  reply.status(getRandomStatusCode()).send('User created')
})

app.delete('/users/:id', async (request, reply) => {
  reply.status(getRandomStatusCode()).send('User deleted')
})

app.put('/users/:id', async (request, reply) => {
  reply.status(getRandomStatusCode()).send('User updated')
})

// Start Fastify server
app.listen({ port: 3034 }, () => {
  console.log('Server started at http://localhost:3034')
})

// Randomly simulate requests to the given routes
const routes = { GET: ['/users/:id/todos'], POST: ['/users/:id'], DELETE: ['/users/:id'], PUT: ['/users/:id'] }
simulateRequests('http://localhost:3034', routes)

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
