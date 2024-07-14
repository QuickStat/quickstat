import http from 'http'

import type { ObserveRestRequestOptions } from '@quickstat/rest'
import type { Request, Response } from 'express'

/**
 * Extracts the observation data from the request and response
 * @param req The express request
 * @param res The express response
 * @returns The observation data
 */
export function getObservationData(req: Request, res: Response): ObserveRestRequestOptions {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const path = req.route?.path || req.path

  return {
    method: req.method as ObserveRestRequestOptions['method'],
    path: path as string, // get the path with variables,
    status: res.statusCode,
    size: {
      request: req.socket.bytesRead,
      response: req.socket.bytesWritten,
    },
  }
}

/**
 * Randomly simulate requests to the given routes
 * @param baseUrl The base url
 * @param routes The routes to simulate requests to
 */
export function simulateRequests(baseUrl: string, routes: { [method: string]: string[] }) {
  // Use interval with 500ms, skip some requests, randomly select a route
  setInterval(() => {
    const method = Object.keys(routes)[Math.floor(Math.random() * Object.keys(routes).length)]
    const route = routes[method][Math.floor(Math.random() * routes[method].length)]

    console.log(`Simulating ${method} request to ${baseUrl}${route}`)

    http.request(`${baseUrl}${route.replace(':id', Math.floor(Math.random() * 100).toString())}`, { method }).end()
  }, 1000)
}

/**
 * Returns a random status code
 * @returns The random status code
 */
export function getRandomStatusCode() {
  const statusCodes = [200, 201, 204, 400, 401, 403, 404, 500, 502]
  return statusCodes[Math.floor(Math.random() * statusCodes.length)]
}
