import { NativeHistogram } from './NativeHistogram'

import type { NativeHistogramOptions } from './NativeHistogram'

/** The options for the multi histogram */
export type MultiHistogramOptions = NativeHistogramOptions

/**
 * Multi histograms are used for tracking multiple distribution of a set of values based on a set of labels.
 */
export class MultiHistogram extends NativeHistogram {
  /**
   * Creates a new multi histogram metric instance which holds the data points and the info for the metric.
   * @param options The options for the multi histogram metric
   */
  constructor(options: MultiHistogramOptions) {
    super(options)
  }

  /**
   * Observe a value in the histogram
   * @param labels The labels to observe the value for
   * @param value The value to observe
   */
  public observe(labels: string[], value: number) {
    super._observe(labels, value)
  }

  /**
   * Observe a value in the histogram for a specific bucket
   * @param labels The labels to observe the value for
   * @param value The value to observe
   * @param bucket The bucket to observe the value in
   */
  public observeBucket(labels: string[], value: number, bucket: number) {
    super._observeBucket(labels, value, bucket)
  }

  /**
   * Gets the total sum of the observed value for the given bucket
   * @param labels The labels to get the sum for
   * @param bucket The bucket to get the sum for
   * @example The total time spent in requests that took less than 100ms -> histogram.getSum(["le:100"])
   */
  public getSum(labels: string[], bucket: number | '+Inf' = '+Inf') {
    return this.getDataPoint(labels, bucket)?.sum || 0
  }

  /**
   * Gets the count of the observed value for the given bucket
   * @param labels The labels to get the count for
   * @param bucket The bucket to get the count for
   * @example The number of requests that took less than 100ms -> histogram.getCount(["le:100"])
   */
  public getCount(labels: string[], bucket: number | '+Inf' = '+Inf') {
    return this.getDataPoint(labels, bucket)?.value || 0
  }

  /**
   * Gets the data point for the given labels and bucket
   * @param labels The labels to get the data point for
   * @param bucket The bucket to get the data point for
   * @returns The data point for the given labels and bucket
   */
  private getDataPoint(labels: string[], bucket: number | '+Inf' = '+Inf') {
    const requestedLabels = labels.slice() // Shallow copy the labels
    requestedLabels.unshift(bucket.toString())
    return this.values.find(value => value.labels.join() === requestedLabels.join())
  }
}
