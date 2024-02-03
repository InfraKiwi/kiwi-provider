/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleHTTPListenerInterface begin]
export interface ModuleHTTPListenerInterface {
  /**
   * The address to listen to. If not provided, will listen on 127.0.0.1.
   */
  addr?:
    | '127.0.0.1'
    | string;

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
     *     get: !eval |
     *       return (req, res) => res.send('Hello world!');
     */
    [x: string]: ModuleHTTPListenerRouteInterface; //typeRef:ModuleHTTPListenerRouteInterface:{"relPath":"self","isRegistryExport":false}
  };
}
// [block ModuleHTTPListenerInterface end]
//meta:ModuleHTTPListenerInterface:[{"className":"ModuleHTTPListenerInterface","entryNames":["httpListener"]}]

// [block ModuleHTTPListenerRouteHandlerFunctionInterface begin]
/**
 * A route handler in the form of `(req, res, [next]) => {}`. Define it using an `!eval` YAML block.
 *
 * @example
 * routes:
 *   '/hello':
 *     get: !eval |
 *       return (req, res) => {
 *         res.send('World')
 *       }
 */
export type ModuleHTTPListenerRouteHandlerFunctionInterface = ((...args: any[]) => any);
// [block ModuleHTTPListenerRouteHandlerFunctionInterface end]
//meta:ModuleHTTPListenerRouteHandlerFunctionInterface:[{"className":"ModuleHTTPListenerRouteHandlerFunctionInterface"}]

// [block ModuleHTTPListenerRouteHandlerInterface begin]
/**
 * All possible types of route handlers supported by the listener
 */
export type ModuleHTTPListenerRouteHandlerInterface =

  /**
   * A route handler in the form of `(req, res, [next]) => {}`. Define it using an `!eval` YAML block.
   *
   * @example
   * routes:
   *   '/hello':
   *     get: !eval |
   *       return (req, res) => {
   *         res.send('World')
   *       }
   */
  | ModuleHTTPListenerRouteHandlerFunctionInterface //typeRef:ModuleHTTPListenerRouteHandlerFunctionInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Any static value the route should return JSON-encoded
   */
  | ModuleHTTPListenerRouteHandlerJSONInterface //typeRef:ModuleHTTPListenerRouteHandlerJSONInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Any static string value the route should return verbatim
   */
  | ModuleHTTPListenerRouteHandlerRawInterface; //typeRef:ModuleHTTPListenerRouteHandlerRawInterface:{"relPath":"self","isRegistryExport":false}

// [block ModuleHTTPListenerRouteHandlerInterface end]
//meta:ModuleHTTPListenerRouteHandlerInterface:[{"className":"ModuleHTTPListenerRouteHandlerInterface"}]

// [block ModuleHTTPListenerRouteHandlerJSONInterface begin]
/**
 * Any static value the route should return JSON-encoded
 */
export interface ModuleHTTPListenerRouteHandlerJSONInterface {
  json: any;
}
// [block ModuleHTTPListenerRouteHandlerJSONInterface end]
//meta:ModuleHTTPListenerRouteHandlerJSONInterface:[{"className":"ModuleHTTPListenerRouteHandlerJSONInterface"}]

// [block ModuleHTTPListenerRouteHandlerProxyForWebSocketInterface begin]
/**
 * A url to proxy the traffic to
 */
export interface ModuleHTTPListenerRouteHandlerProxyForWebSocketInterface {
  /**
   * The proxy target url
   */
  target: string;

  /**
   * If true, follows redirects
   */
  followRedirects?:
    | true
    | boolean;

  /**
   * If true, adds x-forward headers
   */
  xfwd?: boolean;

  /**
   * If true, verifies SSL Certs
   */
  secure?: boolean;

  /**
   * If true, changes the origin of the host header to the target url
   */
  changeOrigin?: boolean;
}
// [block ModuleHTTPListenerRouteHandlerProxyForWebSocketInterface end]
//meta:ModuleHTTPListenerRouteHandlerProxyForWebSocketInterface:[{"className":"ModuleHTTPListenerRouteHandlerProxyForWebSocketInterface"}]

// [block ModuleHTTPListenerRouteHandlerProxyInterface begin]
/**
 * A url to proxy the traffic to
 */
export interface ModuleHTTPListenerRouteHandlerProxyInterface {
  /**
   * The proxy target url
   */
  target: string;

  /**
   * If true, follows redirects
   */
  followRedirects?:
    | true
    | boolean;

  /**
   * If true, adds x-forward headers
   */
  xfwd?: boolean;

  /**
   * If true, verifies SSL Certs
   */
  secure?: boolean;

  /**
   * If true, changes the origin of the host header to the target url
   */
  changeOrigin?: boolean;

  /**
   * If true, allows proxying websockets
   */
  ws?: boolean;
}
// [block ModuleHTTPListenerRouteHandlerProxyInterface end]
//meta:ModuleHTTPListenerRouteHandlerProxyInterface:[{"className":"ModuleHTTPListenerRouteHandlerProxyInterface"}]

// [block ModuleHTTPListenerRouteHandlerRawInterface begin]
/**
 * Any static string value the route should return verbatim
 */
export interface ModuleHTTPListenerRouteHandlerRawInterface {
  raw: string;
}
// [block ModuleHTTPListenerRouteHandlerRawInterface end]
//meta:ModuleHTTPListenerRouteHandlerRawInterface:[{"className":"ModuleHTTPListenerRouteHandlerRawInterface"}]

// [block ModuleHTTPListenerRouteInterface begin]
/**
 * For each route, define which methods are supported, and for each method defined the route handler.
 * Each key represents an HTTP method, and the corresponding value holds the handler.
 */
export interface ModuleHTTPListenerRouteInterface {
  get?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:{"relPath":"self","isRegistryExport":false}

  delete?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:{"relPath":"self","isRegistryExport":false}

  head?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:{"relPath":"self","isRegistryExport":false}

  options?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:{"relPath":"self","isRegistryExport":false}

  post?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:{"relPath":"self","isRegistryExport":false}

  put?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:{"relPath":"self","isRegistryExport":false}

  patch?: ModuleHTTPListenerRouteHandlerInterface; //typeRef:ModuleHTTPListenerRouteHandlerInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * A special method that enables a reverse proxy for this route.
   */
  proxy?: ModuleHTTPListenerRouteHandlerProxyInterface; //typeRef:ModuleHTTPListenerRouteHandlerProxyInterface:{"relPath":"self","isRegistryExport":false}
}
// [block ModuleHTTPListenerRouteInterface end]
//meta:ModuleHTTPListenerRouteInterface:[{"className":"ModuleHTTPListenerRouteInterface"}]

export type ModuleHTTPListenerInterfaceConfigKey = 'httpListener';
export const ModuleHTTPListenerInterfaceConfigKeyFirst = 'httpListener';
