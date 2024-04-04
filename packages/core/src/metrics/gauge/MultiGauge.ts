import { NativeGauge } from './NativeGauge'

import type { NativeGaugeOptions } from './NativeGauge'

/**
 * The options for the multi gauge with labels
 */
export type MultiGaugeOptions = NativeGaugeOptions

/**
 * Multi gauges are used for tracking multiple increasing and decreasing values based on a set of labels.
 */
export class MultiGauge extends NativeGauge {
  /**
   * Creates a new multi gauge metric instance which holds the data points and the info for the metric.
   * @param options The options for the multi gauge metric
   */
  constructor(options: MultiGaugeOptions) {
    super(options)
  }

  /**
   * The value of the gauge
   * @param labels The labels to set the gauge to
   * @param value The value to set the gauge to
   */
  public set(labels: string[], value: number) {
    super._set(labels, value)
  }

  /**
   * Increment the gauge by a value
   * @param labels The labels to increment the gauge by
   * @param value The value to increment by
   */
  public inc(labels: string[], value: number = 1) {
    super._inc(labels, value)
  }

  /**
   * Decrement the gauge by a value
   * @param labels The labels to decrement the gauge by
   * @param value The value to decrement by
   */
  public dec(labels: string[], value: number = 1) {
    super._dec(labels, value)
  }

  /**
   * Gets the total value of the gauge
   */
  public getTotalValue() {
    return this.value
  }

  /**
   * Gets the value of the gauge
   * @param labels The labels to get the gauge for
   * @returns The total value of the gauge or the value of the gauge for the labels
   */
  public getValue(labels: string[] = []) {
    if (labels.length === 0) {
      return this.getTotalValue()
    }

    return this.values.find(value => value.labels.join() === labels.join())?.value || 0
  }
}
