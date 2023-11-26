import { VarsSource } from './varsSource';
import type { VarsContainerInterface, VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';
import Joi from 'joi';
import { VarsContainerSchema, VarsSchema, VarsSourcesSchema } from './varsContainer.schema';
import { extractAllTemplates } from '../util/tpl';
import type { DataSourceContext } from '../dataSources/abstractDataSource';

export abstract class VarsContainer {
  #vars: VarsInterface = {};
  #varsSources: VarsSource[] = [];
  #varsCache?: VarsInterface;

  constructor(config: VarsContainerInterface) {
    config = Joi.attempt(config, VarsContainerSchema);

    this.vars = extractAllTemplates(config.vars);
    this.varsSources = config.varsSources ?? [];
  }

  get vars(): VarsInterface {
    return this.#vars;
  }

  set vars(value: VarsInterface) {
    value = Joi.attempt(value, VarsSchema, 'validate vars container config');
    this.#vars = extractAllTemplates(value);
  }

  get varsSources(): VarsSource[] {
    return this.#varsSources;
  }

  set varsSources(value: VarsSourcesInterface) {
    value = Joi.attempt(value, VarsSourcesSchema, 'Error validating vars source config:');
    this.#varsSources = value.map((varsSourceConfig) => new VarsSource(varsSourceConfig));
  }

  protected async internalLoadVars(context: DataSourceContext): Promise<void> {}

  async loadVars(context: DataSourceContext): Promise<VarsInterface> {
    if (this.#varsCache) {
      return this.#varsCache;
    }
    await this.internalLoadVars(context);
    if (this.#vars == null) {
      this.#vars = {};
    }
    const vars = this.#vars;

    for (const source of this.#varsSources) {
      Object.assign(vars, await source.loadVars(context));
    }

    this.#varsCache = vars;
    return vars;
  }

  toJSON() {
    return {
      vars: this.vars,
    };
  }
}
