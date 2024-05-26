import { ObserveRestRequestOptions } from '@quickstat/rest'
import { Request, Response } from 'express'
import http from 'http'

/**
 * Extracts the observation data from the request and response
 * @param req The express request
 * @param res The express response
 * @returns The observation data
 */
export function getObservationData(req: Request, res: Response): ObserveRestRequestOptions {
  return {
    method: req.method as ObserveRestRequestOptions['method'],
    // @TODO use path params to automatically replace the ids
    path: req.path.replace(/\d+/g, ':id'),
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
  let lastRoute = ''
  setInterval(() => {
    const method = Object.keys(routes)[Math.floor(Math.random() * Object.keys(routes).length)]
    const route = routes[method][Math.floor(Math.random() * routes[method].length)]
    // Skip some requests
    // if (route === lastRoute) return
    lastRoute = route

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
