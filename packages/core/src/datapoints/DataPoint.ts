import type { NativeMetricTypes } from "src/shared/types"

/**
 * The options for the data point.
 */
export interface DataPointOptions {
    /** The value of the data point */
    value: number
    /** The sum of the observed values */
    sum?: number
    /** The timestamp of the data point */
    timestamp: number
    /** The values of the data point */
    values: DataPointLabelValue[]
    /** Whether the data point has been created on collect */
    createdOnCollect: boolean
}

/**
 * The value based on the labels
 */
export interface DataPointLabelValue {
    /** The labels of the data point */
    labels: string[]
    /** The value of the data point */
    value: number
    /** The sum of the observed values. Counter & Gauge has the same value as 'value' */
    sum: number
}

/**
 * The data point for the metric.
 */
export class DataPoint {
    /** The value of the data point */
    value: number
    /** The values of the data point */
    values: DataPointLabelValue[]
    /** The timestamp of the data point */
    timestamp: number
    /** Whether the data point has been created on collect */
    createdOnCollect: boolean

    /**
     * Construct a new data point instance which holds the value and the timestamp for the data point.
     * @param options The options for the data point
     */
    constructor(options: DataPointOptions) {
        this.value = options.value
        this.values = options.values
        this.timestamp = options.timestamp
        this.createdOnCollect = options.createdOnCollect
    }

    /**
     * Creates a new data point instance from the given data.
     * @param data The data for the data point
     * @returns The new data point instance
     */
    static from(data: DataPointOptions) {
        return new DataPoint(data)
    }

    /**
     * Returns a new data point instance which is a clone of the current data point.
     * @returns The new data point instance
     */
    clone() {
        return new DataPoint({
            value: this.value,
            timestamp: this.timestamp,
            values: this.values.map((val) => {
                return {
                    labels: val.labels.slice(),
                    value: val.value,
                    sum: val.sum
                }
            }), // shallow copy
            createdOnCollect: this.createdOnCollect
        })
    }
}