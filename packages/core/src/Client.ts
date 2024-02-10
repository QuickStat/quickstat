import type { DataSource } from "./datasources/DataSource";
import type { INativeMetric, Metric } from "./metrics/Metric";

export interface ClientOptions<D extends DataSource=DataSource> {
    /**
     * The data source to persist the metrics on e.g. prometheus, influxdb, etc.
     */
    dataSource?: D;
    /**
     * The plugins to automatically collect the metrics from the application e.g. pm2, rest, etc.
     */
    plugins: any[];
    /**
     * The different metrics which are collected and persisted.
     */
    metrics: INativeMetric[];
}


/**
 * The client which contains the config for the data sources and plugins for collecting and persisting the metrics.
 */
export class Client<D extends DataSource=DataSource> {
    /** The data source to persist the metrics on e.g. prometheus, influxdb, etc. */
    dataSource?: D;
    /** The plugins to automatically collect the metrics from the application e.g. pm2, rest, etc. */
    plugins: any[];
    /** The different metrics which are collected and persisted. */
    metrics: INativeMetric[];
    constructor(options: ClientOptions<D>) {
        this.dataSource = options.dataSource;
        this.plugins = options.plugins;
        this.metrics = options.metrics;
    }

    /**
     * Register the metrics to the client.
     * @param metrics The metrics to register
     */
    registerMetrics(metrics: INativeMetric[]) {
        for (const metric of metrics) {
            this.registerMetric(metric);
        }
    }

    /**
     * Register a metric to the client.
     * @param metric The metric to register
     */
    registerMetric(metric: INativeMetric) {
        const hasMetric = this.metrics.find((m) => m.key === metric.key);
        if (hasMetric) {
            throw new Error(`The metric with the key ${metric.key} has already been registered.`);
        }
        this.metrics.push(metric);
    }

    /**
     * Register the data source to the client.
     * @param dataSource The data source to register
     */
    registerDataSource(dataSource: D = this.dataSource as D) {
        if (this.dataSource) {
            throw new Error("The data source has already been registered.");
        } else if (!dataSource) {
            throw new Error("The data source is not defined.");
        }

        this.dataSource = dataSource;
        this.dataSource.client = this;
    }
}