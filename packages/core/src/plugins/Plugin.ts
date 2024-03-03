import type { Client, INativeMetric } from 'src'

/**
 * The options for the plugin.
 */
export interface PluginOptions {
  /**
   * The different metrics which are collected and persisted.
   */
  metrics: INativeMetric[]

  /**
   * Remove following metrics with given key from the plugin
   */
  excludeMetrics?: string[]

  /**
   * The client to register the plugin to.
   */
  client?: Client
}

/**
 * The plugin for collecting and persisting the metrics.
 */
export class Plugin {
  /**
   * The client to register the plugin to.
   */
  client?: Client

  /**
   * The different metrics which are collected and persisted.
   */
  metrics: INativeMetric[]

  /**
   * Remove following metrics with given key from the plugin
   */
  public excludeMetrics: string[] = []

  /**
   * The constructor for constructing the plugin which holds the metrics.
   * @param options The options for the plugin
   */
  constructor(options: PluginOptions) {
    this.metrics = options.metrics
    this.excludeMetrics = options.excludeMetrics || []
    this.client = options.client

    this.removeMetrics(this.excludeMetrics)
  }

  /**
   * Removes the metrics from the plugin with the provided keys.
   * @param keys The keys of the metrics to remove
   */
  public removeMetrics(keys: string[]) {
    this.metrics = this.metrics.filter(metric => !keys.includes(metric.key))
  }

  /**
   * Register the plugin to the client.
   * @param client The client to register the plugin to
   */
  public register(client: Client) {
    client.registerPlugin(this)
  }

  /**
   * Collect the metrics from the plugin if they need to be collected from other sources.
   * @param timestamp The timestamp to collect the metrics at
   */
  public async onCollect(timestamp: number) {
    return null
  }
}
