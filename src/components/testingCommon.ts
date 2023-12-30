/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { IfTemplate } from '../util/tpl';

import type { DataSourceContext } from '../dataSources/abstractDataSource';
import type { ConditionSetInterface, TestMockBaseInterface } from './testingCommon.schema.gen';
import { ConditionSetSchema, TestMockBaseSchema } from './testingCommon.schema';
import type { AbstractModuleBaseInstance } from '../modules/abstractModuleBase';
import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';
import { joiAttemptRequired } from '../util/joi';

export abstract class TestMock {
  config: TestMockBaseInterface;
  ifTemplates: IfTemplate[] = [];

  protected constructor(config: TestMockBaseInterface, conditions?: ConditionSetInterface) {
    this.config = joiAttemptRequired(config, TestMockBaseSchema);

    const ifTemplates: IfTemplate[] = [];
    if (conditions) {
      conditions = joiAttemptRequired(conditions, ConditionSetSchema, 'Failed to validate test mock conditions: ');

      if (Array.isArray(conditions)) {
        ifTemplates.push(...conditions.map((s) => new IfTemplate(s)));
      } else if (typeof conditions == 'string') {
        ifTemplates.push(new IfTemplate(conditions));
      } else {
        throw new Error(`Invalid conditions type: ${typeof conditions}`);
      }
    }

    this.ifTemplates = ifTemplates;
  }

  abstract matchesModule(context: DataSourceContext, module: AbstractModuleBaseInstance): Promise<boolean>;

  protected async matchesModuleConfig(
    context: DataSourceContext,
    module: AbstractModuleBaseInstance
  ): Promise<boolean> {
    const config = module.config;
    for (const ifTemplate of this.ifTemplates) {
      if (!(await ifTemplate.isTrue(config))) {
        // context.logger?.debug('Mock condition not met', {test: ifTemplate, context: ifTemplateContext})
        return false;
      }
      context.logger?.info('Mock condition met', {
        test: ifTemplate,
        context: config,
      });
    }
    return true;
  }

  getResult(): ModuleRunResultInterface {
    return this.config.result;
  }
}
