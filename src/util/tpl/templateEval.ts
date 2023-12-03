import { AbstractTemplate } from './abstractTemplate';
import { evalCodeWithBuiltins } from '../eval';

export async function evalCodeWithSetResult(code: string, context?: Record<string, unknown>) {
  let result: unknown;

  const setResult = (val: unknown) => (result = val);

  context ??= {};
  context.setResult = setResult;

  const evalResult = await evalCodeWithBuiltins(code, context);
  return result ?? evalResult;
}

export class TemplateEval extends AbstractTemplate {
  async render(context?: Record<string, unknown>): Promise<unknown> {
    return evalCodeWithSetResult(this.original, context);
  }
}
