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
    | 'rest_response_size'// The size of the response in bytes.