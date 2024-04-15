/**
 * The type of the metric.
 */
export enum NativeMetricTypes {
  /** The counter metric type */
  Counter = 'counter',
  /** The gauge metric type */
  Gauge = 'gauge',
  /** The histogram metric type */
  Histogram = 'histogram',
  /** The summary metric type */
  Summary = 'summary',
}

/**
 * The raw metric type for constructing the metrics.
 */
export interface RawMetricType<keys = Lowercase<string>> {
  /* The key of the metric */
  name: keys
  /* The type of the metric */
  type: NativeMetricTypes
  /* The description of the metric */
  description: string
  /* The labels for the metric */
  labels: string[]
  /* The value for the metric */
  buckets?: number[]
}
