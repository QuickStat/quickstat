# REST Monitoring Plugin

The QuickStat REST Plugin offers seamless integration with REST instances, allowing effortless monitoring of key metrics. It exports these metrics to Prometheus, enabling visualization in Grafana dashboards.

If you are new to QuickStat and its component, feel free to check the [official documentation](https://www.npmjs.com/package/@quickstat/core) for a detailed breakdown.

![](../../../examples/plugins/rest/assets/rest_grafana_overview.png)
![](../../../examples/plugins/rest/assets/rest_grafana_distribution.png)

## Installation

Start by installing the QuickStat core package, the data source used by grafana and then the REST plugin:

```bash
npm install @quickstat/core
npm install @quickstat/prometheus
npm install @quickstat/rest
```

## Getting Started

If you use docker and want to get started quickly, you can check the [following docker-setup](https://github.com/QuickStat/quickstat/tree/master/examples/plugins/rest), which allows you to skip the setup and directly use the plugin. Once you have setup docker, continue on Step 3.

If your unfamiliar with [QuickStat's plugins](https://github.com/QuickStat/quickstat/tree/master?tab=readme-ov-file#plugins), then keep in mind that you can also use other strategies such as (PushGateway) for exposing metrics or even combine your dashboard with other plugins.

If you want to set up Prometheus and Grafana manually, follow the steps below:

### 1. Setup Prometheus and Grafana

1. **Install Prometheus**: Follow the [official documentation](https://prometheus.io/docs/prometheus/latest/installation/) to install Prometheus on your system.

2. **Install Grafana**: Refer to the [official documentation](https://grafana.com/docs/grafana/latest/installation/) for instructions on installing Grafana.

3. **Configure Prometheus Data Source in Grafana**: After installing Grafana, configure Prometheus as a data source. Go to Grafana settings, add a new data source, and specify the URL where Prometheus is running.

### 2. Import Dashboard to Grafana

Once Prometheus and Grafana are set up, you can add [following Dashboard](https://grafana.com/grafana/dashboards/21152). Navigate to the Grafana dashboard page, click on "Import" and paste the dashboard template URL. Then, customize the dashboard as needed.

### 3. Expose REST Metrics

```javascript
```

### 4. Start the Application

After setting up the code, start the application. The metrics will be available at `http://localhost:3242` in Prometheus format and will be scraped by Prometheus, which will then be used for visualization in Grafana.

## Configuration

### DataSource

The example above uses the PrometheusDataSource with the ScrapeStrategy. The ScrapeStrategy exposes the prometheus file on the given endpoint for being scraped from prometheus. You can also use the PushGatewayStrategy to push the metrics to the PushGateway of Prometheus.

If you would like to use other data sources, you can take a look at the available data sources in the [@quickstat/core package](https://github.com/QuickStat/quickstat?tab=readme-ov-file#data-sources)

### Plugin

## Contributing and Issues

If you have any issues or feature requests, feel free to open an issue on the [GitHub repository](https://github.com/QuickStat/quickstat)
