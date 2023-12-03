import { AbstractRegistryEntry } from '../util/registry';
import type { ContextLogger } from '../util/context';
import type { RunStatistics } from '../util/runContext';
import process from 'node:process';
import type { LogEntry } from 'winston';
import type { RunShellResult } from '../util/exec';

export interface RunnerContext extends ContextLogger {
  testingMode?: boolean;
}

export interface RunnerRunRecipesResult {
  statistics: Record<string, RunStatistics>;
  output?: string;
}

/*
By adding any of these runners, the whole system becomes also a push one. Heh.
 */
export abstract class AbstractRunner<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  // Used to execute commands before the test run
  async setUp(context: ContextLogger): Promise<void> {}

  // Used to execute commands after the test run
  async tearDown(context: ContextLogger): Promise<void> {}

  //
  // // Upload a generic file to a temporary one and return the tmp file path
  // abstract uploadFileToTmpFile(context: ContextLogger, src: string, extension?: string): Promise<string>;

  // Function used to upload a generic archive, must support .tar.gz and .zip archives
  // Returns the archive path.
  abstract uploadAndExtractTarGZArchive(context: ContextLogger, src: string): Promise<string>;

  // // // Runs a command with the provided arguments
  // // abstract cmdExec(context:ContextLogger, command:string, args: string[]): Promise<RunShellResult>
  // //
  // // // Runs node with the provided arguments
  // // abstract nodeExec(context:ContextLogger, args: string[]): Promise<RunShellResult>

  // Executes a recipe of the uploaded archive
  abstract runRecipes(context: RunnerContext, archiveDir: string, id: string[]): Promise<RunnerRunRecipesResult>;

  protected assertNodeDistVersion(detectedVersion: string) {
    if (detectedVersion != process.version) {
      throw new Error(`Invalid node version detected: ${detectedVersion}, expected ${process.version}`);
    }
  }

  protected parseRunRecipesFromArchiveLogs(context: ContextLogger, logs: string): LogEntry[] {
    try {
      // Expect JSON
      return logs
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s != '')
        .map((line) => JSON.parse(line));
    } catch (ex) {
      context.logger.error(`Failed to parse runRecipesFromArchive logs`, { error: ex, logs });
    }
    return [];
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
