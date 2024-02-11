import { DataSource, type DataSourceOptions } from '@quickstat/core'
import type { ScrapeStrategy } from './strategies/ScrapeStrategy'
import { BaseStrategy } from './strategies/BaseStrategy'

/**
 * The options for the prometheus data source
 * @template ST The type of the strategy
 */
export interface PrometheusDataSourceOptions<ST> extends DataSourceOptions {
  /** The strategy for collecting the metrics e.g. scrape (pull), remote write (push) and gateway (push) */
  strategy?: ST
}

/**
 * The prometheus data source which offers different strategies for persisting the metrics.
 * @template ST The type of the strategy
 */
export class PrometheusDataSource<ST extends BaseStrategy<ST> = ScrapeStrategy> extends DataSource {
  /** The strategy for persisting the metrics */
  strategy?: ST

  /**
   * The constructor for the prometheus data source
   * @param options The options for the prometheus data source
   * @template ST The type of the strategy
   */
  constructor(options: PrometheusDataSourceOptions<ST> = {}) {
    super(options)
    if (options.strategy) this.setStrategy(options.strategy)
  }

  /**
   * Set the strategy for persisting the metrics
   * @param strategy The strategy for persisting the metrics
   */
  setStrategy(strategy: ST) {
    this.strategy = strategy
    this.strategy.setDataSource(this)
  }
}
