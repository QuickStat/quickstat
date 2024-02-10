import type { PrometheusDataSource } from "src/PrometheusDataSource";

/**
 * The options for the base strategy
 */
export interface BaseStrategyOptions { }

/**
 * The base strategy for the scrape, remote write and push gateway strategies
 */
export class BaseStrategy<ST extends BaseStrategy<ST>> {
    /**
     * The data source for the scrape strategy
     */
    dataSource?: PrometheusDataSource<ST>;
    constructor(options: BaseStrategyOptions) {

    }

    /**
     * Set the data source for the scrape strategy
     * @param dataSource The data source for the scrape strategy
    */
    setDataSource(dataSource: PrometheusDataSource<ST>) {
        this.dataSource = dataSource;
    }
}