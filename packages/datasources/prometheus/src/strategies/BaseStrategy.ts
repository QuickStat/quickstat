import type { PrometheusDataSource } from 'src/PrometheusDataSource'

/**
 * The options for the base strategy
 */
export interface BaseStrategyOptions {}

/**
 * The base strategy for the scrape, remote write and push gateway strategies
 * @template ST The type of the strategy
 */
export class BaseStrategy<ST extends BaseStrategy<ST>> {
  /**
   * The data source for the scrape strategy
   * @template ST The type of the strategy
   */
  dataSource?: PrometheusDataSource<ST>

  /**
   * The constructor for the base strategy
   * @param options The options for the base strategy
   */
  constructor(_options: BaseStrategyOptions = {}) {
  }

  /**
   * Set the data source for the scrape strategy
   * @param dataSource The data source for the scrape strategy
   */
  setDataSource(dataSource: PrometheusDataSource<ST>) {
    this.dataSource = dataSource
  }
}
