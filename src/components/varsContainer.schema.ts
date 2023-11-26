import Joi from 'joi';
import { VarsSourceSchema } from './varsSource.schema';

export const VarsSchema = Joi.object({}).unknown(true).meta({ className: 'VarsInterface' });

export const VarsSourcesSchema = Joi.array().items(VarsSourceSchema).meta({ className: 'VarsSourcesInterface' });

export const VarsContainerSchema = Joi.object({
  // Hard-defined vars for the entry
  vars: VarsSchema,

  // Compile-time-defined vars sources for the entry
  varsSources: VarsSourcesSchema,
}).meta({ className: 'VarsContainerInterface' });
