import { newDebug } from '../../util/debug';
import { ModuleExecSchema } from './schema';
import type { RunContext } from '../../util/runContext';
import type { ModuleExecInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { ExecCmdOptions } from '../../util/exec';
import { execCmd } from '../../util/exec';
import { getErrorPrintfClass } from '../../util/error';

const debug = newDebug(__filename);

export interface ModuleExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const ModuleExecErrorBadExitCode = getErrorPrintfClass('ModuleExecErrorBadExitCode', `Bad exit code: %d`);

export class ModuleExec extends AbstractModuleBase<ModuleExecInterface, ModuleExecResult> {
  get requiresMock(): boolean {
    return true;
  }

  protected get disableShortie(): boolean {
    return true;
  }

  get label(): string | undefined {
    return JSON.stringify(this.config);
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleExecResult>> {
    let cmd: string;
    let args: string[] | undefined;
    let workDir: string | undefined;

    if (typeof this.config == 'string') {
      cmd = this.config;
    } else if (Array.isArray(this.config)) {
      cmd = this.config[0];
      if (this.config.length > 1) {
        args = this.config.slice(1);
      }
    } else {
      cmd = this.config.cmd;
      args = this.config.args;
      workDir = this.config.workDir;
    }

    const options: ExecCmdOptions = {
      cwd: workDir ?? context.workDir,
      ignoreBadExitCode: true,
    };

    const result = await execCmd(context, cmd, args, options);

    return {
      failed: result.exitCode > 0 ? new ModuleExecErrorBadExitCode(result.exitCode).toString() : undefined,
      vars: result,
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleExecSchema, ModuleExec);
