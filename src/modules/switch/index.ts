import type { RunContext } from '../../util/runContext';
import { ModuleSwitchSchema } from './schema';
import type { ModuleSwitchCaseFullInterface, ModuleSwitchInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { IfTemplate } from '../../util/tpl';
import { Task } from '../../components/task';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

const debug = newDebug(__filename);

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
        tasksToExecute.push(...(c.tasks ?? [c.task!]).map((t) => new Task(t)));
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
          const tasksConfig = this.config.cases[key];
          tasksToExecute.push(...(Array.isArray(tasksConfig) ? tasksConfig : [tasksConfig]).map((t) => new Task(t)));
        }
      }
    }

    if (!found && this.config.default) {
      tasksToExecute.push(
        ...(Array.isArray(this.config.default) ? this.config.default : [this.config.default]).map((t) => new Task(t)),
      );
    }

    const { changed, accumulatedVars, exit } = await Task.runTasksInContext(context, tasksToExecute);

    context.vars = oldVars;

    return {
      vars: accumulatedVars,
      exit,
      changed: changed,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleSwitchSchema, ModuleSwitch);
