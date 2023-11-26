import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { joiObjectWithPattern, joiValidateValidRegex } from '../../util/joi';
import { dataSourceRegistryEntryFactory } from '../registry';

const debug = newDebug(__filename);

const validHTTPMethods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch', 'purge', 'link', 'unlink'];

// This module uses the Axios library
// You can find more docs here: https://axios-http.com/docs/req_config

const AxiosBasicAuthenticationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const AxiosProxyConfigSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().min(1).required(),
  auth: AxiosBasicAuthenticationSchema,
  protocol: Joi.string().valid('http', 'https').default('http').optional(),
});

const AxiosLoggingEntrySchema = Joi.object({
  params: Joi.boolean(),
  data: Joi.boolean(),
  headers: Joi.boolean(),
});

const AxiosLoggingSchema = Joi.object({
  default: AxiosLoggingEntrySchema,
  request: AxiosLoggingEntrySchema,
  response: AxiosLoggingEntrySchema,
  error: AxiosLoggingEntrySchema,
});

export const DataSourceHTTPRawSchema = Joi.object({
  // `url` is the server URL that will be used for the request
  url: Joi.string(),

  // `method` is the request method to be used when making the request
  method: Joi.string()
    .valid(...validHTTPMethods)
    .default('get')
    .optional(),

  // `baseURL` will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
  // to methods of that instance.
  baseURL: Joi.string(),

  // `headers` are custom headers to be sent
  headers: joiObjectWithPattern(Joi.any()),

  // `params` are the URL parameters to be sent with the request
  // Must be a plain object.
  // NOTE: params that are null or undefined are not rendered in the URL.
  params: joiObjectWithPattern(Joi.any()),

  // `data` is the data to be sent as the request body
  // Only applicable for request methods 'PUT', 'POST', 'DELETE', and 'PATCH'
  data: Joi.alternatives([Joi.array().items(Joi.any()), joiObjectWithPattern(Joi.any())]),

  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  // default is `0` (no timeout)
  timeout: Joi.number().min(0),

  // `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
  // This will set an `Authorization` header, overwriting any existing
  // `Authorization` custom headers you have set using `headers`.
  // Please note that only HTTP Basic auth is configurable through this parameter.
  // For Bearer tokens and such, use `Authorization` custom headers instead.
  auth: AxiosBasicAuthenticationSchema,

  // TODO figure out how to download files
  // `responseType` indicates the type of data that the server will respond with
  // options are: 'arraybuffer', 'document', 'json', 'text'
  // default: json
  responseType: Joi.string().valid('json', 'text').default('json').optional(),

  // `responseEncoding` indicates encoding to use for decoding responses (Node.js only)
  // Note: Ignored for `responseType` of 'stream' or client-side requests
  // default: utf8
  responseEncoding: Joi.string().default('utf8').optional(),

  // `maxContentLength` defines the max size of the http response content in bytes allowed
  maxContentLength: Joi.number().min(0),

  // `maxBodyLength` defines the max size of the http request content in bytes allowed
  maxBodyLength: Joi.number().min(0),

  // `validateStatus` defines a list of status codes that will cause the request to be
  // marked as successful, or in alternative a RegExp to perform the same validation.
  validStatus: Joi.alternatives([Joi.array().items(Joi.number()), Joi.string().custom(joiValidateValidRegex)]),

  // `maxRedirects` defines the maximum number of redirects to follow in node.js.
  // If set to 0, no redirects will be followed.
  maxRedirects: Joi.number().min(0).default(5).optional(),

  // `socketPath` defines a UNIX Socket to be used in node.js.
  // e.g. '/var/run/docker.sock' to send requests to the docker daemon.
  // Only either `socketPath` or `proxy` can be specified.
  // If both are specified, `socketPath` is used.
  socketPath: Joi.string(),

  // `proxy` defines the hostname, port, and protocol of the proxy server.
  // You can also define your proxy using the conventional `http_proxy` and
  // `https_proxy` environment variables. If you are using environment variables
  // for your proxy configuration, you can also define a `no_proxy` environment
  // variable as a comma-separated list of domains that should not be proxied.
  // Use `false` to disable proxies, ignoring environment variables.
  // `auth` indicates that HTTP Basic auth should be used to connect to the proxy, and
  // supplies credentials.
  // This will set an `Proxy-Authorization` header, overwriting any existing
  // `Proxy-Authorization` custom headers you have set using `headers`.
  // If the proxy server uses HTTPS, then you must set the protocol to `https`.
  proxy: Joi.alternatives([Joi.boolean().valid(false), AxiosProxyConfigSchema]),

  // --- Logging
  log: AxiosLoggingSchema,

  // --- Response processing
  filters: Joi.object({
    // The JSONPath used to extract the entries
    // https://github.com/JSONPath-Plus/JSONPath
    jsonPath: Joi.string(),
  }),
});

export const DataSourceHTTPSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  DataSourceHTTPRawSchema,
  { label: 'DataSourceHTTPInterface' },
);
