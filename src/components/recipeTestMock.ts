import { TestMockSchema } from './testing.schema';
import type { TestMockInterface } from './testing.schema.gen';
import { IfTemplate } from '../util/tpl';
import { moduleRegistry } from '../modules/registry';
import type { VarsInterface } from './varsContainer.schema.gen';
import type { RegistryEntry } from '../util/registry';

import type { DataSourceContext } from '../dataSources/abstractDataSource';
import type { AbstractModuleBaseInstance } from '../modules/abstractModuleBase';
import Joi from 'joi';

interface RecipeTestMockResult {
  vars?: VarsInterface;
  changed: boolean;
}

export class RecipeTestMock {
  config: TestMockInterface;
  ifTemplates: IfTemplate[] = [];
  module: RegistryEntry;

  constructor(config: TestMockInterface) {
    this.config = Joi.attempt(config, TestMockSchema);
    this.module = moduleRegistry.findRegistryEntryFromIndexedConfig(this.config, TestMockSchema);
    const conditions = this.config[this.module.entryName];
    if (conditions) {
      if (Array.isArray(conditions)) {
        this.ifTemplates = conditions.map((s) => new IfTemplate(s));
      } else if (typeof conditions == 'string') {
        this.ifTemplates = [new IfTemplate(conditions)];
      } else {
        throw new Error(`Invalid conditions type: ${typeof conditions}`);
      }
    }
  }

  matches(context: DataSourceContext, module: AbstractModuleBaseInstance): boolean {
    if (module.registryEntry.entryName != this.module.entryName) {
      return false;
    }
    const ifTemplateContext = {
      config: module.config,
    };
    for (const ifTemplate of this.ifTemplates) {
      if (!ifTemplate.isTrue(ifTemplateContext)) {
        // context.logger?.debug('Mock condition not met', {test: ifTemplate, context: ifTemplateContext})
        return false;
      }
      context.logger?.info('Mock condition met', { test: ifTemplate, context: ifTemplateContext });
    }
    return true;
  }

  getResult(): RecipeTestMockResult {
    return {
      vars: this.config.result,
      changed: this.config.changed ?? false,
    };
  }
}
