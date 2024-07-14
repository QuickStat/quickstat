import { Client as QuickStatClient } from '@quickstat/core'
import { KoaPlugin } from '@quickstat/koa'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'

import http from 'http'
import Koa from 'koa'
import Router from 'koa-router'

import { getRandomStatusCode, simulateRequests } from './utils.js'

const app = new Koa()
const router = new Router()

// Create QuickStat Client
const quickStatClient = new QuickStatClient<PrometheusDataSource<ScrapeStrategy>>({
  metrics: [],
  plugins: [
    // Register Koa Plugin
    new KoaPlugin({ app }),
  ],
  // Register the data source
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

router.get('/users/:id/todos', async (ctx) => {
  // Simulate asynchronous work
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
  ctx.status = getRandomStatusCode()
  ctx.body = 'Todos'
})

router.post('/users/:id', async (ctx) => {
  ctx.status = getRandomStatusCode()
  ctx.body = 'User created'
})

router.delete('/users/:id', async (ctx) => {
  ctx.status = getRandomStatusCode()
  ctx.body = 'User deleted'
})

router.put('/users/:id', async (ctx) => {
  ctx.status = getRandomStatusCode()
  ctx.body = 'User updated'
})

// Use the router middleware
app.use(router.routes()).use(router.allowedMethods())

// Start Koa server
app.listen(3034, () => {
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
