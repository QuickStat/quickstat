import { RestPlugin, RestRequestObserver } from '@quickstat/rest'

import type { ObserveRestRequestOptions, RestPluginOptions } from '@quickstat/rest'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

/** The options for the Fastify plugin */
export type FastifyPluginOptions = RestPluginOptions & {
  app: FastifyInstance
}

/** The Fastify plugin to collect the Fastify specific api metrics and inject the middleware */
export class FastifyPlugin extends RestPlugin {
  /** The Fastify app to inject the middleware */
  private app: FastifyInstance

  /**
   * The Fastify plugin to collect the Fastify specific api metrics and inject the middleware
   * @param options The options for the Fastify plugin
   */
  constructor(options: FastifyPluginOptions) {
    super(options)
    this.app = options.app
  }

  /**
   * Called once the client registers the plugin and injects the middleware to the Fastify app
   */
  public onRegister() {
    this.setupMiddleware()
    return null
  }

  /**
   * Sets up the middleware for the Fastify app
   */
  private setupMiddleware() {
    this.app.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
      // @ts-expect-error Add the observer to the request object
      request._observer = new RestRequestObserver(this.client)
    })

    this.app.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, _payload: any) => {
      const observationData = this.getObservationData(request, reply)
      // @ts-expect-error Access the observer from the request object
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      request._observer?.end(observationData)
    })
  }

  /**
   * Gets the observation data from the request and response
   * @param request The request object from the Fastify middleware
   * @param reply The reply object from the Fastify middleware
   * @returns The observation data
   */
  private getObservationData(request: FastifyRequest, reply: FastifyReply) {
    const path = request.routeOptions.url || request.url
    return {
      method: request.method as ObserveRestRequestOptions['method'],
      path: path,
      status: reply.statusCode,
      size: {
        request: request.raw.socket.bytesRead,
        response: request.raw.socket.bytesWritten,
      },
    }
  }
}
