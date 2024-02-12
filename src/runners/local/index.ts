/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunnerContext, RunnerRunRecipesResult, RunnerSetupOptions } from '../abstractRunner';
import { AbstractRunner } from '../abstractRunner';
import { runnerRegistryEntryFactory } from '../registry';
import type { RunnerLocalInterface } from './schema.gen';
import type { ExecCmdOptions } from '../../util/exec';
import { execCmd } from '../../util/exec';
import type { ContextLogger } from '../../util/context';
import { fsPromiseReadFile, fsPromiseTmpDir, fsPromiseTmpFile } from '../../util/fs';
import {
  downloadNodeDist,
  getCurrentNodeJSExecutableArch,
  getCurrentNodeJSExecutablePlatform,
  NodeJSExecutablePlatform,
} from '../../util/downloadNodeDist';
import type { RunStatistics } from '../../util/runContext';
import { createCJSRunnerBundle } from '../../util/createCJSRunnerBundle';
import { RunnerLocalSchema } from './schema';

export class RunnerLocal extends AbstractRunner<RunnerLocalInterface> {
  #workDir?: string;
  #nodeBin?: string;
  #cjsBundle?: string;

  async setUp(context: ContextLogger, options?: RunnerSetupOptions): Promise<void> {
    await super.setUp(context);
    await this.#prepareEnvironment(context, options);
  }

  async #prepareEnvironment(context: ContextLogger, options?: RunnerSetupOptions) {
    this.#workDir = await fsPromiseTmpDir({ keep: false });

    if (options?.skipKiwiSetup) {
      context.logger.verbose('Local runner set up (skipped kiwi setup)', {
        workDir: this.#assertWorkDir(),
      });
      return;
    }

    /*
     * We need to set up the environment inside the container, meaning that we need a properly working
     * nodejs executable.
     */
    const nodePlatform = getCurrentNodeJSExecutablePlatform();
    const nodeBin = await downloadNodeDist(context, {
      platform: nodePlatform,
      arch: getCurrentNodeJSExecutableArch(),
    });

    if (nodePlatform == NodeJSExecutablePlatform.linux || nodePlatform == NodeJSExecutablePlatform.darwin) {
      // Make sure the node binary is executable
      await execCmd(context, 'chmod', ['+x', nodeBin]);
    }
    this.#nodeBin = nodeBin;

    // Verify that nodejs works
    {
      const version = (await this.#nodeExec(context, ['--version'])).stdout.trim();
      this.assertNodeDistVersion(version);
    }

    // Then, prepare our run package
    {
      const runnerBundle = await createCJSRunnerBundle(context, { entryPoint: this.entryPointFileName });
      await this.#nodeExec(context, [runnerBundle, 'version']);
      this.#cjsBundle = runnerBundle;
    }

    this.#workDir = await fsPromiseTmpDir({ keep: false });
    context.logger.verbose('Local runner set up', {
      workDir: this.#assertWorkDir(),
      cjsBundle: this.#assertCJSBundle(),
      nodeBin: this.#assertNodeBin(),
    });
  }

  async runRecipes(context: RunnerContext, archiveDir: string, ids: string[]): Promise<RunnerRunRecipesResult> {
    context.logger.verbose('Running recipes', {
      archiveDir,
      ids,
    });

    const logFile = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
      postfix: '.log',
    });
    const statsFileName = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
      postfix: '.json',
    });

    const args: string[] = [
      'runRecipesFromArchive',

      '--logStyle',
      'json',
      '--logFile',
      logFile,

      /* '--logNoConsole', */
      '--statsFileName',
      statsFileName,
      '--archiveDir',
      archiveDir,
    ];

    if (context.testingMode) {
      args.push('--testingMode');
    }

    args.push(...ids);

    const result = await this.#runnerExec(context, args, {
      onLog: (l, i) => this.printRunnerLogs(context, l),
    });

    /*
     * let result: RunShellResult;
     * try {
     *   result = await this.#runnerExec(context, args);
     * } finally {
     *   const logs = this.parseRunnerLogs(context, await fsPromiseReadFile(logFile, 'utf-8'));
     *   for (const entry of logs) {
     *     context.logger.log(entry);
     *   }
     * }
     */

    let statistics: Record<string, RunStatistics>;
    try {
      statistics = JSON.parse(await fsPromiseReadFile(statsFileName, 'utf-8'));
    } catch (ex) {
      context.logger.error('Failed to process statistics file', { error: ex });
      statistics = {};
    }

    return {
      statistics,
      output: this.formatRunShellOutput(result),
    };
  }

  async uploadAndExtractTarGZArchive(context: ContextLogger, src: string): Promise<string> {
    context.logger.verbose('Uploading and extracting archive', { src });
    const tmpDir = await fsPromiseTmpDir({ keep: false });
    await this.#localExtractTarGZArchive(context, src, tmpDir);
    return tmpDir;
  }

  #assertNodeBin(): string {
    if (this.#nodeBin == null) {
      throw new Error('Node binary not initialized');
    }
    return this.#nodeBin;
  }

  #assertWorkDir(): string {
    if (this.#workDir == null) {
      throw new Error('Working directory not initialized');
    }
    return this.#workDir;
  }

  #assertCJSBundle(): string {
    if (this.#cjsBundle == null) {
      throw new Error('Runner binary not initialized');
    }
    return this.#cjsBundle;
  }

  async #nodeExec(context: ContextLogger, args: string[]) {
    const nodeBin = this.#assertNodeBin();
    context.logger.verbose('Executing NodeJS command', { args });
    return await execCmd(context, nodeBin, args, { streamLogs: true });
  }

  async #runnerExec(context: ContextLogger, args: string[], options?: ExecCmdOptions) {
    const workDir = this.#assertWorkDir();
    const nodeBin = this.#assertNodeBin();
    const cjsBundle = this.#assertCJSBundle();
    context.logger.verbose('Executing runner command', { args });
    return await execCmd(context, nodeBin, [cjsBundle, ...args], {
      ...options,
      cwd: workDir,
    });
  }

  async #localExtractTarGZArchive(context: ContextLogger, archiveFile: string, dst: string) {
    context.logger.verbose('Extracting archive', {
      archiveFile,
      dst,
    });
    await execCmd(context, 'tar', ['-xzf', archiveFile, '-C', dst]);
  }
}

runnerRegistryEntryFactory.register(RunnerLocalSchema, RunnerLocal);
