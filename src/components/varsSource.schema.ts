/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiMetaUnknownType } from '../util/joi';

export const VarsSourceSchema = Joi.object({
  template: Joi.boolean().description(`
  If true, extract templates from loaded variables
  `),
  flatten: Joi.boolean().description(`
If true and if the data source returns an object then strip out all keys and merge all values.

E.g. if the data source is a \`glob\` that returns:

{
  'test/myFile.yaml': { hello: "World" },
  'test/another.yaml': { name: "Mario" }
}

The loaded variables will be:

{
  hello: "World", 
  name: "Mario"
}
`),
})
  .unknown(true)
  .meta({
    ...joiMetaClassName('VarsSourceInterface'),
    ...joiMetaUnknownType(
      Joi.any().description(`
    The data source you want to use.
    You can check the available data sources here: ##link#See all available data sources#/dataSources
    `)
    ),
  });
