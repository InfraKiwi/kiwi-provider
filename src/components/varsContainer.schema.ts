import Joi from 'joi';
import { VarsSourceSchema } from './varsSource.schema';
import { joiMetaUnknownType } from '../util/joi';

export const VarsSchema = Joi.object({})
  .unknown(true)
  .meta({
    className: 'VarsInterface',
    ...joiMetaUnknownType(
      Joi.any().description(`
A variable key must be of string type, while its value can be of any kind.
`),
    ),
  });

export const VarsSourcesSchema = Joi.array()
  .items(VarsSourceSchema)
  .meta({ className: 'VarsSourcesInterface' })
  .description(`An array of vars sources.`);

export const VarsContainerSchemaObject = {
  vars: VarsSchema.description(`Hardcoded variables for this entry`),
  varsSources: VarsSourcesSchema.description(`Compile-time vars sources for the entry`),
};

export const VarsContainerSchema = Joi.object(VarsContainerSchemaObject).meta({ className: 'VarsContainerInterface' });
