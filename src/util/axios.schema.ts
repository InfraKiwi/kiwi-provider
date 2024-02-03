/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiObjectWithPattern, joiValidateValidJoiSchema, joiValidateValidRegex } from './joi';

const validHTTPMethods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch', 'purge', 'link', 'unlink'];

/*
 * This module uses the Axios library
 * You can find more docs here: https://axios-http.com/docs/req_config
 */

const AxiosBasicAuthenticationSchema = Joi.object({
  username: Joi.string().required().description('The username to use for the basic authentication request'),
  password: Joi.string().required().description('The password to use for the basic authentication request'),
});

const AxiosProxyConfigSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().min(1).required(),
  auth: AxiosBasicAuthenticationSchema,
  protocol: Joi.string().valid('http', 'https').default('http').optional(),
});

const AxiosLoggingEntrySchema = Joi.object({
  params: Joi.boolean().description('If `true` log the params passed in the HTTP call'),
  data: Joi.boolean().description('If `true` log the data/body passed in the HTTP call'),
  headers: Joi.boolean().description('If `true` log the headers passed in the HTTP call'),
});

const AxiosLoggingSchema = Joi.object({
  default: AxiosLoggingEntrySchema,
  request: AxiosLoggingEntrySchema,
  response: AxiosLoggingEntrySchema,
  error: AxiosLoggingEntrySchema,
});

export const AxiosRequestSchemaObject = {
  url: Joi.string().description('The URL that will be used for the request'),

  method: Joi.string()
    .valid(...validHTTPMethods)
    .default('get')
    .optional()
    .description('The request method to be used when making the request'),

  baseURL: Joi.string().description(`
\`baseURL\` will be prepended to \`url\` unless \`url\` is absolute.
It can be convenient to set \`baseURL\` for an instance of axios to pass 
relative URLs to methods of that instance.
`),

  headers: joiObjectWithPattern(Joi.any()).description('Custom headers to be sent'),

  params: joiObjectWithPattern(Joi.any()).description(`
The URL parameters to be sent with the request.
Must be a plain object.
NOTE: params that are null or undefined are not rendered in the URL.  
`),

  data: Joi.alternatives([Joi.array().items(Joi.any()), joiObjectWithPattern(Joi.any())]).description(`
The data to be sent as the request body
Only applicable for request methods 'PUT', 'POST', 'DELETE', and 'PATCH'
`),

  timeout: Joi.number().min(0).description(`
The number of milliseconds before the request times out.
If the request takes longer than \`timeout\`, the request will be aborted.
Default is \`0\` (no timeout).
`),

  auth: AxiosBasicAuthenticationSchema.description(`
Indicates that HTTP Basic auth should be used, and supplies credentials.
This will set an \`Authorization\` header, overwriting any existing
\`Authorization\` custom headers you have set using \`headers\`.
Please note that only HTTP Basic auth is configurable through this parameter.
For Bearer tokens and such, use \`Authorization\` custom headers instead.
`),

  responseEncoding: Joi.string().default('utf8').optional().description(`
Indicates the encoding to use for decoding responses.
Default: \`utf8\`.
`),

  maxContentLength: Joi.number().min(0).description(`
Defines the max size of the http response content in bytes allowed.
`),

  maxBodyLength: Joi.number().min(0).description(`
Defines the max size of the http request content in bytes allowed
`),

  validStatus: Joi.alternatives([
    Joi.array().items(Joi.number()).description(`
    A plain array of valid status codes.
  `),
    Joi.string().custom(joiValidateValidRegex).description(`
    A RegExp to validate the status code.
  `),
    Joi.custom(joiValidateValidJoiSchema).description(`
    A Joi validation schema in form of JS code.
     
    Must be defined using the \`!joi\` YAML tag, which makes the \`Joi\` 
    namespace available to use and automatically prepends a \`return\` keyword
    to the provided code.
    
    You can check out more examples of Joi validation at: https://joi.dev/api
    `).example(`
    validStatus: !joi Joi.number().min(200).max(299)
    `),
  ])
    .default('^2\\d\\d$')
    .optional().description(`
Defines a list of status codes that will cause the request to be marked as 
successful.
`),

  maxRedirects: Joi.number().min(0).default(5).optional().description(`
Defines the maximum number of redirects to follow.
If set to 0, no redirects will be followed.
Default: \`5\`.
`),

  socketPath: Joi.string().description(`
Defines a UNIX Socket to be used.
E.g. \`/var/run/docker.sock\` to send requests to the docker daemon.
Only either \`socketPath\` or \`proxy\` can be specified.
If both are specified, \`socketPath\` is used.
`),

  proxy: Joi.alternatives([Joi.boolean().valid(false), AxiosProxyConfigSchema]).description(`
Defines the hostname, port, and protocol of the proxy server.

You can also define your proxy using the conventional \`http_proxy\` and
\`https_proxy\` environment variables. If you are using environment variables
for your proxy configuration, you can also define a \`no_proxy\` environment
variable as a comma-separated list of domains that should not be proxied.

Use \`false\` to disable proxies, ignoring environment variables.

\`auth\` indicates that HTTP Basic auth should be used to connect to the proxy, and
supplies credentials. This will set an \`Proxy-Authorization\` header, overwriting 
any existing \`Proxy-Authorization\` custom headers you have set using \`headers\`.

If the proxy server uses HTTPS, then you must set the protocol to \`https\`.
`),

  // --- Logging
  log: AxiosLoggingSchema.description('The logging configuration for the HTTP call'),
};
