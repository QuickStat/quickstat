import { PromFileGenerator } from 'src'

import { BaseStrategy } from './BaseStrategy'

import type { BaseStrategyOptions } from './BaseStrategy'

/**
 * The options for the scrape strategy
 */
export interface ScrapeStrategyOptions extends BaseStrategyOptions {
}

/**
 * The scrape strategy for collecting the metrics
 * @template ST The type of the strategy
 */
export class ScrapeStrategy extends BaseStrategy<ScrapeStrategy> {
  /**
   * The constructor for the scrape strategy
   * @param options The options for the scrape strategy
   */
  constructor(options: ScrapeStrategyOptions = {}) {
    super(options)
  }

  /**
   * Get the response for the scrape strategy
   */
  async getResponse() {
    if (!this.dataSource) throw new Error('The data source is not set')

    const metrics = await this.dataSource.collect()
    const file = new PromFileGenerator(metrics).get()

    return {
      file,
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  }
}
