import type { NativeMetricTypes } from 'src'
import type { Client } from 'src/Client'
import type { DataPoint, DataPointLabelValue } from 'src/datapoints/DataPoint'
import { DataPointManager } from 'src/datapoints/DataPointManager'
import { normalizeLabelName } from 'src/shared/utils'

/**
 * The options for the metric.
 * @template T The type of the metric
 */
export interface MetricOptions<T> {
  /** The name of the metric. Do not any of these reserved suffixes '_total', '_sum' e.g. 'requests' -> 'requests_total' */
  name: Lowercase<string>
  /** The description of the metric */
  description: string
  /** The labels of the metric */
  labels?: string[]
  /** The callback to call when the metric is collected */
  onCollect?: (metric: T) => void | Promise<void>
  /** The callback to call after the metric is collected */
  afterCollect?: (metric: T) => void | Promise<void>
}

/**
 * Base metric containing the data points and the info for the metric.
 * @template T The type of the metric
 */
export class Metric<T> {
  /** The unique key for the metric */
  key: string
  /** The name of the metric */
  name: Lowercase<string>
  /** The description of the metric */
  description: string
  /** The labels of the metric */
  labels: Lowercase<string>[]
  /** The callback to call when the metric is collected */
  onCollect?: (metric: T) => void | Promise<void>
  /** The callback to call after the metric is collected */
  afterCollect?: (metric: T) => void | Promise<void>
  /** The data points of the metric */
  dataPoints: DataPointManager
  /**
   * Construct a new metric instance which holds the data points and the info for the metric.
   * @param options The options for the metric
   */
  constructor(options: MetricOptions<T>) {
    this.name = normalizeLabelName(options.name)
    this.description = options.description
    this.labels = options.labels ? options.labels.map(normalizeLabelName) : []
    // @TODO Check whether this required this.name + (this.labels.length > 0 ? `{${this.labels.join(',')}}` : '')
    this.key = this.name // + (this.labels.length > 0 ? `{${this.labels.join(',')}}` : '')
    this.onCollect = options.onCollect
    this.afterCollect = options.afterCollect
    this.dataPoints = new DataPointManager()

    this.validateOptions()
  }

  /**
   * Validates the metric options.
   */
  protected validateOptions() {
    if (this.name.length === 0) {
      throw new Error('The name of the metric cannot be empty.')
    }
    if (this.labels.length > 0) {
      // Check if the label names are not empty
      this.labels.forEach(label => {
        if (label.length === 0) {
          throw new Error('The label name cannot be empty.')
        }
      })

      // Check if the labels are unique
      const uniqueLabels = new Set(this.labels)
      if (uniqueLabels.size !== this.labels.length) {
        throw new Error('The labels of the metric must be unique.')
      }
    }
  }

  /**
   * Calls the collect callback.
   * @param instance The instance of the metric
   */
  async executeOnCollect(instance: T): Promise<void> {
    await this.onCollect?.(instance)
  }

  /**
   * Calls the after collect callback.
   * @param instance The instance of the metric
   */
  async executeAfterCollect(instance: T): Promise<void> {
    if (this.afterCollect) {
      await this.afterCollect(instance)
    } else {
      this.dataPoints.clear() // Clear the data points after the collect
    }
  }

  /**
   * Validate that the given labels equals the metric labels.
   * @param labels The labels to validate
   */
  protected validateLabels(labels: string[]) {
    if (labels.length !== this.labels.length) {
      throw new Error('The number of labels does not match the number of label names.')
    }
  }
}

/**
 * The native metric containing the data points and the info for the native metric.
 * @template T The type of the native metric
 */
export interface INativeMetric<T = never> extends Metric<T> {
  /** The type of the native metric */
  type: NativeMetricTypes
  /** Collect the metric */
  collect(timestamp: number): Promise<DataPoint>
  /** Register the metric to the client */
  register(client: Client): void
}
