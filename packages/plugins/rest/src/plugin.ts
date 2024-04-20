import { Plugin, type PluginOptions } from '@quickstat/core'
import { REST_METRICS, type REST_AVAILABLE_METRICS } from './metrics/metrics'

/**
 * The options for the rest plugin.
 */
export type RestPluginOptions = Omit<PluginOptions<REST_AVAILABLE_METRICS>, 'metrics'>
/**
 * The rest plugin to collect the rest specific api metrics
 */
export class RestPlugin extends Plugin {
  /**
   * The rest plugin to collect the rest specific api metrics
   * @param options The options for the rest plugin
   */
  constructor(options: RestPluginOptions = {}) {
    super({ ...options, metrics: REST_METRICS })
  }

  /**
   * Collects the metrics from the rest api
   * @param timestamp The timestamp the metrics where collected at
   * @returns The collected metrics
   */
  public async onCollect(timestamp: number) {
    return super.onCollect(timestamp)
  }
}
