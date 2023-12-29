/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractTemplateSync } from './abstractTemplate';
import Joi from 'joi';
import { evalCodeSyncSimple } from '../eval';

export class TemplateJoi extends AbstractTemplateSync {
  render(context?: Record<string, unknown>): Joi.Schema {
    const result = evalCodeSyncSimple('return ' + this.original, { Joi: Joi });

    if (!Joi.isSchema(result)) {
      throw new Error('The returned value must be a Joi schema');
    }

    return result;
  }
}
