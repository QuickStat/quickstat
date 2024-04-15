import { MultiCounter } from 'src'
import { MultiGauge } from 'src/metrics/gauge/MultiGauge'
import { MultiHistogram } from 'src/metrics/histogram/MultiHistogram'
import { NativeMetricTypes, type RawMetricType } from './types'

/**
 * Normalizes the name of the label to be used as a key in the labels map.
 * @param name The name of the label
 * @returns The normalized name of the label
 */
export function normalizeLabelName(name: string): Lowercase<string> {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_') as Lowercase<string>
}

/**
 * Gets the metric key from the name and labels.
 * @param name The name of the metric
 * @param labels The labels for the metric
 * @returns Composite key for the metric based on the name and labels
 */
export function getMetricKey(name: string, labels: string[]) {
  return name + (labels.length > 0 ? `{${labels.join(',')}}` : '')
}

/**
 * Gets the labels from the mapped keys
 * @param labels The mapped keys
 * @returns The labels
 */
export function getLabelsFromRecord(labels: Record<string, any>) {
  return Object.keys(labels)
}

/**
 * Creates an instance of the metric from the raw metric type.
 * @param options The raw metric type for constructing the metrics
 * @returns The instance based on the raw metric options
 */
export function createInstanceFromRawMetric(options: RawMetricType) {
  // Construct the metrics based on the type
  switch (options.type) {
    case NativeMetricTypes.Counter:
      return new MultiCounter(options)
    case NativeMetricTypes.Gauge:
      return new MultiGauge(options)
    case NativeMetricTypes.Histogram:
      return new MultiHistogram({
        ...options,
        buckets: options.buckets ?? [0.1, 0.3, 1.2, 5.0],
      })
  }
}
