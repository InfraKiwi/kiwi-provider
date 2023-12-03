import type { NunjucksContext } from './tpl';
import { nunjucksAddAsyncFilter, Template } from './tpl';
import { fsPromiseReadFile } from '../fs';
import { evalCodeWithSetResult } from './templateEval';

async function tpl(this: NunjucksContext, value: string) {
  const tpl = new Template(value);
  return await tpl.render(this.ctx);
}

nunjucksAddAsyncFilter('tpl', tpl);

async function evalCodeFn(this: NunjucksContext, code: string, context?: Record<string, unknown>) {
  context ??= { ...this.ctx };

  return await evalCodeWithSetResult(code, context);
}

nunjucksAddAsyncFilter('evalCode', evalCodeFn);

async function evalFileFn(this: NunjucksContext, fileName: string, context?: Record<string, unknown>) {
  const code = await fsPromiseReadFile(fileName, { encoding: 'utf-8' });
  return await evalCodeFn.call(this, code, {
    __filename: fileName,
    ...context,
  });
}

nunjucksAddAsyncFilter('evalFile', evalFileFn);

async function fileRead(this: NunjucksContext, fileName: string) {
  return await fsPromiseReadFile(fileName, { encoding: 'utf-8' });
}

nunjucksAddAsyncFilter('fileRead', fileRead);
