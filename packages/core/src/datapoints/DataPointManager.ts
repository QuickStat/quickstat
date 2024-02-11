import type { DataPoint } from './DataPoint'

/**
 * DataPointManager stores the DataPoints on the native metrics in the application.
 */
export class DataPointManager {
  /** The data points for the native metrics */
  dataPoints: Map<number, DataPoint>

  /** Construct a new data point manager instance */
  constructor() {
    this.dataPoints = new Map()
  }

  /**
   * Clear the data points from the data point manager.
   */
  clear(): void {
    this.dataPoints.clear()
  }

  /**
   * Add a new data point to the data point manager.
   * @param dataPoint The data point to add
   */
  add(dataPoint: DataPoint) {
    this.dataPoints.set(dataPoint.timestamp, dataPoint)
  }

  /**
   * Get the data points from the data point manager.
   * @param timestamp The timestamp of the data point
   */
  get(timestamp: number) {
    return this.dataPoints.get(timestamp)
  }

  /**
   * Remove the data point from the data point manager.
   * @param timestamp The timestamp of the data point
   */
  remove(timestamp: number) {
    this.dataPoints.delete(timestamp)
  }

  /**
   * Get the data points from the data point manager.
   */
  getAll() {
    return this.dataPoints
  }

  /**
   * Filter the data points from the data point manager.
   * @param callback The callback to filter the data points
   */
  filter(callback: (dataPoint: DataPoint) => boolean) {
    return Array.from(this.dataPoints.values()).filter(callback)
  }

  /**
   * Map the data points from the data point manager.
   * @param callback The callback to map the data points
   */
  map(callback: (dataPoint: DataPoint) => any) {
    return Array.from(this.dataPoints.values()).map(callback)
  }
}
