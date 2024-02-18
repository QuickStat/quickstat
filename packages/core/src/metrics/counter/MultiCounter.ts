import { NativeCounter, type NativeCounterOptions } from './NativeCounter'

/** The options for the multi counter */
export type MultiCounterOptions = NativeCounterOptions

/**
 * Multi counters are used for tracking multiple increasing values based on a set of labels.
 */
export class MultiCounter extends NativeCounter {
  /**
   * Creates a new multi counter metric instance which holds the data points and the info for the metric.
   * @param options The options for the multi counter metric
   */
  constructor(options: MultiCounterOptions) {
    super(options)
  }

  /**
   * The value of the counter
   * @param labels The labels to set the counter to
   * @param value The value to set the counter to
   */
  public set(labels: string[], value: number) {
    super._set(labels, value)
  }

  /**
   * Increment the counter by a value
   * @param labels The labels to increment the counter by
   * @param value The value to increment by
   */
  public inc(labels: string[], value: number = 1) {
    super._inc(labels, value)
  }

  /**
   * Gets the total value of the counter
   */
  public getTotalValue() {
    return this.value
  }

  /**
   * Gets the value of the counter
   * @param labels The labels to get the counter for
   * @returns The total value of the counter or the value of the counter for the labels
   */
  public getValue(labels: string[] = []) {
    if (labels.length === 0) {
      return this.getTotalValue()
    }

    return this.values.find(value => value.labels.join() === labels.join())?.value || 0
  }
}
