import { NativeGauge } from './NativeGauge'

import type { NativeGaugeOptions } from './NativeGauge'

/** The options for the single gauge */
export type SingleGaugeOptions = Omit<NativeGaugeOptions, 'labels' | 'values'>

/** The single gauge is used for tracking a single value (decreasing). */
export class SingleGauge extends NativeGauge {
  /**
   * Creates a new single gauge metric instance which holds the data points and the info for the metric.
   * @param options The options for the single gauge metric
   */
  constructor(options: SingleGaugeOptions) {
    super(options)
  }

  /**
   * The value of the gauge
   * @param value The value to set the gauge to
   */
  public set(value: number) {
    super._set([], value)
  }

  /**
   * Increment the gauge by a value
   * @param value The value to increment by
   */
  public inc(value: number = 1) {
    super._inc([], value)
  }

  /**
   * Decrement the gauge by a value
   * @param value The value to decrement by
   */
  public dec(value: number = 1) {
    super._dec([], value)
  }

  /**
   * Gets the value of the gauge
   * @returns The value of the gauge
   */
  public getValue() {
    return this.value
  }
}
