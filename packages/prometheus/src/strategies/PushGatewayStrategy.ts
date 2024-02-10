import { BaseStrategy, type BaseStrategyOptions } from "./BaseStrategy";

/**
 * The options for the push gateway strategy
 */
export interface PushGatewayStrategyOptions extends BaseStrategyOptions { }

/**
 * The push gateway strategy for persisting the metrics
 */
export class PushGatewayStrategy extends BaseStrategy<PushGatewayStrategy> {

}