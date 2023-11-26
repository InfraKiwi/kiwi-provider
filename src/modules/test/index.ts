import type { RunContext } from '../../util/runContext';
import { ModuleTestSchema, ModuleTestSilentSchema } from './schema';
import type { ModuleTestInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import traverse from 'traverse';
import { IfTemplate } from '../../util/tpl';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

const debug = newDebug(__filename);

export interface ModuleTestResult {
  tests: Record<string, boolean>;
}

export class ModuleTest extends AbstractModuleBase<ModuleTestInterface, ModuleTestResult> {
  get requiresMock(): boolean {
    return false;
  }

  protected get disableShortie(): boolean {
    return true;
  }

  static async runTest(context: RunContext, condition: string): Promise<boolean> {
    return new IfTemplate(condition).isTrue(context.vars);
  }

  get silent(): boolean {
    return typeof this.config == 'object' && 'tests' in this.config && this.config.silent == true;
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleTestResult>> {
    const result: ModuleTestResult = {
      tests: {},
    };

    const testsObject: Record<string, string> = {};

    if (typeof this.config == 'string') {
      testsObject['test'] = this.config;
    } else if (Array.isArray(this.config)) {
      for (let i = 0; i < this.config.length; i++) {
        testsObject[`test${i}`] = this.config[i];
      }
    } else if (this.config.tests) {
      Object.assign(testsObject, this.config.tests);
    } else {
      Object.assign(testsObject, this.config);
    }

    // TODO handle promises
    const promises: Promise<void>[] = [];

    const failed: string[] = [];
    traverse(testsObject).forEach(function (val) {
      if (this.notLeaf) {
        return;
      }
      promises.push(
        (async () => {
          const testResult = await ModuleTest.runTest(context, val);
          if (!testResult) {
            failed.push(this.key!);
          }
          result.tests[this.key!] = testResult;
        })(),
      );
    });

    await Promise.all(promises);

    if (!this.silent) {
      if (failed.length == Object.keys(result.tests).length) {
        throw new Error(`All tests have failed: ${failed.join(', ')}`);
      }
      if (failed.length > 0) {
        throw new Error(`Some tests have failed: ${failed.join(', ')}`);
      }
    }

    return {
      vars: result,
      changed: false,
    };
  }
}

export class ModuleTestSilent extends ModuleTest {
  get silent(): boolean {
    return true;
  }
}

moduleRegistryEntryFactory.register(ModuleTestSchema, ModuleTest);
moduleRegistryEntryFactory.register(ModuleTestSilentSchema, ModuleTestSilent);
