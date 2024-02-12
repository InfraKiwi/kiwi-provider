/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleLoopSchema, ModuleLoopSchemaVarDefault } from './schema';
import type { ModuleLoopInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { Task } from '../../components/task';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

export interface LoopItem {
  key: string | number;
  item: unknown;
}

export interface ModuleLoopResult {
  results: ModuleRunResult<VarsInterface>[] | Record<string, ModuleRunResult<VarsInterface>>;
}

export class ModuleLoop extends AbstractModuleBase<ModuleLoopInterface, ModuleLoopResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleLoopResult>> {
    const oldVars = context.vars;

    const loopItems: LoopItem[] = [];

    if (Array.isArray(this.config.items)) {
      for (let i = 0; i < this.config.items.length; i++) {
        const item = this.config.items[i];
        loopItems.push({
          key: i,
          item,
        });
      }
    } else {
      // Simple key-based loop
      const keys = Object.keys(this.config.items);
      for (const key of keys) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const item = (this.config.items as any)[key];
        loopItems.push({
          key,
          item,
        });
      }
    }

    const results: ModuleRunResult<VarsInterface>[] | Record<string, ModuleRunResult<VarsInterface>> = Array.isArray(
      this.config.items
    )
      ? []
      : {};

    const tasksToExecute = await Task.getResolvedTasksFromSingleOrArraySchema(context, this.config.task);
    let exit = false;
    let changed = false;
    for (const loopItem of loopItems) {
      const loopVar = this.config.var ?? ModuleLoopSchemaVarDefault;
      if (loopVar in context.vars) {
        context.logger.warn(`Loop variable ${loopVar} already defined in context, overwriting it`);
      }
      const loopContext = context.withName(`Loop[${loopItem.key}]`).withVars({ [loopVar]: loopItem });
      const result = await Task.runTasksInContext(loopContext, tasksToExecute);
      exit ||= result.exit == true;
      changed ||= result.changed;
      if (Array.isArray(results)) {
        results.push(result);
      } else {
        results[loopItem.key] = result;
      }
      if (result.exit) {
        break;
      }
    }

    context.vars = oldVars;

    return {
      vars: { results },
      exit,
      changed,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleLoopSchema, ModuleLoop);
