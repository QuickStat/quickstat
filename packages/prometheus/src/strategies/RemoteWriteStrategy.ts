import { BaseStrategy, type BaseStrategyOptions } from './BaseStrategy'

/**
 * The options for the remote write strategy
 */
export interface RemoteWriteStrategyOptions extends BaseStrategyOptions {}

/**
 * The remote write strategy for persisting the metrics
 */
export class RemoteWriteStrategy extends BaseStrategy<RemoteWriteStrategy> {
  /**
   * The constructor for the remote write strategy
   * @param options The options for the remote write strategy
   */
  constructor(options: RemoteWriteStrategyOptions) {
    super(options)
  }
}
