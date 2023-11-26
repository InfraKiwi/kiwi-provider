import type { RunContext } from '../../util/runContext';
import { ModuleEvalSchema } from './schema';
import type { ModuleEvalInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import { evalCodeWithBuiltins } from '../../util/eval';
import { fsPromiseReadFile } from '../../util/fs';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

const debug = newDebug(__filename);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleEvalResult = any;

export class ModuleEval extends AbstractModuleBase<ModuleEvalInterface, ModuleEvalResult> {
  get requiresMock(): boolean {
    return false;
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleEvalResult>> {
    let code: string;
    if (this.config.code) {
      code = this.config.code;
    } else if (this.config.file) {
      code = await fsPromiseReadFile(this.config.file, { encoding: 'utf-8' });
    } else {
      throw new Error('eval module config did not provide a source of code');
    }

    const result: ModuleRunResult<ModuleEvalResult> = {
      changed: false,
      vars: {},
    };

    const evalContext = {
      context,
      result,
    };

    try {
      await evalCodeWithBuiltins(code, evalContext);
    } catch (ex) {
      result.failed = (ex as Error).toString();
    }

    return result;
  }
}

moduleRegistryEntryFactory.register(ModuleEvalSchema, ModuleEval);
