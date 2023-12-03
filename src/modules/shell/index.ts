import { newDebug } from '../../util/debug';
import { ModuleShellSchema } from './schema';
import type { RunContext } from '../../util/runContext';
import type { ModuleShellInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { ExecShellOptions } from '../../util/exec';
import { execShell } from '../../util/exec';
import { getErrorPrintfClass } from '../../util/error';

const debug = newDebug(__filename);

export interface ModuleShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const ModuleShellErrorBadExitCode = getErrorPrintfClass('ModuleShellErrorBadExitCode', `Bad exit code: %d`);

export class ModuleShell extends AbstractModuleBase<ModuleShellInterface, ModuleShellResult> {
  protected get disableShortie(): boolean {
    return true;
  }

  get label(): string | undefined {
    return JSON.stringify(this.config);
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleShellResult>> {
    let workDir: string | undefined;
    let cmd: string;
    if (typeof this.config == 'string') {
      cmd = this.config;
    } else {
      cmd = this.config.cmd;
      workDir = this.config.workDir;
    }

    const options: ExecShellOptions = {
      cwd: workDir ?? context.workDir,
      ignoreBadExitCode: true,
    };

    const result = await execShell(context, cmd, options);

    return {
      failed: result.exitCode > 0 ? new ModuleShellErrorBadExitCode(result.exitCode).toString() : undefined,
      vars: result,
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleShellSchema, ModuleShell);
