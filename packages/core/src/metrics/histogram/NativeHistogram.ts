import { NativeMetricTypes } from 'src'
import { DataPoint } from 'src/datapoints/DataPoint'

import { Metric } from '../Metric'

import type { Client } from 'src/Client'
import type { DataPointLabelValue } from 'src/datapoints/DataPoint'
import type { INativeMetric, MetricOptions } from '../Metric'

/**
 * The options for the histogram metric.
 */
export interface NativeHistogramOptions extends MetricOptions<NativeHistogram> {
  buckets: number[]
  /** The reset options for the histogram */
  reset?: {
    /** The values to reset the histogram to */
    values?: (histogram: NativeHistogram) => void
    /** The interval to reset the histogram at */
    interval?: number
  }
}

/**
 * Histograms are used for tracking the distribution of a set of values.
 * @example "Response latency distribution."
 */
export class NativeHistogram extends Metric<NativeHistogram> implements INativeMetric<NativeHistogram> {
  type: NativeMetricTypes = NativeMetricTypes.Histogram

  /** The sum of the observed values */
  value: number = 0

  /** The values of the histogram */
  values: DataPointLabelValue[]

  /** The buckets for the histogram */
  buckets: number[]
  /** The reset options for the histogram */
  resetOption: {
    /** The values to reset the histogram to */
    values: (histogram: NativeHistogram) => void
    /** The interval to reset the histogram at */
    interval: number
  }
  /**
   * The interval to reset the histogram at
   */
  private interval?: Timer

  /**
   * Creates a new histogram metric instance which holds the data points and the info for the metric.
   * @param options The options for the histogram metric
   */
  constructor(options: NativeHistogramOptions) {
    super(options)
    this.buckets = options.buckets.sort((a, b) => a - b)

    // Freeze the buckets array to prevent any modifications
    Object.freeze(this.buckets)

    // Add "le" label before the first label
    this.labels.unshift('le')

    this.resetOption = {
      values: options.reset?.values || ((histogram: NativeHistogram) => {
        histogram.values = []
      }),
      interval: options.reset?.interval || -1,
    }

    this.values = []

    // Set up the reset interval if enabled
    this.setUpReset()

    // Validate the histogram options
    this.validateOptions()
  }

  /**
   * Observe the given value.
   * @param labels The labels of the histogram e.g. ['status','200']
   * @param observedValue The value to observe
   */
  protected _observe(labels: string[], observedValue: number = 1) {
    this.value += observedValue

    // Gets all bucket values which are less than or equal to the value + "+Inf"
    const buckets = this.getBucketValues(observedValue)

    // Increment the histogram for each bucket value on +1
    // -> +Inf is always incremented by 1 -> total count
    buckets.forEach(bucket => {
      this._observeBucket(labels, bucket, observedValue)
    })

    this.snapshot()
  }

  /**
   * Observe the given bucket by incrementing the value by 1.
   * @param labels The labels of the histogram e.g. ['status','200']
   * @param bucket The bucket to observe
   * @param observedValue The observed value
   */
  protected _observeBucket(labels: string[], bucket: number | '+Inf', observedValue: number = 0) {
    const bucketLabels = labels.slice(0) // Shallow copy the labels
    bucketLabels.unshift(bucket.toString()) // Add "le" label before the first label

    this.validateLabels(bucketLabels)
    const index = this.values.findIndex(value => value.labels.join() === bucketLabels.join())
    if (index === -1) {
      this.values.push({ labels: bucketLabels, value: 1, sum: observedValue })
    } else {
      this.values[index]!.value += 1
      this.values[index]!.sum += observedValue
    }
  }

  /**
   * Return an array of the bucket values for the given value which is less than or equal to the value.
   * @param value The value to find the bucket for
   * @returns The bucket values for the given value
   */
  protected getBucketValues(value: number): (number | '+Inf')[] {
    const buckets: (number | '+Inf')[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]!) {
        buckets.push(this.buckets[i]!)
      }
    }

    // All
    buckets.push('+Inf')
    return buckets
  }

  /**
   * Set new buckets for the histogram.
   * @param buckets The new buckets for the histogram
   */
  protected _setBuckets(buckets: number[]) {
    this.buckets = buckets.sort((a, b) => a - b)
  }

  /**
   * Collect the histogram metric.
   * @param timestamp The timestamp of the data point
   */
  public async collect(timestamp: number = Date.now()): Promise<DataPoint> {
    await super.executeOnCollect(this)
    const dataPoint = this.snapshot(timestamp, true) // Snapshot the current value and values of the histogram to the data points manager
    await super.executeAfterCollect(this)
    return dataPoint
  }

  /**
   * Reset the histogram with the custom provided function or the default one.
   */
  public reset() {
    return this.resetOption.values(this)
  }

  /**
   * Increment the histogram by the given value.
   * @param value The value to increment the histogram by
   */
  protected validateOptions() {
    if (this.resetOption?.interval != -1 && this.resetOption?.interval < 1) {
      throw new Error('The interval of the histogram reset must be bigger than 0.')
    }
  }

  /**
   * Snapshot the current value and values of the histogram to the data points manager.
   * @param timestamp The timestamp of the data point
   * @param createdOnCollect Whether the data point has been created on collect
   */
  protected snapshot(timestamp: number = Date.now(), createdOnCollect: boolean = false): DataPoint {
    const dataPoint = DataPoint.from({ timestamp, value: this.value, values: this.values, createdOnCollect })
    this.dataPoints.add(dataPoint)
    return dataPoint
  }

  /**
   * Register histogram to the client.
   * @param client The client to register the histogram to
   */
  public register(client: Client) {
    client.registerMetric(this)
  }

  /**
   * Function called by metrics manager to remove intervals and properly detach the metric for deletion.
   */
  public _clear() {
    super._clear()
    clearInterval(this.interval)
  }

  /**
   * Set up the reset interval if enabled.
   */
  private setUpReset() {
    clearInterval(this.interval)
    if (this.resetOption.interval > 0) {
      this.interval = setInterval(() => {
        this.reset()
      }, this.resetOption.interval)
    }
  }
}
