/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractRegistryEntry } from '../util/registry';
import type { ContextLogger, ContextWorkDir } from '../util/context';
import type { RunStatistics } from '../util/runContext';
import process from 'node:process';
import type { LogEntry } from 'winston';
import type { RunShellResult } from '../util/exec';
import path from 'node:path';

export interface RunnerContext extends ContextLogger {
  testingMode?: boolean;
}

export interface RunnerContextSetup extends ContextLogger, ContextWorkDir {}
export interface RunnerSetupOptions {
  skipKiwiSetup?: boolean;
}

export interface RunnerRunRecipesResult {
  statistics: Record<string, RunStatistics>;
  output?: string;
}

/* By adding any of these runners, the whole system becomes also a push one. Heh. */
export abstract class AbstractRunner<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  // Used to execute commands before the test run
  async setUp(context: RunnerContextSetup, options?: RunnerSetupOptions): Promise<void> {}

  // Used to execute commands after the test run
  async tearDown(context: ContextLogger): Promise<void> {}

  /*
   * Function used to upload a generic archive, must support .tar.gz archives.
   * Returns the archive path.
   */
  abstract uploadAndExtractTarGZArchive(context: ContextLogger, src: string): Promise<string>;

  // Executes a recipe of the uploaded archive
  abstract runRecipes(context: RunnerContext, archiveDir: string, id: string[]): Promise<RunnerRunRecipesResult>;

  protected get entryPointFileName() {
    return path.join(__dirname, '..', '..', 'cmd', 'kiwiCLI.ts');
  }

  protected assertNodeDistVersion(detectedVersion: string) {
    if (detectedVersion != process.version) {
      throw new Error(`Invalid node version detected: ${detectedVersion}, expected ${process.version}`);
    }
  }

  protected printRunnerLogs(context: ContextLogger, line: string) {
    const logs = this.parseRunnerLogs(context, line);
    for (const entry of logs) {
      context.logger.log(entry);
    }
  }

  protected parseRunnerLogs(context: ContextLogger, logs: string): LogEntry[] {
    const lines = logs
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s != '');

    const parsed: LogEntry[] = [];

    for (const line of lines) {
      try {
        // Expect JSON
        parsed.push(JSON.parse(line));
      } catch (ex) {
        parsed.push({
          message: line,
          level: 'warn',
        });
      }
    }

    return parsed;
  }

  protected formatRunShellOutput(result: RunShellResult): string {
    const outputArr: string[] = [];
    {
      outputArr.push('### exitCode=' + result.exitCode.toString());
      const stdout = result.stdout.trim();
      if (stdout.length > 0) {
        outputArr.push('### stdout ###' + '\n\n' + stdout);
      }
      const stderr = result.stderr.trim();
      if (stderr.length > 0) {
        outputArr.push('### stderr ###' + '\n\n' + stdout);
      }
    }
    return outputArr.join('\n\n');
  }
}

export type AbstractRunnerInstance = InstanceType<typeof AbstractRunner>;
