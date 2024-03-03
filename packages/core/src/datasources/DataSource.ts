import type { Client, DataPoint } from 'src'
import type { INativeMetric } from 'src/metrics/Metric'

/**
 * The options for the data source.
 */
export interface DataSourceOptions {
  client?: Client
}

/**
 * The collect metric entity from the data source.
 */
export type DataSourceCollectMetric = {
  /** The data of the metric */
  data: DataPoint
  /** The metric */
  metric: INativeMetric
}

/**
 * The data source for persisting the metrics e.g. prometheus, influxdb, etc.
 */
export class DataSource {
  client?: Client
  /**
   * Construct a new data source instance which persists the metrics.
   * @param options The options for the data source
   */
  constructor(options: DataSourceOptions) {
    this.client = options.client
  }

  /**
   * Collect the metrics from the client.
   */
  async collect() {
    if (!this.client) {
      throw new Error('The client has not been registered to the data source.')
    }

    const timestamp = Date.now()

    // Call the before collect callback for the plugins so it can set data from other sources instead of individually setting it through onCollect
    await Promise.all(
      this.client.plugins.map(async (plugin) => plugin.onCollect(timestamp)),
    )

    const dataPoints = [...this.client.metrics.values()].map(async (metric) => {
      return { data: await metric.collect(timestamp), metric }
    })

    return Promise.all(dataPoints)
  }

  /**
   * Register the data source to the client.
   * @param client The client to register the data source to
   */
  register(client: Client) {
    client.registerDataSource(this)
  }
}
