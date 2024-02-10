import { Gauge, NativeCounter, Client as QuickStatClient, NativeHistogram } from "@quickstat/core";
import type { PrometheusDataSource } from "@quickstat/prometheus";
import dataSource from "./datasources/prometheus/ScrapeDataSource";

const quickStatClient = new QuickStatClient<PrometheusDataSource>({
    metrics: [],
    plugins: []
});

const requestsCounter = new NativeCounter({
    name: "requests",
    value: 0,
    description: "The total number of requests.",
    labels: ["method", "status"]
});

const activeThreadsCounter = new Gauge({
    name: "active_threads",
    value: 0,
    description: "The total number of active threads."
});

const nativeHistogramm = new NativeHistogram({
    name: "http_request_duration_seconds",
    description: "The HTTP request duration in seconds.",
    labels: ["method", "status"],
    buckets: [0.1, 0.3, 1.2, 5.0  ]
});

// Register the metrics
quickStatClient.registerMetric(requestsCounter);
quickStatClient.registerMetric(activeThreadsCounter);
quickStatClient.registerMetric(nativeHistogramm);

// Register the data source
quickStatClient.registerDataSource(dataSource);

setInterval(async () => {
    requestsCounter.inc(["GET","200"], 2);
    activeThreadsCounter.inc([], 3);
}, 1000);

setInterval(async () => {
    nativeHistogramm.observe(["GET","200"], Math.random()*100000000000);
}, 100);


// HTTP Server
import http from "http";
http.createServer(async (req, res) => {
    requestsCounter.inc(["PROM","200"], 1);
    const response = await quickStatClient.dataSource?.strategy?.getResponse();
    console.log(response);
    res.writeHead(200, response?.headers);
    res.end(response?.file);
}).listen(3242);