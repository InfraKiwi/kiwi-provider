import { AbstractTemplate } from './abstractTemplate';
import { evalCodeWithBuiltins } from '../eval';

export async function evalCodeWithSetResult(code: string, context?: Record<string, unknown>) {
  let result: unknown;

  const setResult = (val: unknown) => (result = val);

  context ??= {};
  context.setResult = setResult;

  await evalCodeWithBuiltins(code, context);
  return result;
}

export class TemplateEval extends AbstractTemplate {
  async render(context?: Record<string, unknown>): Promise<unknown> {
    return evalCodeWithSetResult(this.original, context);
  }
}
