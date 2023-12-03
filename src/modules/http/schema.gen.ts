// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleHTTPInterface begin]
export interface ModuleHTTPInterface {
  filters?: {
    /**
     * The JSONPath used to extract the entries
     * See: https://github.com/JSONPath-Plus/JSONPath
     */
    jsonPath?: string;
  };

  /**
   * Indicates the type of data that the server will respond with.
   */
  responseType?: 'json' | 'text';

  /**
   * The URL that will be used for the request
   */
  url?: string;

  /**
   * The request method to be used when making the request
   */
  method?: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'purge' | 'link' | 'unlink';

  /**
   * `baseURL` will be prepended to `url` unless `url` is absolute.
   * It can be convenient to set `baseURL` for an instance of axios to pass
   * relative URLs to methods of that instance.
   */
  baseURL?: string;

  /**
   * Custom headers to be sent
   */
  headers?: {
    [x: string]: any;
  };

  /**
   * The URL parameters to be sent with the request.
   * Must be a plain object.
   * NOTE: params that are null or undefined are not rendered in the URL.
   */
  params?: {
    [x: string]: any;
  };

  /**
   * The data to be sent as the request body
   * Only applicable for request methods 'PUT', 'POST', 'DELETE', and 'PATCH'
   */
  data?:
    | any[]
    | {
      [x: string]: any;
    };

  /**
   * The number of milliseconds before the request times out.
   * If the request takes longer than `timeout`, the request will be aborted.
   * Default is `0` (no timeout).
   */
  timeout?: number;

  /**
   * Indicates that HTTP Basic auth should be used, and supplies credentials.
   * This will set an `Authorization` header, overwriting any existing
   * `Authorization` custom headers you have set using `headers`.
   * Please note that only HTTP Basic auth is configurable through this parameter.
   * For Bearer tokens and such, use `Authorization` custom headers instead.
   */
  auth?: {
    /**
     * The username to use for the basic authentication request
     */
    username: string;

    /**
     * The password to use for the basic authentication request
     */
    password: string;
  };

  /**
   * Indicates the encoding to use for decoding responses.
   * Default: `utf8`.
   */
  responseEncoding?: 'utf8' | string;

  /**
   * Defines the max size of the http response content in bytes allowed.
   */
  maxContentLength?: number;

  /**
   * Defines the max size of the http request content in bytes allowed
   */
  maxBodyLength?: number;

  /**
   * Defines a list of status codes that will cause the request to be marked as
   * successful, or in alternative a RegExp to perform the same validation.
   */
  validStatus?: number[] | string;

  /**
   * Defines the maximum number of redirects to follow.
   * If set to 0, no redirects will be followed.
   * Default: `5`.
   */
  maxRedirects?: 5 | number;

  /**
   * Defines a UNIX Socket to be used.
   * E.g. `/var/run/docker.sock` to send requests to the docker daemon.
   * Only either `socketPath` or `proxy` can be specified.
   * If both are specified, `socketPath` is used.
   */
  socketPath?: string;

  /**
   * Defines the hostname, port, and protocol of the proxy server.
   *
   * You can also define your proxy using the conventional `http_proxy` and
   * `https_proxy` environment variables. If you are using environment variables
   * for your proxy configuration, you can also define a `no_proxy` environment
   * variable as a comma-separated list of domains that should not be proxied.
   *
   * Use `false` to disable proxies, ignoring environment variables.
   *
   * `auth` indicates that HTTP Basic auth should be used to connect to the proxy, and
   * supplies credentials. This will set an `Proxy-Authorization` header, overwriting
   * any existing `Proxy-Authorization` custom headers you have set using `headers`.
   *
   * If the proxy server uses HTTPS, then you must set the protocol to `https`.
   */
  proxy?:
    | false
    | {
      host: string;
      port: number;
      auth?: {
        /**
         * The username to use for the basic authentication request
         */
        username: string;

        /**
         * The password to use for the basic authentication request
         */
        password: string;
      };
      protocol?: 'http' | 'https';
    };

  /**
   * The logging configuration for the HTTP call
   */
  log?: {
    default?: {
      /**
       * If `true` log the params passed in the HTTP call
       */
      params?: boolean;

      /**
       * If `true` log the data/body passed in the HTTP call
       */
      data?: boolean;

      /**
       * If `true` log the headers passed in the HTTP call
       */
      headers?: boolean;
    };
    request?: {
      /**
       * If `true` log the params passed in the HTTP call
       */
      params?: boolean;

      /**
       * If `true` log the data/body passed in the HTTP call
       */
      data?: boolean;

      /**
       * If `true` log the headers passed in the HTTP call
       */
      headers?: boolean;
    };
    response?: {
      /**
       * If `true` log the params passed in the HTTP call
       */
      params?: boolean;

      /**
       * If `true` log the data/body passed in the HTTP call
       */
      data?: boolean;

      /**
       * If `true` log the headers passed in the HTTP call
       */
      headers?: boolean;
    };
    error?: {
      /**
       * If `true` log the params passed in the HTTP call
       */
      params?: boolean;

      /**
       * If `true` log the data/body passed in the HTTP call
       */
      data?: boolean;

      /**
       * If `true` log the headers passed in the HTTP call
       */
      headers?: boolean;
    };
  };
}
// [block ModuleHTTPInterface end]

export type ModuleHTTPInterfaceConfigKey = 'http';
export const ModuleHTTPInterfaceConfigKeyFirst = 'http';
