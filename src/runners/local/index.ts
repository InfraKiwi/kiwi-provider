import { newDebug } from '../../util/debug';
import type { RunnerContext, RunnerRunRecipesResult } from '../abstractRunner';
import { AbstractRunner } from '../abstractRunner';
import { runnerRegistryEntryFactory } from '../registry';
import type { RunnerLocalInterface } from './schema.gen';
import type { ExecCmdOptions } from '../../util/exec';
import { execCmd } from '../../util/exec';
import type { ContextLogger } from '../../util/context';
import { fsPromiseReadFile, fsPromiseTmpDir, fsPromiseTmpFile } from '../../util/fs';
import {
  downloadNodeDist,
  getCurrentNodeJSArch,
  getCurrentNodeJSPlatform,
  NodeJSPlatform,
} from '../../util/downloadNodeDist';
import type { RunStatistics } from '../../util/runContext';
import { createCJSRunnerBundle } from '../../util/createCJSRunnerBundle';
import { RunnerLocalSchema } from './schema';

const debug = newDebug(__filename);

export class RunnerLocal extends AbstractRunner<RunnerLocalInterface> {
  #workDir?: string;
  #nodeBin?: string;
  #cjsBundle?: string;

  async setUp(context: ContextLogger): Promise<void> {
    super.setUp(context);
    await this.#prepareEnvironment(context);
  }

  async #prepareEnvironment(context: ContextLogger) {
    /*
    We need to set up the environment inside the container, meaning that we need a properly working
    nodejs executable.
     */
    const nodePlatform = getCurrentNodeJSPlatform();
    const nodeBin = await downloadNodeDist(context, {
      platform: nodePlatform,
      arch: getCurrentNodeJSArch(),
    });

    if (nodePlatform == NodeJSPlatform.linux || nodePlatform == NodeJSPlatform.darwin) {
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
      const runnerBundle = await createCJSRunnerBundle(context);
      await this.#nodeExec(context, [runnerBundle, 'version']);
      this.#cjsBundle = runnerBundle;
    }

    this.#workDir = await fsPromiseTmpDir({ keep: false });
    context.logger.verbose(`Local runner set up`, {
      workDir: this.#assertWorkDir(),
      cjsBundle: this.#assertCJSBundle(),
      nodeBin: this.#assertNodeBin(),
    });
  }

  async runRecipes(context: RunnerContext, archiveDir: string, ids: string[]): Promise<RunnerRunRecipesResult> {
    context.logger.verbose(`Running recipes`, { archiveDir, ids });
    const logFile = await fsPromiseTmpFile({ keep: false, discardDescriptor: true, postfix: '.log' });
    const statsFileName = await fsPromiseTmpFile({ keep: false, discardDescriptor: true, postfix: '.json' });

    const args: string[] = [
      'runRecipesFromArchive',
      '--logFile',
      logFile,
      '--logNoConsole',
      '--statsFileName',
      statsFileName,
      '--archiveDir',
      archiveDir,
    ];

    if (context.testingMode) {
      args.push('--testingMode');
    }

    args.push(...ids);

    const result = await this.#runnerExec(context, args);

    let statistics: Record<string, RunStatistics>;
    try {
      statistics = JSON.parse(await fsPromiseReadFile(statsFileName, 'utf-8'));
    } catch (ex) {
      context.logger.error(`Failed to process statistics file`, { error: ex });
      statistics = {};
    }

    const logs = this.parseRunRecipesFromArchiveLogs(context, await fsPromiseReadFile(logFile, 'utf-8'));
    for (const entry of logs) {
      context.logger.log(entry);
    }

    return {
      statistics,
      output: this.formatRunShellOutput(result),
    };
  }

  async uploadAndExtractTarGZArchive(context: ContextLogger, src: string): Promise<string> {
    context.logger.verbose(`Uploading and extracting archive`, { src });
    const tmpDir = await fsPromiseTmpDir({ keep: false });
    await this.#localExtractTarGZArchive(context, src, tmpDir);
    return tmpDir;
  }

  #assertNodeBin(): string {
    if (this.#nodeBin == null) {
      throw new Error(`Node binary not initialized`);
    }
    return this.#nodeBin;
  }

  #assertWorkDir(): string {
    if (this.#workDir == null) {
      throw new Error(`Working directory not initialized`);
    }
    return this.#workDir;
  }

  #assertCJSBundle(): string {
    if (this.#cjsBundle == null) {
      throw new Error(`Runner binary not initialized`);
    }
    return this.#cjsBundle;
  }

  async #nodeExec(context: ContextLogger, args: string[]) {
    const nodeBin = this.#assertNodeBin();
    context.logger.verbose(`Executing NodeJS command`, { args });
    return await execCmd(context, nodeBin, args);
  }

  async #runnerExec(context: ContextLogger, args: string[], options?: ExecCmdOptions) {
    const workDir = this.#assertWorkDir();
    const nodeBin = this.#assertNodeBin();
    const cjsBundle = this.#assertCJSBundle();
    context.logger.verbose(`Executing runner command`, { args });
    return await execCmd(context, nodeBin, [cjsBundle, ...args], { ...options, cwd: workDir });
  }

  async #localExtractTarGZArchive(context: ContextLogger, archiveFile: string, dst: string) {
    context.logger.verbose('Extracting archive', { archiveFile, dst });
    await execCmd(context, 'tar', ['-xzf', archiveFile, '-C', dst]);
  }
}

runnerRegistryEntryFactory.register(RunnerLocalSchema, RunnerLocal);
