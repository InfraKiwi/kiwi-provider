/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractTemplate } from './abstractTemplate';
import { evalCodeWithBuiltins } from '../eval';

export async function evalCodeWithSetResult(code: string, context: Record<string, unknown> = {}) {
  let result: unknown;

  const setResult = (val: unknown) => (result = val);

  context.setResult = setResult;

  const evalResult = await evalCodeWithBuiltins(code, context);
  return result ?? evalResult;
}

export class TemplateEval extends AbstractTemplate {
  async render(context?: Record<string, unknown>): Promise<unknown> {
    return evalCodeWithSetResult(this.original, context);
  }
}
