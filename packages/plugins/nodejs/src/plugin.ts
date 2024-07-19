import { Plugin } from '@quickstat/core'

import { NODEJS_METRICS } from './metrics/metrics'

import type { PluginOptions } from '@quickstat/core'
import type { NODEJS_AVAILABLE_METRICS } from './metrics/metrics'

/**
 * The options for the rest plugin.
 */
export type NodeJsPluginOptions = Omit<PluginOptions<NODEJS_AVAILABLE_METRICS>, 'metrics'>
/**
 * The rest plugin to collect the rest specific api metrics
 */
export class NodeJsPlugin extends Plugin {
  /**
   * The rest plugin to collect the rest specific api metrics
   * @param options The options for the rest plugin
   */
  constructor(options: NodeJsPluginOptions = {}) {
    super({ ...options, metrics: NODEJS_METRICS })
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
