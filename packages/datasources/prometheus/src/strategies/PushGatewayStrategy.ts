/**
 *  Contains some changes in comparison to the original source, but the useGateway method is very similar to the original one.
 *  Source: https://github.com/siimon/prom-client/blob/master/lib/pushgateway.js
 *  ###################################################################
 *  Copyright 2015 Simon Nyberg
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import * as http from 'node:http'
import * as https from 'node:https'
import * as url from 'node:url'
import { gzipSync } from 'node:zlib'

import { PromFileGenerator } from 'src'

import { BaseStrategy } from './BaseStrategy'

import type { BaseStrategyOptions } from './BaseStrategy'

/** The options for the push gateway strategy */
export interface PushGatewayStrategyOptions extends BaseStrategyOptions {
  /** The url for the push gateway */
  url: string
  /** The request options for the push gateway */
  requestOptions?: http.RequestOptions
  /** The auto push options for the push gateway */
  auto?: {
    /** The push interval for the push gateway */
    pushInterval: number
    /** The job name for the push gateway */
    jobName: string
  }
}

/**
 * The push gateway strategy for persisting the metrics
 */
export class PushGatewayStrategy extends BaseStrategy<PushGatewayStrategy> {
  /** The url for the push gateway */
  private url: string

  /** The request options for the push gateway */
  private requestOptions: http.RequestOptions

  /** The auto push interval to clear for the push gateway */
  private autoPushInterval?: Timer

  /**
   * Create a new push gateway strategy
   * @param options The options for the push gateway strategy
   */
  constructor(options: PushGatewayStrategyOptions) {
    super(options)
    this.url = options.url
    this.requestOptions = options.requestOptions || {}

    if (options.auto) {
      this.setUpAutoPush(options.auto)
    }
  }

  /**
   * Push the metrics to the push gateway
   * @param metrics The metrics to push
   * @param jobName The name of the job
   * @param groupings The groupings for the metrics
   */
  async push(metrics: string, jobName: string, groupings?: Record<string, string>) {
    return this.useGateway('POST', metrics, jobName, groupings)
  }

  /**
   * Update the metrics in the push gateway
   * @param metrics The metrics to update
   * @param jobName The name of the job
   * @param groupings The groupings for the metrics
   */
  async update(metrics: string, jobName: string, groupings?: Record<string, string>) {
    return this.useGateway('PUT', metrics, jobName, groupings)
  }

  /**
   * Delete the metrics from the push gateway
   * @param jobName The name of the job
   * @param groupings The groupings for the metrics
   */
  async delete(jobName: string, groupings?: Record<string, string>) {
    return this.useGateway('DELETE', '', jobName, groupings)
  }

  /**
   * Gets the metrics from the client
   */
  async getMetrics() {
    if (!this.dataSource) throw new Error('The data source is not set')

    const metrics = await this.dataSource.collect()
    return new PromFileGenerator(metrics).get()
  }

  /**
   * Push the metrics to the push gateway
   * @param method The method for the request
   * @param metrics The metrics to push
   * @param job The name of the job
   * @param groupings The groupings for the metrics
   * @returns The response from the push gateway
   * @throws An error if the push fails
   */
  private async useGateway(method: string, metrics: string | Buffer, job: string, groupings?: Record<string, string>) {
    const gatewayUrlParsed = new URL(this.url)
    const gatewayUrlPath = gatewayUrlParsed.pathname && gatewayUrlParsed.pathname !== '/' ? gatewayUrlParsed.pathname : ''
    const jobPath = job ? `/job/${encodeURIComponent(job)}${this.generateGroupings(groupings)}` : ''
    const path = `${gatewayUrlPath}/metrics${jobPath}`
    const target = url.resolve(this.url, path)
    const requestParams = new URL(target)
    const httpModule = this.isHttps(requestParams.href) ? https : http
    const options = Object.assign(requestParams, this.requestOptions, {
      method,
    })

    return new Promise((resolve, reject) => {
      if (method === 'DELETE' && options.headers) {
        delete options.headers['Content-Encoding']
      }
      const req = httpModule.request(options, resp => {
        let body = ''
        resp.setEncoding('utf8')
        resp.on('data', chunk => {
          body += chunk
        })
        resp.on('end', () => {
          if (resp.statusCode! >= 400) {
            reject(new Error(`push failed with status ${resp.statusCode}, ${body}`))
          } else {
            resolve({ resp, body })
          }
        })
      })
      req.on('error', err => {
        reject(err)
      })

      req.on('timeout', () => {
        req.destroy(new Error('Pushgateway request timed out'))
      })

      if (method !== 'DELETE') {
        if (options.headers && options.headers['Content-Encoding'] === 'gzip') {
          metrics = gzipSync(metrics)
        }
        req.write(metrics)
        req.end()
      } else {
        req.end()
      }
    })
  }

  /**
   * Generate the groupings for the metrics
   * @param groupings The groupings for the metrics
   * @returns The groupings for the metrics
   */
  private generateGroupings(groupings?: Record<string, string>): string {
    if (!groupings) {
      return ''
    }
    return Object.keys(groupings)
      .map(key => `/${encodeURIComponent(key)}/${encodeURIComponent(groupings[key]!)}`)
      .join('')
  }

  /**
   * Check if the url is https
   * @param href The url to check
   * @returns True if the url is https
   */
  private isHttps(href: string): boolean {
    return href.search(/^https/) !== -1
  }

  /**
   * Set up the auto push for the push gateway
   * @param options The auto push options for the push gateway
   */
  private setUpAutoPush(options: { pushInterval: number; jobName: string }) {
    clearInterval(this.autoPushInterval) // Clear the interval if it exists
    this.autoPushInterval = setInterval(() => {
      this.getMetrics().then(metrics => this.update(metrics, options.jobName))
    }, options.pushInterval)
  }
}
