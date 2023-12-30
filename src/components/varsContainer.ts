/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { VarsSource } from './varsSource';
import type { VarsContainerInterface, VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';
import { VarsContainerSchema, VarsSchema, VarsSourcesSchema } from './varsContainer.schema';
import { extractAllTemplates } from '../util/tpl';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { joiAttemptRequired } from '../util/joi';

export abstract class VarsContainer {
  #vars: VarsInterface = {};
  #varsSources: VarsSource[] = [];
  #varsCache?: VarsInterface;

  protected constructor(config: VarsContainerInterface) {
    config = joiAttemptRequired(config, VarsContainerSchema);

    this.vars = extractAllTemplates(config.vars);
    this.varsSources = config.varsSources ?? [];
  }

  get vars(): VarsInterface {
    return this.#vars;
  }

  set vars(value: VarsInterface) {
    value = joiAttemptRequired(value ?? {}, VarsSchema, 'validate vars container config');
    this.#vars = extractAllTemplates(value);
  }

  get varsSources(): VarsSource[] {
    return this.#varsSources;
  }

  set varsSources(value: VarsSourcesInterface) {
    value = joiAttemptRequired(value, VarsSourcesSchema, 'Error validating vars source config:');
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
    return { vars: this.vars };
  }
}
