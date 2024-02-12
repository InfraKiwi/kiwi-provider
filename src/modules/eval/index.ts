/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleEvalSchema } from './schema';
import type {
  EvalContextFileInterface,
  EvalFunctionInterface,
  EvalContextInterface,
  ModuleEvalInterface,
} from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import { evalCodeWithBuiltins } from '../../util/eval';
import { fsPromiseReadFile } from '../../util/fs';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

export type ModuleEvalResult = VarsInterface;

export class ModuleEval extends AbstractModuleBase<ModuleEvalInterface, ModuleEvalResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleEvalResult>> {
    const result: ModuleRunResult<ModuleEvalResult> = {
      changed: false,
      vars: {},
    };

    let code: string | EvalFunctionInterface;
    let evalContext;
    if (typeof this.config == 'string') {
      code = this.config;
      evalContext = {
        context,
        result,
      } as EvalContextInterface;
    } else if (this.config.code) {
      code = this.config.code;
      evalContext = {
        context,
        result,
      } as EvalContextInterface;
    } else if (this.config.file) {
      code = await fsPromiseReadFile(this.config.file, { encoding: 'utf-8' });
      evalContext = {
        context,
        result,
        __filename: this.config.file,
      } as EvalContextFileInterface;
    } else {
      throw new Error('eval module config did not provide a source of code');
    }

    try {
      if (typeof code === 'string') {
        await evalCodeWithBuiltins(code, evalContext);
      } else {
        await code(evalContext);
      }
    } catch (ex) {
      result.failed = (ex as Error).toString();
    }

    return result;
  }
}

moduleRegistryEntryFactory.register(ModuleEvalSchema, ModuleEval);
