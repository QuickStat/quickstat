import { NativeCounter, type NativeCounterOptions } from './NativeCounter'

/** The options for the single counter */
export type SingleCounterOptions = Omit<NativeCounterOptions, 'labels' | 'values'>

/**
 * Single counters are used for tracking a single value (increasing).
 */
export class SingleCounter extends NativeCounter {
  /**
   * Creates a new single counter metric instance which holds the data points and the info for the metric.
   * @param options The options for the single counter metric
   */
  constructor(options: SingleCounterOptions) {
    super({ ...options, labels: [] })
  }

  /**
   * The value of the counter
   * @param value The value to set the counter to
   */
  public set(value: number) {
    super._set([], value)
  }

  /**
   * Increment the counter by a value
   * @param value The value to increment by
   */
  public inc(value: number = 1) {
    super._inc([], value)
  }

  /**
   * Gets the value of the counter
   * @returns The value of the counter
   */
  public getValue() {
    return this.value
  }
}
