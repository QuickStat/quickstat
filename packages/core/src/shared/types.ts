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
