import { RestPlugin, RestRequestObserver, type ObserveRestRequestOptions, type RestPluginOptions } from "@quickstat/rest";
import type { Request, Response, NextFunction, Express } from 'express';

/** The options for the express plugin */
export type ExpressPluginOptions = RestPluginOptions & {
    app: Express
};

/** The express plugin to collect the express specific api metrics and inject the middleware */
export class ExpressPlugin extends RestPlugin {
    /** The express app to inject the middleware */
    private app: Express;

    /**
     * The express plugin to collect the express specific api metrics and inject the middleware
     * @param options The options for the express plugin
     */
    constructor(options: ExpressPluginOptions) {
        super(options);
        this.app = options.app;
    }

    /**
     * Called once the client registers the plugin and injects the middleware to the express app
     */
    public onRegister() {
        this.setupMiddleware();
        return null;
    }
    
    /**
     * Sets up the middleware for the express app
     */
    private setupMiddleware() {
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const observer = new RestRequestObserver(this.client!);

            res.on('finish', () => {
                const observationData = this.getObservationData(req, res);
                observer.end(observationData);
            });

            next();
        });
    }

    /**
     * Gets the observation data from the request and response
     * @param req The req object from the express middleware
     * @param res The res object from the express middleware
     * @returns The observation data
     */
    private getObservationData(req: Request, res: Response) {
        const path = req.route?.path || req.path;
        return {
            method: req.method as ObserveRestRequestOptions['method'],
            path: path, 
            status: res.statusCode,
            size: {
                request: req.socket.bytesRead,
                response: req.socket.bytesWritten,
            },
        };
    }
}