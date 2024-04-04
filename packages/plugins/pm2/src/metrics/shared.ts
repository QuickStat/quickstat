import { MultiCounter, MultiGauge, MultiHistogram, NativeMetricTypes } from '@quickstat/core'

import { PM2_METRICS_RAW } from './metrics'

/**
 * The pm2 metrics constructed from the metadata
 */
export const PM2_METRICS = createPm2Metrics(PM2_METRICS_RAW)

/**
 * Creates the pm2 metrics from the metadata
 * @param data The metadata for the pm2 metrics
 * @returns The created metrics
 */
export function createPm2Metrics(data: typeof PM2_METRICS_RAW) {
  const metrics: (MultiCounter | MultiGauge | MultiHistogram)[] = []

  for (const metric of data) {
    // The options which are shared between the metrics
    const sharedOptions = {
      name: metric.key as Lowercase<string>,
      description: metric.description,
      labels: getLabelsFromMappedKeys(metric.labels),
      value: 0,
    }

    // Construct the metrics based on the type
    switch (metric.type) {
      case NativeMetricTypes.Counter:
        metrics.push(new MultiCounter(sharedOptions))
        break
      case NativeMetricTypes.Gauge:
        metrics.push(new MultiGauge(sharedOptions))
        break
      case NativeMetricTypes.Histogram:
        metrics.push(
          new MultiHistogram({
            ...sharedOptions,
            // The buckets for the histogram (if provided, otherwise default buckets are used)
            buckets: metric.buckets as number[] ?? [0.1, 0.3, 1.2, 5.0],
          }),
        )
        break
    }
  }

  return metrics
}

/**
 * Gets the labels from the mapped keys
 * @param labels The mapped keys
 * @returns The labels
 */
function getLabelsFromMappedKeys(labels: Record<string, any>) {
  return Object.keys(labels)
}
