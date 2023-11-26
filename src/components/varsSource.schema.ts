import Joi from 'joi';

export const VarsSourceSchema = Joi.object({
  // If true, extract templates
  extract: Joi.boolean(),
})
  .unknown(true)
  .meta({ className: 'VarsSourceInterface' });
