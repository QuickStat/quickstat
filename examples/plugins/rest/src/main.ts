import { Client as QuickStatClient } from '@quickstat/core'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'
import { RestPlugin, RestRequestObserver } from '@quickstat/rest'
import http from 'http'
import express from 'express'
import { getObservationData, simulateRequests } from './utils.js'

// Create QuickStat Client
const quickStatClient = new QuickStatClient<PrometheusDataSource<ScrapeStrategy>>({
  metrics: [],
  plugins: [
    // Register Rest Plugin
    new RestPlugin(),
  ],
  // Register the data source
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

// Express app (simple track for demonstration purposes)
// For packages not supported by the rest plugin (expressjs is supported), write middleware functions to wrap around the request controller
const app = express()

app.get('/users/:id/todos', async (req ,res) => { 
  const observer = new RestRequestObserver(quickStatClient);

  // Do something which takes time
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

  observer.end(getObservationData(req, res))
  res.send('Todos')
})
app.post('/users/:id', (req,res) => { new RestRequestObserver(quickStatClient).end(getObservationData(req, res)); res.send('User created')})
app.delete('/users/:id', (req,res) => { new RestRequestObserver(quickStatClient).end(getObservationData(req, res)); res.send('User deleted')})
app.put('/users/:id', (req,res) => { new RestRequestObserver(quickStatClient).end(getObservationData(req, res)); res.send('User updated')})

app.listen(3034, () => console.log('Server started at http://localhost:3034'))

// Randomly simulate requests to the given routes
const routes = { GET: ['/users/:id/todos'], POST: ['/users/:id'], DELETE: ['/users/:id'], PUT: ['/users/:id']}
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
