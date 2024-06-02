import type { Client, MultiCounter, MultiHistogram } from '@quickstat/core'

/**
 * The options for the rest request observation
 */
export interface ObserveRestRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'
  path: string | string[]
  status: number
  size?: {
    request: number
    response: number
  }
}

/**
 * Starts observing the rest request for the latency and the request count
 */
export class RestRequestObserver {
  /* The client to observe the rest request for */
  private client: Client

  /* The start time of the request */
  public startedAt: number

  /**
   * Starts observing the rest request for the latency and the request count
   */
  constructor(client: Client) {
    this.client = client
    this.startedAt = performance.now()
  }

  /**
   * Starts the observation
   */
  public start() {
    this.startedAt = performance.now()
  }

  /**
   * Ends the observation
   * @param options The options for the rest request
   */
  public end(options: ObserveRestRequestOptions) {
    // Values to observe
    const duration = performance.now() - this.startedAt
    const method = options.method
    const path = Array.isArray(options.path) ? options.path.join('/') : options.path
    const status = options.status
    const requestSize = options.size?.request
    const responseSize = options.size?.response

    const labelValues = [method, path, status.toString()]

    const countMetric = this.client.metrics.get<MultiCounter>('rest_request')
    const durationMetric = this.client.metrics.get<MultiHistogram>('rest_request_duration')
    const requestSizeMetric = this.client.metrics.get<MultiHistogram>('rest_request_size')
    const responseSizeMetric = this.client.metrics.get<MultiHistogram>('rest_response_size')

    // Increment the request count
    countMetric?.inc(labelValues)
    // Observe the request duration
    durationMetric?.observe(labelValues, duration)
    // Observe the request size
    if (requestSize) requestSizeMetric?.observe(labelValues, requestSize)
    // Observe the response size
    if (responseSize) responseSizeMetric?.observe(labelValues, responseSize)
  }
}
