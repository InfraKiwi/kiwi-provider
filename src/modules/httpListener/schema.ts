/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { localhost127 } from '../../util/constants';
import { joiMetaClassName, joiObjectWithPattern } from '../../util/joi';

const validHTTPMethods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'];

export const ModuleHTTPListenerRouteHandlerFunctionSchema = Joi.function()
  .minArity(2)
  .description(
    `
A route handler in the form of \`(req, res, [next]) => {}\`. Define it using an \`!!eval\` YAML block.
`
  )
  .example(
    `
routes:
  '/hello':
    get: !!eval |
      return (req, res) => {
        res.send('World')
      }
`
  )
  .meta(joiMetaClassName('ModuleHTTPListenerRouteHandlerFunctionInterface'));

export const ModuleHTTPListenerRouteHandlerJSONSchema = Joi.object({
  json: Joi.any().required(),
})
  .description('Any static value the route should return JSON-encoded')
  .meta(joiMetaClassName('ModuleHTTPListenerRouteHandlerJSONInterface'));

export const ModuleHTTPListenerRouteHandlerRawSchema = Joi.object({
  raw: Joi.string().required(),
})
  .description('Any static string value the route should return verbatim')
  .meta(joiMetaClassName('ModuleHTTPListenerRouteHandlerRawInterface'));

export const ModuleHTTPListenerRouteHandlerSchema = Joi.alternatives([
  ModuleHTTPListenerRouteHandlerFunctionSchema,
  ModuleHTTPListenerRouteHandlerJSONSchema,
  ModuleHTTPListenerRouteHandlerRawSchema,
])
  .description('All possible types of route handlers supported by the listener')
  .meta(joiMetaClassName('ModuleHTTPListenerRouteHandlerInterface'));

export const ModuleHTTPListenerRouteSchema = Joi.object(
  validHTTPMethods.reduce((acc: Record<string, Joi.Schema>, el) => {
    acc[el] = ModuleHTTPListenerRouteHandlerSchema.meta({ disableDescription: true });
    return acc;
  }, {})
)
  .description(
    `
For each route, define which methods are supported, and for each method defined the route handler.
Each key represents an HTTP method, and the corresponding value holds the handler.
`
  )
  .meta(joiMetaClassName('ModuleHTTPListenerRouteInterface'));

export const ModuleHTTPListenerSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    addr: Joi.string()
      .hostname()
      .default(localhost127)
      .optional()
      .description(`The address to listen to. If not provided, will listen on ${localhost127}.`),

    port: Joi.number().description(`
The port to listen on. If not defined, a random one will be used and it will be
outputted in the module result.
`),

    routes: joiObjectWithPattern(
      ModuleHTTPListenerRouteSchema.description(`
The mapping \`Route path -> handler\`.
E.g. /hello:
    get: !!eval |
      return (req, res) => res.send('Hello world!');
`)
    ).description(`
The definition of all available routes. Each object key represents a route path, e.g. \`/hello\`.
`),
  }),
  { label: 'ModuleHTTPListenerInterface' }
);
