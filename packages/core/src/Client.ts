import { MetricsManager } from './metrics/MetricsManager'

import type { DataSource } from './datasources/DataSource'
import type { INativeMetric } from './metrics/Metric'
import type { Plugin } from './plugins/Plugin'

/**
 * The options for the client.
 * @template D The data source type
 */
export interface ClientOptions<D extends DataSource = DataSource> {
  /**
   * The data source to persist the metrics on e.g. prometheus, influxdb, etc.
   */
  dataSource?: D
  /**
   * The plugins to automatically collect the metrics from the application e.g. pm2, rest, etc.
   */
  plugins: Plugin[]
  /**
   * The different metrics which are collected and persisted.
   */
  metrics: INativeMetric[]
}

/**
 * The client which contains the config for the data sources and plugins for collecting and persisting the metrics.
 * @template D The data source type
 */
export class Client<D extends DataSource = DataSource> {
  /** The data source to persist the metrics on e.g. prometheus, influxdb, etc. */
  dataSource?: D
  /** The plugins to automatically collect the metrics from the application e.g. pm2, rest, etc. */
  plugins: Plugin[]
  /** The different metrics which are collected and persisted. */
  metrics: MetricsManager
  constructor(options: ClientOptions<D>) {
    this.dataSource = options.dataSource
    this.plugins = []
    this.metrics = new MetricsManager()

    this.registerPlugins(options.plugins)
    this.registerMetrics(options.metrics)

    if (this.dataSource) {
      this.registerDataSource(this.dataSource)
    }
  }

  /**
   * Register the metrics to the client.
   * @param metrics The metrics to register
   */
  registerMetrics(metrics: INativeMetric[]) {
    for (const metric of metrics) {
      this.registerMetric(metric)
    }
  }

  /**
   * Register a metric to the client.
   * @param metric The metric to register
   */
  registerMetric(metric: INativeMetric) {
    if (this.metrics.has(metric.key)) {
      throw new Error(`The metric with the key ${metric.key} has already been registered.`)
    }

    this.metrics.set(metric.key, metric)
  }

  /**
   * Register Plugins to the client.
   * @param plugins The plugins to register
   */
  registerPlugins(plugins: Plugin[]) {
    for (const plugin of plugins) {
      this.registerPlugin(plugin)
    }
  }

  /**
   * Register a plugin to the client.
   * @param plugin The plugin to register
   */
  registerPlugin(plugin: Plugin) {
    if (plugin.client) {
      throw new Error('The plugin has already been registered.')
    } else if (!plugin.metrics) {
      throw new Error('The plugin does not have any metrics to register.')
    }

    plugin.client = this
    this.plugins.push(plugin)
    this.registerMetrics(plugin.metrics)
  }

  /**
   * Register the data source to the client.
   * @param dataSource The data source to register
   */
  registerDataSource(dataSource: D = this.dataSource as D) {
    if (this.dataSource && this.dataSource.client) {
      throw new Error('The data source has already been registered.')
    } else if (!dataSource) {
      throw new Error('The data source is not defined.')
    }

    this.dataSource = dataSource
    this.dataSource.client = this
  }
}
