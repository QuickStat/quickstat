# QuickStat - Simplify Your Metrics Tracking

Your go-to solution for effortless metrics and stats tracking in your Node.js projects. Whether you're managing PM2 instances, building REST APIs, or working with plain Node.js applications, QuickStat makes it easy to monitor and analyze key metrics.

### Key Features

- **Plugin Integration**: Seamlessly integrate with popular frameworks and platforms like PM2, REST, and Node.js by installing QuickStat plugins and getting metrics right-away.

- **Custom Metric Tracking**: Utilize Simple or Labeled Counters, Gauges, or Histograms to track a wide range of custom metrics tailored to your specific requirements.

- **Prometheus Client**: Use the offered Prometheus client to scrape, push, or remotely write your metrics, enabling effortless querying and analysis.

- **Grafana Integration**: Visualize your metrics effortlessly on Grafana dashboards, with dedicated dashboards available for QuickStat plugins.

- **Upcoming Features**: Stay tuned for future updates, including additional metric types, new plugins and support for new data sources such as InfluxDB and PostgreSQL.

### Getting Started

QuickStat is designed to simplify your metrics tracking process, eliminating the need to worry about various constraints. Our plugins are seamlessly integrated and specifically tailored for popular libraries and frameworks, ensuring a smooth tracking experience.

**Following steps are very briefly summarized and do not cover the full potential of QuickStat. For more detailed information, please go to the respective plugin, metric, or data source documentation through the hyperlinks.**

1. **Install QuickStat**: Start by installing the QuickStat core package

```bash
npm install @quickstat/core
```

2. **Install Plugins**: Install the QuickStat plugins that are relevant to your project. For example, if you're using PM2, REST, and Node.js, you can install the respective plugins as follows:

```bash
npm install @quickstat/pm2
npm install @quickstat/expressjs
# - npm install @quickstat/fastify (for Fastify Stats)
npm install @quickstat/nodejs
```

3. **Install DataSource**: Install the QuickStat data source which will be also invoked from grafana. For example, if you're using Prometheus, you can install the Prometheus data source as follows:

```bash
npm install @quickstat/prometheus
```

4. **Create Client, Register Plugins and Data Source**: Create a QuickStat client, register the plugins and data source, add some custom metrics, and start tracking your metrics.

```javascript
import express from 'express'
import { Client as QuickStatClient } from '@quickstat/core'
import { ExpressPlugin } from '@quickstat/expressjs'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'
import http from 'http'

const app = express()

// Create QuickStat Client
const quickStatClient = new QuickStatClient() < PrometheusDataSource < ScrapeStrategy >> ({
      metrics: [],
      plugins: [
        // Register Express Plugin
        new ExpressPlugin({ app }),
      ],
      // Register the data source
      dataSource: new PrometheusDataSource({
        strategy: new ScrapeStrategy(),
      }),
    })

// Express.js Routes Handling
app.put('/users/:id', (req, res) => {
  res.status(204).send('User updated')
})

app.listen(3034, () => console.log('Server started at http://localhost:3034'))

// Let Prometheus scrape the metrics at http://localhost:3242
// WARNING: On production, properly secure the endpoint (if open)
http.createServer(async (req, res) => {
  const response = await quickStatClient.dataSource?.strategy?.getResponse()

  // Write the prometheus response file
  if (response) {
    res.writeHead(200, response.headers)
    res.end(response.file)
  }
}).listen(3242)
```

