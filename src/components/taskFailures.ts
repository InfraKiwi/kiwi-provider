/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { ValidationError } from 'joi';
import { TemplateRenderingError } from '../util/tpl';

const commonFailures: (
  | {
      // Is validation error
      validation: true;
      match: (err: ValidationError) => boolean;
      hint: (err: ValidationError) => string;
    }
  | {
      // Is template rendering error
      templateRender: true;
      match: (err: TemplateRenderingError) => boolean;
      hint: (err: TemplateRenderingError) => string;
    }
)[] = [
  {
    templateRender: true,
    match: (err: TemplateRenderingError) =>
      err.templateIsIfTemplate &&
      err.message.includes('expected block end in if statement') &&
      /&&|\|\|/.test(err.templateString),
    hint: () => 'Are you mistakenly using `&&` instead of `and`, or `||` instead of `or`?',
  },
];

/**
 * This is a utility function that we can use to lookup common
 * task failure mistakes
 */
export function lookupTaskFailureHint(err: Error): string | undefined {
  const errIsValidationError = err instanceof ValidationError;
  const errIsTemplateRenderingError = err instanceof TemplateRenderingError;

  if (!errIsValidationError && !errIsTemplateRenderingError) {
    return;
  }

  for (const commonFailure of commonFailures) {
    if (errIsValidationError) {
      if (!('validation' in commonFailure) || !commonFailure.validation) {
        continue;
      }
      if (commonFailure.match(err)) {
        return commonFailure.hint(err);
      }
    } else if (errIsTemplateRenderingError) {
      if (!('templateRender' in commonFailure) || !commonFailure.templateRender) {
        continue;
      }
      if (commonFailure.match(err)) {
        return commonFailure.hint(err);
      }
    }
  }
}
