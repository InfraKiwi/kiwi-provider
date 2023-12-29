/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { ModuleShellSchema } from './schema';
import type { RunContext } from '../../util/runContext';
import type { ModuleShellInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { ExecShellOptions } from '../../util/exec';
import { execShell } from '../../util/exec';
import { getErrorPrintfClass } from '../../util/error';

export interface ModuleShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const ModuleShellErrorBadExitCode = getErrorPrintfClass('ModuleShellErrorBadExitCode', 'Bad exit code: %d');

export class ModuleShell extends AbstractModuleBase<ModuleShellInterface, ModuleShellResult> {
  get label(): string | undefined {
    return JSON.stringify(this.config);
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleShellResult>> {
    let workDir: string | undefined;
    let shell: string | undefined;
    let uid: number | undefined;
    let gid: number | undefined;
    let env: Record<string, string> | undefined;

    let cmd: string;
    if (typeof this.config == 'string') {
      cmd = this.config;
    } else {
      cmd = this.config.cmd;
      workDir = this.config.workDir;
      uid = this.config.uid;
      gid = this.config.gid;
      env = this.config.env;
      shell = this.config.shell;
    }

    const options: ExecShellOptions = {
      cwd: workDir ?? context.workDir,
      ignoreBadExitCode: true,
      uid,
      gid,
      shell,
      env,
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
