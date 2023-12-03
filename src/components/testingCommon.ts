import { IfTemplate } from '../util/tpl';

import type { DataSourceContext } from '../dataSources/abstractDataSource';
import Joi from 'joi';
import type { ConditionSetInterface, TestMockBaseInterface } from './testingCommon.schema.gen';
import { ConditionSetSchema, TestMockBaseSchema } from './testingCommon.schema';
import type { AbstractModuleBaseInstance } from '../modules/abstractModuleBase';
import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';

export abstract class TestMock {
  config: TestMockBaseInterface;
  ifTemplates: IfTemplate[] = [];

  protected constructor(config: TestMockBaseInterface, conditions?: ConditionSetInterface) {
    this.config = Joi.attempt(config, TestMockBaseSchema);

    const ifTemplates: IfTemplate[] = [];
    if (conditions) {
      conditions = Joi.attempt(conditions, ConditionSetSchema, 'Failed to validate test mock conditions: ');

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
    module: AbstractModuleBaseInstance,
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
