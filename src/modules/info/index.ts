import type { RunContext } from '../../util/runContext';
import * as si from 'systeminformation';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { ModuleInfoSchema } from './gen.schema';
import type { ModuleInfoInterface } from './gen.schema.gen';

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
      // TODO: if multiple args need to be accepted, this will need to take argsorder into account
      const argsKeys = Object.keys(args);
      const mappedArgs = argsKeys.map((key) => args[key]);
      acc[key] = siObj[key]?.call(si, ...mappedArgs);
      return acc;
    }, {});

    const promises = Object.keys(collector).reduce((acc: CollectorPromise[], el: string) => {
      const originalPromise = collector[el] as CollectorPromiseEntry;
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
