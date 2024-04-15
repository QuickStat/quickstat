import { NativeMetricTypes, createInstanceFromRawMetric, type RawMetricType } from '@quickstat/core'

export const REST_BASE_LABELS = ['method', 'path', 'status']

/**
 * The available metrics for the rest plugin
 */
export type REST_AVAILABLE_METRICS =
  // {method, path, status}
  | 'rest_request' // Total number of requests received by the REST service.
  // {method, path, status} , buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30, 60]
  | 'rest_request_duration' // The duration of one request in milliseconds.
  // {method, path, status} , buckets: [1, 10, 100, 1000, 10000, 100000]
  | 'rest_request_size' // The size of the request in bytes.
  // {method, path, status} , buckets: [1, 10, 100, 1000, 10000, 100000]
  | 'rest_response_size' // The size of the response in bytes.

/**
 * The raw metric type for the rest plugin
 */
export type RestRawMetricType = RawMetricType<REST_AVAILABLE_METRICS>

/**
 * Contains the metadata for the rest metrics
 */
export const REST_METRICS_RAW: RestRawMetricType[] = [
  {
    name: 'rest_request',
    type: NativeMetricTypes.Counter,
    description: 'Total number of requests received by the REST service.',
    labels: REST_BASE_LABELS,
  },
  {
    name: 'rest_request_duration',
    type: NativeMetricTypes.Histogram,
    description: 'The duration of one request in milliseconds.',
    buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30, 60],
    labels: REST_BASE_LABELS,
  },
  {
    name: 'rest_request_size',
    type: NativeMetricTypes.Histogram,
    description: 'The size of the request in bytes.',
    buckets: [1, 10, 100, 1000, 10000, 100000],
    labels: REST_BASE_LABELS,
  },
  {
    name: 'rest_response_size',
    type: NativeMetricTypes.Histogram,
    description: 'The size of the response in bytes.',
    buckets: [1, 10, 100, 1000, 10000, 100000],
    labels: REST_BASE_LABELS,
  },
]

/**
 * The rest metrics instances from the raw metrics
 */
export const REST_METRICS = REST_METRICS_RAW.map(createInstanceFromRawMetric)
