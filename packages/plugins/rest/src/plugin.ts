import { Plugin, type PluginOptions } from '@quickstat/core'

/**
 * The options for the rest plugin.
 */
export interface RestPluginOptions extends PluginOptions {}

/**
 * The rest plugin to collect the rest specific api metrics
 */
export class RestPlugin extends Plugin {
  /**
   * The rest plugin to collect the rest specific api metrics
   * @param options The options for the rest plugin
   */
  constructor(options: RestPluginOptions) {
    super(options)
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
