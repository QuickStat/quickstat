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
npm install @quickstat/express.js
# - npm install @quickstat/fastify (for Fastify Stats)
npm install @quickstat/node.js
```

3. **Install DataSource**: Install the QuickStat data source which will be also invoked from grafana. For example, if you're using Prometheus, you can install the Prometheus data source as follows:

```bash
npm install @quickstat/prometheus
```

4. **Create Client, Register Plugins and Data Source**: Create a QuickStat client, register the plugins and data source, add some custom metrics, and start tracking your metrics.

```javascript
@TODO - Add example code
```

5. [Setup Prometheus and Grafana](#setup-prometheus-and-grafana): Setup Prometheus and Grafana to visualize your metrics.

## Design Philosophy

QuickStat follows a clear differentiation between various components within its architecture. The application is organized into distinct categories:

- **Metrics**: This category encompasses Counters, Gauges, and Histograms, providing mechanisms for recording various metrics.

- **Plugins**: Plugins leverage the metrics to offer library-specific metrics tailored for different use cases.

- **Data Sources**: These sources are responsible for preparing raw metric data and converting it as needed.

- **Client**: The client component acts as the orchestrator, bringing together all the aforementioned components and coordinating their interactions seamlessly.

### Metrics

The provided Metrics adhere to the OpenMetrics Specification. The metric classes prefixed with "Native," such as NativeCounter, NativeGauge, and NativeHistogram, serve as the base classes (internal use) for the user-friendly metric classes like SingleCounter and MultiCounter.

| Metric              | Type      | Description                                                | Example                      | Usage                                  |
| ------------------- | --------- | ---------------------------------------------------------- | ---------------------------- | -------------------------------------- |
| [SingleCounter]()   | Counter   | A simple counter that can just be incremented              | Number of requests           | `counter.inc(2)`                       |
| [MultiCounter]()    | Counter   | A counter that can be incremented with labels              | Number of requests per route | `counter.inc(["GET", "200"], 2)`       |
| [SingleGauge]()     | Gauge     | A simple gauge that can be incremented or decremented      | Memory usage                 | `gauge.dec(2)`                         |
| [MultiGauge]()      | Gauge     | A gauge that can be incremented or decremented with labels | Memory usage per process     | `gauge.dec(["process1"], 2)`           |
| [SingleHistogram]() | Histogram | A simple histogram which can beu used to observe values    | Request duration             | `histogram.observe(2)`                 |
| [MultiHistogram]()  | Histogram | A histogram that can be used to observe values with labels | Request duration per route   | `histogram.observe(["GET", "200"], 2)` |

Click on the hyperlinks to get a detailed understanding of the usage and examples for each metric.

### Plugins

QuickStat offers a range of plugins that are separately installable packages. This section includes both official plugins provided by QuickStat and unofficial ones contributed by the community.

When you add a plugin to your QuickStat client, it begins collecting metrics after initialization or provides an interface to conveniently monitor key metrics for a particular library. Some plugins build upon each other; for instance, the REST plugin provides statistics for REST services, while the Express.js plugin utilizes it to offer a more developer-friendly interface for the Express.js library.

Each plugin comes with various configuration options, and by following the hyperlink associated with each plugin, you can find examples of how to use them. Additionally, the plugins provide templates for Grafana dashboards, which can be located in the examples section.

| Plugin                    | Description                        | Example Metrics                                |
| ------------------------- | ---------------------------------- | ---------------------------------------------- |
| [@quickstat/pm2]()        | Provides metrics for PM2 instances | CPU, Memory, Process metrics etc.              |
| [@quickstat/rest]()       | Provides metrics for REST services | Request count, Response time, Error count etc. |
| [@quickstat/express.js]() | Provides metrics for Express.js    | Request count, Response time, Error count etc. |
| [@quickstat/fastify]()    | Provides metrics for Fastify       | Request count, Response time, Error count etc. |
| [@quickstat/node.js]()    | Provides metrics for Node.js       | Event loop delay, Memory usage, CPU usage etc. |

We are continuously working on expanding our collection of plugins to cover more libraries and services. If you have any suggestions for new plugins or would like to contribute your own plugin, feel free to open an issue on our GitHub repository or submit a pull request.

### Data Sources

Data sources play a crucial role in aggregating collected data from registered metrics and persisting them or making them available for visualization in Grafana. QuickStat currently supports Prometheus with various strategies including scrape, push gateway, or remote write (WIP). However, there are plans to introduce additional data sources such as InfluxDB, PostgreSQL etc. in the future.

| Data Source               | Description                                         | Strategies              |
| ------------------------- | --------------------------------------------------- | ----------------------- |
| [@quickstat/prometheus]() | Convert the metrics to a Prometheus readable format | Scrape and Push Gateway |

### Client

The client serves as the main component for managing metrics, collecting data, and interacting with the data source. It acts as a central component within the QuickStat ecosystem, facilitating seamless integration and access to other components.

| Function           | Description                            | Example                                                          |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------- |
| registerMetrics    | Register metrics to the client         | `client.registerMetrics([counter, gauge, histogram])`            |
| registerMetric     | Register a single metric to the client | `client.registerMetric(counter)`                                 |
| registerPlugins    | Register plugins to the client         | `client.registerPlugins([pm2Plugin, restPlugin, expressPlugin])` |
| registerPlugin     | Register a single plugin to the client | `client.registerPlugin(pm2Plugin)`                               |
| registerDataSource | Register a data source to the client   | `client.registerDataSource(prometheusDataSource)`                |

[A wide array of examples as well as a detailed documentation can be found in this section.]()

## Examples

## Roadmap

We are continuously working on improving QuickStat and adding new features to make it even more powerful and user-friendly. Here are some of the features we are planning to introduce in the future:

- **Metrics:**
  - Summary: A metric that can be used to observe values with quantiles.
  - Untyped: A metric that can be used to observe values without any specific type.
- **Plugins:**
  - Websocket: A plugin that provides metrics for Websocket services.
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
