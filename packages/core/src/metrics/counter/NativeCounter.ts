import { DataPoint } from 'src/datapoints/DataPoint'

import { Metric } from '../Metric'

import type { Client } from 'src/Client'
import type { DataPointLabelValue } from 'src/datapoints/DataPoint'
import type { INativeMetric, MetricOptions } from '../Metric'
import { NativeMetricTypes } from 'src/shared/types'

/**
 * The options for the counter metric.
 */
export interface NativeCounterOptions extends MetricOptions<NativeCounter> {
  /** The initial value of the counter */
  value?: number
  /** The initial values of the counter with label info */
  values?: DataPointLabelValue[]

  /** The reset options for the counter */
  reset?: {
    /** The value to reset the counter to */
    value?: (counter: NativeCounter) => void
    /** The interval to reset the counter at */
    interval?: number
  }
}

/**
 * Counters are used for tracking cumulative values that can only increase over time.
 * @example "Number of http requests processed by a web server."
 */
export class NativeCounter extends Metric<NativeCounter> implements INativeMetric<NativeCounter> {
  type: NativeMetricTypes = NativeMetricTypes.Counter
  /** The initial value of the counter */
  protected value: number
  /** The values of the counter */
  protected values: DataPointLabelValue[]
  /** The reset options for the counter */
  private resetOption: {
    /** The value to reset the counter to */
    value: (counter: NativeCounter) => void
    /** The interval to reset the counter at */
    interval: number
  }
  /**
   * The interval to reset the counter at
   */
  private interval?: Timer

  /**
   * Creates a new counter metric instance which holds the data points and the info for the metric.
   * @param options The options for the counter metric
   */
  constructor(options: NativeCounterOptions) {
    super(options)
    this.value = options.value || 0
    this.values = options.values || []
    this.resetOption = {
      value: options.reset?.value || ((counter: NativeCounter) => {
        counter.value = 0
        counter.values = []
      }),
      interval: options.reset?.interval || -1,
    }

    // Set up the reset interval if enabled
    this.setUpReset()

    // Validate the counter options
    this.validateOptions()
  }

  /**
   * Set the counter to the given value.
   * @param labels The labels of the counter e.g. ['method', 'path']=['GET', '/test']
   * @param value The value to set the counter to e.g. 1
   */
  protected _set(labels: string[], value: number = 0) {
    this.value = value

    if (labels.length > 0) {
      this.validateLabels(labels)

      const index = this.values.findIndex(value => value.labels.join() === labels.join())
      if (index === -1) {
        this.values.push({ labels, value, sum: value })
      } else {
        this.values[index]!.value = value
      }
    }

    this.snapshot()
  }

  /**
   * Increment the counter by the given value.
   * @param labels The labels of the counter e.g. ['method', 'path']=['GET', '/test']
   * @param value The value to increment the counter by e.g. 1
   */
  protected _inc(labels: string[], value: number = 1) {
    const incValue = Math.abs(value)
    this.value += incValue

    if (labels.length > 0) {
      this.validateLabels(labels)

      const index = this.values.findIndex(value => value.labels.join() === labels.join())
      if (index === -1) {
        this.values.push({ labels, value: incValue, sum: incValue })
      } else {
        this.values[index]!.value += incValue
        this.values[index]!.sum += incValue
      }
    }

    this.snapshot()
  }

  /**
   * Snapshot the current value and values of the counter to the data points manager.
   * @param timestamp The timestamp of the data point
   * @param createdOnCollect Whether the data point has been created on collect
   */
  protected snapshot(timestamp: number = Date.now(), createdOnCollect: boolean = false): DataPoint {
    const dataPoint = DataPoint.from({ timestamp, value: this.value, values: this.values, createdOnCollect })
    this.dataPoints.add(dataPoint)
    return dataPoint
  }

  /**
   * Increment the counter by the given value.
   * @param value The value to increment the counter by
   */
  protected validateOptions() {
    if (this.value < 0) {
      throw new Error('The value of the counter cannot be negative.')
    }

    if (this.resetOption?.interval != -1 && this.resetOption?.interval < 1) {
      throw new Error('The interval of the counter reset must be bigger than 0.')
    }
  }

  /**
   * Collect the counter metric.
   * @param timestamp The timestamp of the data point
   */
  public async collect(timestamp: number = Date.now()): Promise<DataPoint> {
    await super.executeOnCollect(this)
    const dataPoint = this.snapshot(timestamp, true) // Snapshot the current value and values of the counter to the data points manager
    await super.executeAfterCollect(this)
    return dataPoint
  }

  /**
   * Reset the counter with the custom provided function or the default one.
   */
  public reset() {
    return this.resetOption.value(this)
  }

  /**
   * Function called by metrics manager to remove intervals and properly detach the metric for deletion.
   */
  public _clear() {
    super._clear()
    clearInterval(this.interval)
  }

  /**
   * Register the counter to the client.
   * @param client The client to register the counter to
   */
  public register(client: Client) {
    client.registerMetric(this)
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
