import { Plugin } from '@quickstat/core'

import { PM2_METRICS, PM2_METRICS_RAW } from './metrics/metrics'
import { getValueFromRawMetricWithMapping } from './metrics/parse'

import type { MultiCounter, MultiGauge, MultiHistogram } from '@quickstat/core'
import type pm2 from 'pm2'
import type { createValueMapping } from './metrics/metrics'
import type { PM2_AVAILABLE_METRICS } from './metrics/metrics'

/**
 * The options for the pm2 plugin.
 */
export interface Pm2PluginOptions {
  /**
   * The metrics to not collect from the pm2 list
   */
  excludeMetrics: PM2_AVAILABLE_METRICS[]

  /**
   * The pm2 instance to get the metrics from
   */
  pm2: typeof pm2
}

/**
 * The pm2 plugin to collect the metrics from the pm2 list
 */
export class Pm2Plugin extends Plugin {
  /**
   * The pm2 instance to get the metrics from
   */
  pm2: typeof pm2
  /**
   * The pm2 plugin to collect the metrics from the pm2 list
   * @param options The options for the pm2 plugin
   */
  constructor(options: Pm2PluginOptions) {
    super({ ...options, metrics: PM2_METRICS })

    this.pm2 = options.pm2
  }

  /**
   * Get the raw metrics from the pm2 list
   * @returns The raw metrics from the pm2 list
   */
  public async getRawMetrics(): Promise<pm2.ProcessDescription[]> {
    return new Promise((resolve, reject) => {
      this.pm2.list((err, list) => {
        if (err) {
          reject(err)
        } else {
          resolve(list)
        }
      })
    })
  }

  /**
   * Parses the metric value from the pm2 list data
   * @param data The pm2 list data
   * @param metricName The name of the metric
   * @param labels The labels for the metric with the mapping
   * @param value The value for the metric with the mapping
   */
  private parseMetricValue(
    data: pm2.ProcessDescription,
    metricName: string,
    labels: Record<string, ReturnType<typeof createValueMapping>>,
    value?: ReturnType<typeof createValueMapping>,
  ) {
    if (!this.client?.metrics.has(metricName)) return

    const labelValues = Object.values(labels).map(label => getValueFromRawMetricWithMapping(data, label)).map(String)
    const metricValue = value ? getValueFromRawMetricWithMapping(data, value) as number : 0

    this.setMetricValue(metricName, labelValues, metricValue)
  }

  /**
   * Sets the value of the metric
   * @param metricName The name of the metric which is the key
   * @param labels The labels for the metric
   * @param value The value to set the metric to or observe for histograms
   */
  public setMetricValue(metricName: string, labels: string[], value: number) {
    const metric = this.client?.metrics.get(metricName)

    switch (metric?.type) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      case 'counter':
        ;(metric as MultiCounter).set(labels, value)
        break
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      case 'gauge':
        ;(metric as MultiGauge).set(labels, value)
        break
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      case 'histogram':
        ;(metric as MultiHistogram).observe(labels, value)
        break
      default:
        break
    }
  }

  /**
   * Collect the metrics from the pm2 list
   * @param timestamp The timestamp to collect the metrics at
   * @returns The collected metrics
   */
  public async onCollect(timestamp: number) {
    // Collect the metrics from the pm2 list
    const rawMetrics = await this.getRawMetrics()

    // Iterate through the PM2_METRICS_RAW and get the values from the mapping
    PM2_METRICS_RAW.forEach(metric => {
      // Get the raw metrics from the pm2 list for each pm2 metric
      rawMetrics.forEach(data => {
        this.parseMetricValue(data, metric.name, metric.labels, metric.value)
      })
    })

    // Iterate through the PM2_METRICS and get the values from the mapping -> separate class
    return super.onCollect(timestamp)
  }
}
