import Joi from 'joi';
import { joiMetaClassName, joiMetaUnknownType } from '../util/joi';

export const VarsSourceSchema = Joi.object({
  template: Joi.boolean().description(`If true, extract templates from loaded variables`),
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
    ...joiMetaUnknownType(Joi.any().description(`The data source you want to use.`)),
  });