5. [Setup Prometheus and Grafana](#setup-prometheus-and-grafana): Setup Prometheus and Grafana to visualize your metrics.

## Design Philosophy

QuickStat follows a clear differentiation between various components within its architecture. The application is organized into distinct categories:

- **Metrics**: This category encompasses Counters, Gauges, and Histograms, providing mechanisms for recording various metrics.

- **Plugins**: Plugins leverage the metrics to offer library-specific metrics tailored for different use cases.

- **Data Sources**: These sources are responsible for preparing raw metric data and converting it as needed.

- **Client**: The client component acts as the orchestrator, bringing together all the aforementioned components and coordinating their interactions seamlessly.

### Metrics

The provided Metrics adhere to the OpenMetrics Specification. The metric classes prefixed with "Native" such as NativeCounter, NativeGauge, and NativeHistogram, serve as the base classes (internal use) for the user-friendly metric classes like SingleCounter and MultiCounter.

| Metric              | Type      | Description                                                | Example                      | Usage                                  |
| ------------------- | --------- | ---------------------------------------------------------- | ---------------------------- | -------------------------------------- |
| [SingleCounter]()   | Counter   | A simple counter that can just be incremented              | Number of requests           | `counter.inc(2)`                       |
| [MultiCounter]()    | Counter   | A counter that can be incremented with labels              | Number of requests per route | `counter.inc(["GET", "200"], 2)`       |
| [SingleGauge]()     | Gauge     | A simple gauge that can be incremented or decremented      | Memory usage                 | `gauge.dec(2)`                         |
| [MultiGauge]()      | Gauge     | A gauge that can be incremented or decremented with labels | Memory usage per process     | `gauge.dec(["process1"], 2)`           |
| [SingleHistogram]() | Histogram | A simple histogram which can beu used to observe values    | Request duration             | `histogram.observe(2)`                 |
| [MultiHistogram]()  | Histogram | A histogram that can be used to observe values with labels | Request duration per route   | `histogram.observe(["GET", "200"], 2)` |

Click on the hyperlinks to get a detailed understanding of the usage and examples for each metric.

## Custom Metrics

QuickStat allows you to create and register custom metrics to track application-specific data. This section provides comprehensive examples and guidance on how to create, register, and use custom metrics effectively.

### Creating Custom Metrics

#### Single Counter

Use single counters to track cumulative values that only increase over time without labels.

```javascript
import { SingleCounter } from '@quickstat/core'

// Create a counter to track total requests
const totalRequestsCounter = new SingleCounter({
  name: 'total_requests',
  description: 'Total number of HTTP requests received',
})

// Increment the counter
totalRequestsCounter.inc() // Increment by 1
totalRequestsCounter.inc(5) // Increment by 5

// Set a specific value
totalRequestsCounter.set(100)

// Get current value
const currentValue = totalRequestsCounter.getValue()
```

#### Multi Counter

Use multi counters to track cumulative values with multiple labels for categorization.

```javascript
import { MultiCounter } from '@quickstat/core'

// Create a counter to track requests by method and status code
const requestsCounter = new MultiCounter({
  name: 'http_requests',
  description: 'Number of HTTP requests by method and status code',
  labels: ['method', 'status_code'],
})

// Increment with labels
requestsCounter.inc(['GET', '200']) // Increment by 1
requestsCounter.inc(['POST', '201'], 3) // Increment by 3

// Set specific values
requestsCounter.set(['GET', '404'], 10)

// Get values
const totalValue = requestsCounter.getValue() // Total across all labels
const getRequests = requestsCounter.getValue(['GET', '200']) // Specific labels
```

#### Single Gauge

Use single gauges to track values that can go up or down without labels.

```javascript
import { SingleGauge } from '@quickstat/core'

// Create a gauge to track memory usage
const memoryUsageGauge = new SingleGauge({
  name: 'memory_usage_bytes',
  description: 'Current memory usage in bytes',
})

// Set value
memoryUsageGauge.set(1048576) // 1MB

// Increment and decrement
memoryUsageGauge.inc(1024) // Increase by 1KB
memoryUsageGauge.dec(512) // Decrease by 512 bytes

// Get current value
const currentMemory = memoryUsageGauge.getValue()
```

#### Multi Gauge

Use multi gauges to track values that can go up or down with multiple labels.

```javascript
import { MultiGauge } from '@quickstat/core'

// Create a gauge to track active connections per service
const activeConnectionsGauge = new MultiGauge({
  name: 'active_connections',
  description: 'Number of active connections per service',
  labels: ['service', 'protocol'],
})

// Set values
activeConnectionsGauge.set(['api', 'http'], 50)
activeConnectionsGauge.set(['database', 'tcp'], 10)

// Increment and decrement
activeConnectionsGauge.inc(['api', 'http'], 5) // Add 5 connections
activeConnectionsGauge.dec(['api', 'http'], 2) // Remove 2 connections

// Get values
const totalConnections = activeConnectionsGauge.getValue()
const apiConnections = activeConnectionsGauge.getValue(['api', 'http'])
```

#### Single Histogram

Use single histograms to observe the distribution of values without labels.

```javascript
import { SingleHistogram } from '@quickstat/core'

// Create a histogram to track request duration
const requestDurationHistogram = new SingleHistogram({
  name: 'request_duration_seconds',
  description: 'HTTP request duration in seconds',
  buckets: [0.1, 0.3, 0.5, 1.0, 2.5, 5.0, 10.0], // Define buckets
})

// Observe values
requestDurationHistogram.observe(0.25) // 250ms request
requestDurationHistogram.observe(1.5) // 1.5s request

// Observe in specific bucket (advanced usage)
requestDurationHistogram.observeBucket(0.8, 1.0)

// Get statistics
const totalSum = requestDurationHistogram.getSum() // Total time across all requests
const fastRequests = requestDurationHistogram.getCount(0.5) // Requests under 500ms
```

#### Multi Histogram

Use multi histograms to observe the distribution of values with multiple labels.

```javascript
import { MultiHistogram } from '@quickstat/core'

// Create a histogram to track request duration by endpoint and method
const requestDurationHistogram = new MultiHistogram({
  name: 'http_request_duration_seconds',
  description: 'HTTP request duration in seconds by endpoint and method',
  labels: ['endpoint', 'method'],
  buckets: [0.001, 0.01, 0.1, 1.0, 10.0],
})

// Observe values with labels
requestDurationHistogram.observe(['/api/users', 'GET'], 0.05)
requestDurationHistogram.observe(['/api/users', 'POST'], 0.15)

// Get statistics
const totalSum = requestDurationHistogram.getSum(['/api/users', 'GET'])
const fastGetRequests = requestDurationHistogram.getCount(['/api/users', 'GET'], 0.1)
```

### Advanced Metric Options

#### Metric Callbacks

You can define callbacks that execute when metrics are collected:

```javascript
import { SingleCounter } from '@quickstat/core'

const requestCounter = new SingleCounter({
  name: 'requests_processed',
  description: 'Number of requests processed',
  onCollect: (metric) => {
    console.log(`Collecting metric: ${metric.name}`)
    // Perform custom logic before collection
  },
  afterCollect: (metric) => {
    console.log(`Metric collected: ${metric.name}`)
    // Perform custom logic after collection
  },
})
```

#### Reset Options

Configure automatic reset intervals for metrics:

```javascript
import { SingleCounter } from '@quickstat/core'

const requestCounter = new SingleCounter({
  name: 'requests_per_minute',
  description: 'Number of requests in the current minute',
  value: 0, // Initial value
  reset: {
    interval: 60000, // Reset every 60 seconds
    value: (counter) => {
      console.log(`Resetting counter. Previous value: ${counter.getValue()}`)
      counter.value = 0 // Custom reset logic
    },
  },
})
```

#### Initial Values

Set initial values for metrics:

```javascript
import { MultiGauge } from '@quickstat/core'

const resourceGauge = new MultiGauge({
  name: 'resource_allocation',
  description: 'Current resource allocation by type',
  labels: ['resource_type'],
  value: 100, // Initial total value
  values: [
    { labels: ['cpu'], value: 50, sum: 50 },
    { labels: ['memory'], value: 30, sum: 30 },
    { labels: ['storage'], value: 20, sum: 20 },
  ],
})
```

### Registering Custom Metrics

#### Individual Registration

Register metrics one by one:

```javascript
import { Client as QuickStatClient, SingleCounter, MultiGauge } from '@quickstat/core'

const client = new QuickStatClient({
  metrics: [],
  plugins: [],
})

// Create custom metrics
const requestCounter = new SingleCounter({
  name: 'custom_requests',
  description: 'Custom request counter',
})

const memoryGauge = new MultiGauge({
  name: 'custom_memory',
  description: 'Custom memory gauge',
  labels: ['process'],
})

// Register metrics
client.registerMetric(requestCounter)
client.registerMetric(memoryGauge)
```

#### Batch Registration

Register multiple metrics at once:

```javascript
import { Client as QuickStatClient, SingleCounter, SingleGauge, SingleHistogram } from '@quickstat/core'

// Create metrics array
const customMetrics = [
  new SingleCounter({
    name: 'batch_requests',
    description: 'Batch request counter',
  }),
  new SingleGauge({
    name: 'batch_memory',
    description: 'Batch memory gauge',
  }),
  new SingleHistogram({
    name: 'batch_response_time',
    description: 'Batch response time histogram',
    buckets: [0.1, 0.5, 1.0, 2.0, 5.0],
  }),
]

const client = new QuickStatClient({
  metrics: customMetrics,
  plugins: [],
})

// Or register after client creation
client.registerMetrics(customMetrics)
```

### Using Custom Metrics in Your Application

#### Integration Example

Here's a complete example of integrating custom metrics into an Express.js application:

```javascript
import express from 'express'
import { Client as QuickStatClient, SingleCounter, SingleHistogram, MultiGauge } from '@quickstat/core'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'

const app = express()

// Create custom metrics
const customRequestCounter = new SingleCounter({
  name: 'custom_total_requests',
  description: 'Total number of custom requests',
})

const customResponseTimeHistogram = new SingleHistogram({
  name: 'custom_response_time_seconds',
  description: 'Custom response time in seconds',
  buckets: [0.001, 0.01, 0.1, 1.0, 10.0],
})

const customActiveUsersGauge = new MultiGauge({
  name: 'custom_active_users',
  description: 'Number of active users by session type',
  labels: ['session_type'],
})

// Create QuickStat client with custom metrics
const quickStatClient = new QuickStatClient({
  metrics: [
    customRequestCounter,
    customResponseTimeHistogram,
    customActiveUsersGauge,
  ],
  plugins: [], // Add other plugins as needed
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

// Middleware to track custom metrics
app.use((req, res, next) => {
  const startTime = Date.now()

  // Increment request counter
  customRequestCounter.inc()

  res.on('finish', () => {
    // Track response time
    const duration = (Date.now() - startTime) / 1000
    customResponseTimeHistogram.observe(duration)
  })

  next()
})

// Route with custom metric updates
app.get('/login', (req, res) => {
  // Simulate user login
  customActiveUsersGauge.inc(['web'], 1)
  res.json({ message: 'User logged in' })
})

app.get('/logout', (req, res) => {
  // Simulate user logout
  customActiveUsersGauge.dec(['web'], 1)
  res.json({ message: 'User logged out' })
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
```

### Plugins

QuickStat offers a range of plugins that are separately installable packages. This section includes both official plugins provided by QuickStat and unofficial ones contributed by the community.

When you add a plugin to your QuickStat client, it begins collecting metrics after initialization or provides an interface to conveniently monitor key metrics for a particular library. Some plugins build upon each other; for instance, the REST plugin provides statistics for REST services, while the Express.js plugin utilizes it to offer a more developer-friendly interface for the Express.js library.

Each plugin comes with various configuration options, and by following the hyperlink associated with each plugin, you can find examples of how to use them. Additionally, the plugins provide templates for Grafana dashboards, which can be located in the examples section.

| Plugin                                                         | Description                        | Example Metrics                                |
| -------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------- |
| [@quickstat/pm2](./packages/plugins/pm2/README.md)             | Provides metrics for PM2 instances | CPU, Memory, Process metrics etc.              |
| [@quickstat/rest](./packages/plugins/rest/README.md)           | Provides metrics for REST services | Request count, Response time, Error count etc. |
| [@quickstat/expressjs](./packages/plugins/expressjs/README.md) | Provides metrics for Express.js    | Request count, Response time, Error count etc. |
| [@quickstat/fastify](./packages/plugins/fastify/README.md)     | Provides metrics for Fastify       | Request count, Response time, Error count etc. |
| [@quickstat/koa](./packages/plugins/koa/README.md)             | Provides metrics for Koa           | Request count, Response time, Error count etc. |
| [@quickstat/nodejs](./packages/plugins/nodejs/README.md)       | Provides metrics for Node.js       | Event loop delay, Memory usage, CPU usage etc. |

We are continuously working on expanding our collection of plugins to cover more libraries and services. If you have any suggestions for new plugins or would like to contribute your own plugin, feel free to open an issue on our GitHub repository or submit a pull request.

### Data Sources

Data sources play a crucial role in aggregating collected data from registered metrics and persisting them or making them available for visualization in Grafana. QuickStat currently supports Prometheus with various strategies including scrape, push gateway, or remote write (WIP). However, there are plans to introduce additional data sources such as InfluxDB, PostgreSQL etc. in the future.

| Data Source                                                          | Description                                         | Strategies              |
| -------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| [@quickstat/prometheus](./packages/datasources/prometheus/README.md) | Convert the metrics to a Prometheus readable format | Scrape and Push Gateway |

### Client

The client serves as the main component for managing metrics, collecting data, and interacting with the data source. It acts as a central component within the QuickStat ecosystem, facilitating seamless integration and access to other components.

| Function           | Description                            | Example                                                          |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------- |
| registerMetrics    | Register metrics to the client         | `client.registerMetrics([counter, gauge, histogram])`            |
| registerMetric     | Register a single metric to the client | `client.registerMetric(counter)`                                 |
| registerPlugins    | Register plugins to the client         | `client.registerPlugins([pm2Plugin, restPlugin, expressPlugin])` |
| registerPlugin     | Register a single plugin to the client | `client.registerPlugin(pm2Plugin)`                               |
| registerDataSource | Register a data source to the client   | `client.registerDataSource(prometheusDataSource)`                |

## Examples

QuickStat offers a range of examples to help you get started with monitoring your metrics. These examples cover various use cases and demonstrate how to integrate QuickStat with different libraries and frameworks.

- [Node.js Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/nodejs/README.md)
- [PM2 Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/pm2/README.md)
- [REST Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/README.md)
  - [Express.js Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/src/mainExpress.ts)
  - [Fastify Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/src/mainFastify.ts)
  - [Koa Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/src/mainKoa.ts)

## Roadmap

We are continuously working on improving QuickStat and adding new features to make it even more powerful and user-friendly. Here are some of the features we are planning to introduce in the future:

- **Metrics:**
  - Summary: A metric that can be used to observe values with quantiles.
  - Untyped: A metric that can be used to observe values without any specific type.
- **Plugins:**
  - WebSocket: A plugin that provides metrics for WebSocket services.
  - Axios/Fetch: A plugin that provides metrics for Axios and Fetch libraries.
  - Worker Threads/Child Processes: A plugin that provides metrics for Worker Threads and Child Processes.
- **Data Sources:**
  - (Prometheus) Remote Write: A data source that can be used to remotely write metrics to Prometheus or other compatible remote write storages.
  - InfluxDB: A data source that can be used to persist metrics in InfluxDB.
  - PostgreSQL: A data source that can be used to persist metrics in PostgreSQL.
- **Dashboard Templates:**
  - Additional Grafana dashboard templates for new plugins and data sources.
  - Automatic dashboard generation based on registered metrics on the plugins.

## Issues

Feel free to open an issue on our GitHub repository if you encounter any problems or have any suggestions for improvements. We are always open to feedback and are committed to addressing any issues as soon as possible.

## Contributing

We welcome contributions from the community and encourage you to submit pull requests for any new features, bug fixes, or improvements. Please ensure that you follow the guidelines outlined in our contributing guide.
