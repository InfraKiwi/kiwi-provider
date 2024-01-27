/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleSwitchSchema } from './schema';
import type { ModuleSwitchCaseFullInterface, ModuleSwitchInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { IfTemplate } from '../../util/tpl';
import { Task } from '../../components/task';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

export class ModuleSwitch extends AbstractModuleBase<ModuleSwitchInterface, VarsInterface> {
  async #evaluateCaseIf(context: RunContext, c: ModuleSwitchCaseFullInterface, value: unknown): Promise<boolean> {
    if (c.if) {
      const ifTemplate = new IfTemplate(c.if);
      if (!(await ifTemplate.isTrue(context.vars))) {
        return false;
      }
    }

    return true;
  }

  async run(context: RunContext): Promise<ModuleRunResult<VarsInterface>> {
    const value = this.config.value;
    const oldVars = context.vars;
    const newVars = {
      ...oldVars,
      __switchValue: value,
    };
    context.vars = newVars;

    const tasksToExecute: Task[] = [];

    let found = false;
    if (Array.isArray(this.config.cases)) {
      for (const c of this.config.cases) {
        if (!(await this.#evaluateCaseIf(context, c, value))) {
          continue;
        }

        found = true;
        tasksToExecute.push(...Task.getTasksFromSingleOrArraySchema(c.task));
        if (c.fallthrough) {
          continue;
        }
        break;
      }
    } else {
      // Simple key-based switch
      const keys = Object.keys(this.config.cases);
      for (const key of keys) {
        if (value == key) {
          found = true;
          tasksToExecute.push(...Task.getTasksFromSingleOrArraySchema(this.config.cases[key]));
        }
      }
    }

    if (!found && this.config.default) {
      tasksToExecute.push(...Task.getTasksFromSingleOrArraySchema(this.config.default));
    }

    const { changed, vars, exit } = await Task.runTasksInContext(context, tasksToExecute);

    context.vars = oldVars;

    return {
      vars,
      exit,
      changed,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleSwitchSchema, ModuleSwitch);
