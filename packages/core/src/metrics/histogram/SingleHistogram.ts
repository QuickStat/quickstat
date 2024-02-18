import { NativeHistogram, type NativeHistogramOptions } from './NativeHistogram'

/** The options for the single histogram */
export type SingleHistogramOptions = Omit<NativeHistogramOptions, 'labels' | 'values'>

/** The single histogram is used for observing the distribution of a set of values. */
export class SingleHistogram extends NativeHistogram {
  /**
   * Creates a new single histogram metric instance which holds the data points and the info for the metric.
   * @param options The options for the single histogram metric
   */
  constructor(options: SingleHistogramOptions) {
    super(options)
  }

  /**
   * Observe a value in the histogram
   * @param value The value to observe
   */
  public observe(value: number) {
    super._observe([], value)
  }

  /**
   * Observe a value in the histogram for a specific bucket
   * @param value The value to observe
   * @param bucket The bucket to observe the value in
   */
  public observeBucket(value: number, bucket: number) {
    super._observeBucket([], value, bucket)
  }

  /**
   * Gets the total sum of the observed value for the given bucket
   * @param bucket The bucket to get the sum for
   * @example The total time spent in requests that took less than 100ms -> histogram.getSum(100)
   */
  public getSum(bucket: number | '+Inf' = '+Inf') {
    if (bucket === '+Inf') {
      return this.value
    } else {
      return this.values.find(value => value.labels[0]?.toString() == bucket.toString())?.sum || 0
    }
  }

  /**
   * Gets the count of the observed value for the given bucket
   * @param bucket The bucket to get the count for
   * @example The number of requests that took less than 100ms -> histogram.getCount(100)
   */
  public getCount(bucket: number | '+Inf' = '+Inf') {
    return this.values.find(value => value.labels[0]?.toString() == bucket.toString())?.value || 0
  }
}
