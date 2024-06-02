// # Metric specific util functions

import { MultiCounter } from 'src/metrics/counter/MultiCounter'
import { MultiGauge } from 'src/metrics/gauge/MultiGauge'
import { MultiHistogram } from 'src/metrics/histogram/MultiHistogram'

import { NativeMetricTypes } from './types'

import type {RawMetricType} from './types';

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
    default:
      return new MultiCounter(options)
  }
}
