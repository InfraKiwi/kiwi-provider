/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import * as si from 'systeminformation';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { ModuleInfoSchema } from './schema';
import type { ModuleInfoInterface } from './schema.gen';

export interface ModuleInfoResult {}

type CollectorPromiseEntry = Promise<object>;
type CollectorPromiseResult = [string, object];
type CollectorPromise = Promise<CollectorPromiseResult>;

export class ModuleInfo extends AbstractModuleBase<ModuleInfoInterface, ModuleInfoResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleInfoResult>> {
    const collector = Object.entries(this.config).reduce((acc: Record<string, CollectorPromiseEntry>, [key, args]) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const siObj = si as Record<string, Function>;
      if (!(key in siObj)) {
        throw new Error(`Unknown systeminformation function ${key}`);
      }
      // TODO: if multiple args need to be accepted, this will need to take args order into account
      if (typeof args == 'boolean') {
        if (args) {
          args = {};
        } else {
          // If false, we don't want to use this entry
          return acc;
        }
      }
      const argsKeys = Object.keys(args);
      const mappedArgs = argsKeys.map((key) => args[key]);
      acc[key] = siObj[key]?.call(si, ...mappedArgs);
      return acc;
    }, {});

    const promises = Object.keys(collector).reduce((acc: CollectorPromise[], el: string) => {
      const originalPromise = collector[el];
      const promise = async (): CollectorPromise => {
        const result = await originalPromise;
        return [el, result];
      };

      acc.push(promise());
      return acc;
    }, []);

    const results = await Promise.all(promises);
    const splat = results.reduce((acc: Record<string, object>, [key, result]: CollectorPromiseResult) => {
      acc[key] = result;
      return acc;
    }, {});

    return {
      vars: splat,
      // Readonly module
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleInfoSchema, ModuleInfo);
