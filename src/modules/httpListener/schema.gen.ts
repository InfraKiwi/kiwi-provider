// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleHTTPListenerInterface begin]
export interface ModuleHTTPListenerInterface {
  /**
   * The address to listen to. If not provided, will listen on 127.0.0.1.
   */
  addr?: '127.0.0.1' | string;

  /**
   * The port to listen on. If not defined, a random one will be used and it will be
   * outputted in the module result.
   */
  port?: number;

  /**
   * The definition of all available routes. Each object key represents a route path, e.g. `/hello`.
   */
  routes?: {
    /**
     * The mapping `Route path -> handler`.
     * E.g. /hello:
     *     get: !!eval |
     *       return (req, res) => res.send('Hello world!');
     */
    [x: string]: ModuleHTTPListenerRouteInterface; //typeRef:ModuleHTTPListenerRouteInterface:schema.gen.ts:false
  };
}
// [block ModuleHTTPListenerInterface end]

// [block ModuleHTTPListenerRouteHandlerFunctionInterface begin]
/**
 * A route handler in the form of `(req, res, [next]) => {}`. Define it using an `!!eval` YAML block.
 *
 * @example
 * routes:
 *   '/hello':
 *     get: !!eval |
 *       return (req, res) => {
 *         res.send('World')
 *       }
 */
export type ModuleHTTPListenerRouteHandlerFunctionInterface = (...args: any[]) => any;
// [block ModuleHTTPListenerRouteHandlerFunctionInterface end]

// [block ModuleHTTPListenerRouteHandlerInterface begin]
/**
 * All possible types of route handlers supported by the listener
 */
export type ModuleHTTPListenerRouteHandlerInterface =

  /**
   * A route handler in the form of `(req, res, [next]) => {}`. Define it using an `!!eval` YAML block.
   *
   * @example
   * routes:
   *   '/hello':
   *     get: !!eval |
   *       return (req, res) => {
   *         res.send('World')
   *       }
   */
  | ModuleHTTPListenerRouteHandlerFunctionInterface //typeRef:ModuleHTTPListenerRouteHandlerFunctionInterface:schema.gen.ts:false

  /**
   * Any static value the route should return JSON-encoded
   */
  | ModuleHTTPListenerRouteHandlerJSONInterface //typeRef:ModuleHTTPListenerRouteHandlerJSONInterface:schema.gen.ts:false

  /**
   * Any static string value the route should return verbatim
   */
  | ModuleHTTPListenerRouteHandlerRawInterface; //typeRef:ModuleHTTPListenerRouteHandlerRawInterface:schema.gen.ts:false

// [block ModuleHTTPListenerRouteHandlerInterface end]

// [block ModuleHTTPListenerRouteHandlerJSONInterface begin]
/**
 * Any static value the route should return JSON-encoded
 */
export interface ModuleHTTPListenerRouteHandlerJSONInterface {
  json: any;
}
// [block ModuleHTTPListenerRouteHandlerJSONInterface end]

// [block ModuleHTTPListenerRouteHandlerRawInterface begin]
/**
 * Any static string value the route should return verbatim
 */
export interface ModuleHTTPListenerRouteHandlerRawInterface {
  raw: string;
}
// [block ModuleHTTPListenerRouteHandlerRawInterface end]

// [block ModuleHTTPListenerRouteInterface begin]
/**
 * For each route, define which methods are supported, and for each method defined the route handler.
 * Each key represents an HTTP method, and the corresponding value holds the handler.
 */
export interface ModuleHTTPListenerRouteInterface {
  get?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:schema.gen.ts:false

  delete?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:schema.gen.ts:false

  head?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:schema.gen.ts:false

  options?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:schema.gen.ts:false

  post?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:schema.gen.ts:false

  put?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:schema.gen.ts:false

  patch?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:schema.gen.ts:false
}
// [block ModuleHTTPListenerRouteInterface end]

export type ModuleHTTPListenerInterfaceConfigKey = 'httpListener';
export const ModuleHTTPListenerInterfaceConfigKeyFirst = 'httpListener';
