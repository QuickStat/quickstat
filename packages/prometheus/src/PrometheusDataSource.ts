import { DataSource, type DataSourceOptions } from '@quickstat/core'
import type { ScrapeStrategy } from './strategies/ScrapeStrategy'
import type { RemoteWriteStrategy } from './strategies/RemoteWriteStrategy'
import type { PushGatewayStrategy } from './strategies/PushGatewayStrategy'
import { BaseStrategy } from './strategies/BaseStrategy'

/** The options for the prometheus data source */
export interface PrometheusDataSourceOptions<ST> extends DataSourceOptions {
  /** The strategy for collecting the metrics e.g. scrape (pull), remote write (push) and gateway (push) */
  strategy?: ST
}

/**
 * The prometheus data source which offers different strategies for persisting the metrics.
 */
export class PrometheusDataSource<ST extends BaseStrategy<ST> = ScrapeStrategy> extends DataSource {
  /** The strategy for persisting the metrics */
  strategy?: ST
  constructor(options: PrometheusDataSourceOptions<ST>) {
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
