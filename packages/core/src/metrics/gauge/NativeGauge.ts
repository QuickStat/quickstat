import { NativeCounter } from '../counter/NativeCounter'

import type { NativeCounterOptions } from '../counter/NativeCounter'

/** The options for the native gauge */
export type NativeGaugeOptions = NativeCounterOptions

/**
 * Gauges represent a single numerical value that can go up or down
 * @example "The current number of active threads in a thread pool."
 */
export class NativeGauge extends NativeCounter {
  /**
   * The constructor for the gauge
   * @param options The options for the gauge
   */
  constructor(options: NativeGaugeOptions) {
    super(options)
  }

  /**
   * Decrement the gauge by a value
   * @param labels The labels of the gauge e.g. ['method', 'path']=['GET', '/test']
   * @param value The value to decrement by e.g. 1
   */
  protected _dec(labels: string[], value: number = 1) {
    value = Math.abs(value)
    this.value -= value

    if (labels.length > 0) {
      this.validateLabels(labels)

      const index = this.values.findIndex(value => value.labels.join() === labels.join())
      if (index === -1) {
        this.values.push({ labels, value, sum: value })
      } else {
        this.values[index]!.value -= value
      }
    }

    super.snapshot()
  }
}
