/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { ModuleExecSchema } from './schema';
import type { RunContext } from '../../util/runContext';
import type { ModuleExecInterface, ModuleExecResultInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { ExecCmdOptions } from '../../util/exec';
import { execCmd } from '../../util/exec';
import { getErrorPrintfClass } from '../../util/error';

const ModuleExecErrorBadExitCode = getErrorPrintfClass('ModuleExecErrorBadExitCode', 'Bad exit code: %d');

export class ModuleExec extends AbstractModuleBase<ModuleExecInterface, ModuleExecResultInterface> {
  get label(): string | undefined {
    return JSON.stringify(this.config);
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleExecResultInterface>> {
    let cmd: string;
    let args: string[] | undefined;
    let workDir: string | undefined;
    let uid: number | undefined;
    let gid: number | undefined;
    let env: Record<string, string> | undefined;

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
      workDir = this.config.workDir;
      uid = this.config.uid;
      gid = this.config.gid;
      env = this.config.env;
    }

    workDir ??= context.workDir;

    const options: ExecCmdOptions = {
      cwd: workDir,
      ignoreBadExitCode: true,
      uid,
      gid,
      env,
      streamLogs: true,
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
