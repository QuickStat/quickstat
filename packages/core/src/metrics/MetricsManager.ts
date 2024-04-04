import type { INativeMetric } from './Metric'
import type { MultiCounter } from './counter/MultiCounter'
import type { NativeCounter } from './counter/NativeCounter'
import type { SingleCounter } from './counter/SingleCounter'
import type { MultiGauge } from './gauge/MultiGauge'
import type { NativeGauge } from './gauge/NativeGauge'
import type { SingleGauge } from './gauge/SingleGauge'
import type { MultiHistogram } from './histogram/MultiHistogram'
import type { NativeHistogram } from './histogram/NativeHistogram'
import type { SingleHistogram } from './histogram/SingleHistogram'

type MetricTypes =
  | INativeMetric
  | NativeCounter
  | NativeGauge
  | NativeHistogram
  | SingleCounter
  | MultiCounter
  | SingleGauge
  | MultiGauge
  | SingleHistogram
  | MultiHistogram

/**
 * Manages the metrics by registering, unregister or viewing them.
 */
export class MetricsManager extends Map<string, MetricTypes> {
  /**
   * The constructor for constructing the metric manager which holds the metric instances
   */
  constructor() {
    super()
  }

  /**
   * Gets the metric with the metric name e.g. request_seconds
   * @param metricName The name of the metric which is the key for the metrics store
   * @returns The metric for
   */
  override get<K = MetricTypes>(metricName: string): K {
    return super.get(metricName) as K
  }

  /**
   * Sets the metric with the metric name e.g. request_seconds
   * @param metricName The name of the metric which is the key for the metrics store
   * @param metric The metric to set
   * @returns The metric for
   */
  override set(metricName: string, metric: MetricTypes): this {
    this.delete(metricName)
    return super.set(metricName, metric)
  }

  /**
   * Deletes the metric with the metric name e.g. request_seconds
   * @param metricName The name of the metric which is the key for the metrics store
   * @returns The metric for
   */
  override delete(metricName: string): boolean {
    const existingMetric = this.get(metricName)

    // When metric exists, interval has to be detached and data points cleared
    if (existingMetric) {
      existingMetric._clear()
    }

    return super.delete(metricName)
  }

  override clear(): void {
    for (const metric of this.values()) {
      this.delete(metric.key)
    }
  }
}
