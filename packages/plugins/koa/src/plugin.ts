import { RestPlugin, RestRequestObserver } from '@quickstat/rest'

import type { ObserveRestRequestOptions, RestPluginOptions } from '@quickstat/rest'
import type Koa from 'koa'
import type { Context, Next } from 'koa'

/** The options for the Koa plugin */
export type KoaPluginOptions = RestPluginOptions & {
  app: Koa
}

/** The Koa plugin to collect the Koa specific API metrics and inject the middleware */
export class KoaPlugin extends RestPlugin {
  /** The Koa app to inject the middleware */
  private app: Koa

  /**
   * The Koa plugin to collect the Koa specific API metrics and inject the middleware
   * @param options The options for the Koa plugin
   */
  constructor(options: KoaPluginOptions) {
    super(options)
    this.app = options.app
  }

  /**
   * Called once the client registers the plugin and injects the middleware to the Koa app
   */
  public onRegister() {
    this.setupMiddleware()
    return null
  }

  /**
   * Sets up the middleware for the Koa app
   */
  private setupMiddleware() {
    this.app.use(async (ctx: Context, next: Next) => {
      // If client is not set, skip the middleware
      if (!this.client) {
        await next()
        return
      }

      const observer = new RestRequestObserver(this.client)

      try {
        await next()
      } finally {
        const observationData = this.getObservationData(ctx)
        observer.end(observationData)
      }
    })
  }

  /**
   * Gets the observation data from the context
   * @param ctx The Koa context
   * @returns The observation data
   */
  private getObservationData(ctx: Context) {
    const path = ctx._matchedRoute as string || ctx.path
    return {
      method: ctx.method as ObserveRestRequestOptions['method'],
      path: path,
      status: ctx.status,
      size: {
        request: ctx.req.socket.bytesRead,
        response: ctx.req.socket.bytesWritten,
      },
    }
  }
}
