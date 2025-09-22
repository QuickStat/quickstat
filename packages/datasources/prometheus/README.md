# QuickStat Prometheus DataSource

The QuickStat Prometheus DataSource provides seamless integration for collecting and exporting metrics to Prometheus. It supports multiple strategies including scraping, push gateway, and remote write, enabling flexible metric collection patterns for different deployment scenarios.

If you are new to QuickStat and its components, feel free to check the [official documentation](https://www.npmjs.com/package/@quickstat/core) for a detailed breakdown.

## Installation

Install the QuickStat core package and the Prometheus datasource:

```bash
npm install @quickstat/core
npm install @quickstat/prometheus
```

## Examples

QuickStat offers a range of examples to help you get started with monitoring your metrics. These examples cover various use cases and demonstrate how to integrate QuickStat with different libraries and frameworks.

- [Node.js Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/nodejs/README.md)
- [PM2 Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/pm2/README.md)
- [REST Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/README.md)
  - [Express.js Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/src/mainExpress.ts)
  - [Fastify Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/src/mainFastify.ts)
  - [Koa Plugin Example](https://github.com/QuickStat/quickstat/blob/master/examples/plugins/rest/src/mainKoa.ts)

## Getting Started

The Prometheus DataSource can be used with any QuickStat plugin or custom metrics. It offers three different strategies for metric collection:

1. **ScrapeStrategy**: Exposes metrics on an HTTP endpoint for Prometheus to scrape (pull model)
2. **PushGatewayStrategy**: Pushes metrics to a Prometheus Push Gateway (push model)
3. **RemoteWriteStrategy**: Sends metrics using Prometheus remote write protocol (push model)

### Basic Usage with ScrapeStrategy

The most common approach is using the scrape strategy where Prometheus pulls metrics from your application:

```typescript
import { Client as QuickStatClient } from '@quickstat/core'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'
import http from 'http'

// Create QuickStat Client with Prometheus DataSource
const quickStatClient = new QuickStatClient<PrometheusDataSource<ScrapeStrategy>>({
  metrics: [
    // Add your custom metrics here
  ],
  plugins: [
    // Add your plugins here (e.g., ExpressPlugin, NodeJSPlugin, etc.)
  ],
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

// Expose metrics endpoint for Prometheus scraping
// WARNING: On production, properly secure this endpoint
http.createServer(async (req, res) => {
  const response = await quickStatClient.dataSource?.strategy?.getResponse()

  if (response) {
    res.writeHead(200, response.headers)
    res.end(response.file)
  }
}).listen(9090, () => {
  console.log('Metrics available at http://localhost:9090')
})
```

### Using PushGatewayStrategy

For batch jobs or applications behind firewalls, use the Push Gateway strategy:

```typescript
import { Client as QuickStatClient } from '@quickstat/core'
import { PrometheusDataSource, PushGatewayStrategy } from '@quickstat/prometheus'

const quickStatClient = new QuickStatClient<PrometheusDataSource<PushGatewayStrategy>>({
  metrics: [
    // Add your custom metrics here
  ],
  plugins: [
    // Add your plugins here
  ],
  dataSource: new PrometheusDataSource({
    strategy: new PushGatewayStrategy({
      url: 'http://localhost:9091', // Your Push Gateway URL
      auto: {
        pushInterval: 10000, // Push every 10 seconds
        jobName: 'my-application',
      },
    }),
  }),
})

// Manually push metrics
await quickStatClient.dataSource?.strategy?.push('my-job')

// Or push with custom groupings
await quickStatClient.dataSource?.strategy?.push('my-job', {
  instance: 'server-1',
  environment: 'production',
})
```

### Using RemoteWriteStrategy (in development)

For direct integration with Prometheus remote write endpoints:

```typescript
import { Client as QuickStatClient } from '@quickstat/core'
import { PrometheusDataSource, RemoteWriteStrategy } from '@quickstat/prometheus'

const quickStatClient = new QuickStatClient<PrometheusDataSource<RemoteWriteStrategy>>({
  metrics: [
    // Add your custom metrics here
  ],
  plugins: [
    // Add your plugins here
  ],
  dataSource: new PrometheusDataSource({
    strategy: new RemoteWriteStrategy({
      // Remote write configuration
    }),
  }),
})
```

## Configuration

### ScrapeStrategy Options

The `ScrapeStrategy` accepts minimal configuration as it simply exposes metrics for scraping:

```typescript
new ScrapeStrategy({
  // Currently no specific options available
})
```

### PushGatewayStrategy Options

The `PushGatewayStrategy` supports comprehensive configuration for push gateway integration:

```typescript
new PushGatewayStrategy({
  url: 'http://localhost:9091', // Required: Push Gateway URL
  requestOptions: { // Optional: HTTP request options
    timeout: 5000,
    headers: {
      'Authorization': 'Bearer token',
    },
  },
  auto: { // Optional: Auto-push configuration
    pushInterval: 10000, // Push interval in milliseconds
    jobName: 'my-application', // Job name for metrics
  },
})
```

### RemoteWriteStrategy Options

The `RemoteWriteStrategy` is currently in development. Configuration options will be documented when available.

## Strategies Overview

### ScrapeStrategy (Pull Model)

- **Use Case**: Traditional Prometheus deployments where Prometheus scrapes metrics
- **Advantages**: Simple setup, Prometheus controls scraping frequency, no additional infrastructure needed
- **Considerations**: Requires your application to be accessible by Prometheus

### PushGatewayStrategy (Push Model)

- **Use Case**: Batch jobs, applications behind firewalls, or when scraping is not feasible
- **Advantages**: Works with short-lived processes, can push on-demand, supports custom groupings
- **Considerations**: Requires Push Gateway deployment, manual lifecycle management of metrics

### RemoteWriteStrategy (Push Model)

- **Use Case**: Direct integration with Prometheus remote write endpoints
- **Advantages**: Direct integration, suitable for high-volume metrics
- **Considerations**: Currently in development

## Prometheus Configuration

When using the ScrapeStrategy, configure Prometheus to scrape your application:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'quickstat-app'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 15s
```

When using PushGatewayStrategy, configure Prometheus to scrape the Push Gateway:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'pushgateway'
    static_configs:
      - targets: ['localhost:9091']
    honor_labels: true
```

## Metric Format

The Prometheus DataSource automatically converts QuickStat metrics to Prometheus format:

- **Counters**: Exported with `_total` suffix
- **Gauges**: Exported with current value
- **Histograms**: Exported with `_bucket`, `_count`, and `_sum` metrics

Example output:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234

# HELP response_time_seconds Response time in seconds
# TYPE response_time_seconds histogram
response_time_seconds_bucket{le="0.1"} 100
response_time_seconds_bucket{le="0.5"} 200
response_time_seconds_bucket{le="+Inf"} 250
response_time_seconds_count 250
response_time_seconds_sum 45.5
```

## Integration with QuickStat Plugins

The Prometheus DataSource works seamlessly with all QuickStat plugins:

```typescript
import { ExpressPlugin } from '@quickstat/expressjs'
import { NodeJSPlugin } from '@quickstat/nodejs'
import { PM2Plugin } from '@quickstat/pm2'

const quickStatClient = new QuickStatClient<PrometheusDataSource<ScrapeStrategy>>({
  metrics: [],
  plugins: [
    new ExpressPlugin({ app }),
    new NodeJSPlugin(),
    new PM2Plugin(),
  ],
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})
```

## Contributing and Issues

For issues or feature requests, feel free to open an issue on the [GitHub repository](https://github.com/QuickStat/quickstat).
