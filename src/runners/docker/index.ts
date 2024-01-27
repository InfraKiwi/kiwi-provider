/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunnerContext, RunnerContextSetup, RunnerRunRecipesResult } from '../abstractRunner';
import { AbstractRunner } from '../abstractRunner';
import { runnerRegistryEntryFactory } from '../registry';
import type { DockerInspectPlatform } from './schema';
import { RunnerDockerReadyIntervalDefault, RunnerDockerReadyTimeoutDefault } from './schema';
import { DockerInspectResultSchema } from './schema';
import {
  RunnerDockerBinaryDefault,
  RunnerDockerSchema,
  RunnerDockerSupportedPlatforms,
  RunnerDockerSleepCommands,
} from './schema';
import type { DockerInspectResultInterface, RunnerDockerInterface } from './schema.gen';
import type { ExecCmdOptions, RunShellResult } from '../../util/exec';
import { execCmd } from '../../util/exec';
import type { ContextLogger } from '../../util/context';
import { fsPromiseReadFile, fsPromiseTmpFile, fsPromiseWriteFile } from '../../util/fs';
import path from 'node:path';
import type { Axios } from 'axios';
import { downloadNodeDist, NodeJSExecutableArch, NodeJSExecutablePlatform } from '../../util/downloadNodeDist';
import type { RunStatistics } from '../../util/runContext';
import { createCJSRunnerBundle } from '../../util/createCJSRunnerBundle';
import { randomUUID } from 'node:crypto';
import { joiAttemptRequired } from '../../util/joi';
import { getErrorPrintfClass } from '../../util/error';
import { normalizePathToUnix } from '../../util/path';
import { backOff } from 'exponential-backoff';

export const RunnerDockerErrorContainerDied = getErrorPrintfClass(
  'RunnerDockerErrorContainerDied',
  'The docker container %s has died (exit code %d)'
);

export class RunnerDocker extends AbstractRunner<RunnerDockerInterface> {
  #axios?: Axios;

  #containerId?: string;
  #nodeBin?: string;
  #cjsBundle?: string;
  #containerIsDead = false;

  async setUp(context: RunnerContextSetup): Promise<void> {
    await super.setUp(context);
    await this.#prepareEnvironment(context);
  }

  async tearDown(context: ContextLogger): Promise<void> {
    if (this.#containerId && !this.#containerIsDead) {
      // const containerId = this.#containerId;
      await this.#dockerKill(context);

      /*
       * const logs = await this.#dockerLogs(context, containerId);
       * context.logger.info(`Docker container torn down`, { logs });
       */
    }
    await super.tearDown(context);
  }

  async runRecipes(context: RunnerContext, archiveDir: string, ids: string[]): Promise<RunnerRunRecipesResult> {
    context.logger.verbose('Running recipes', {
      archiveDir,
      ids,
    });
    const logFile = await this.#dockerGetTmpFile(context, '.log');
    const statsFileName = await this.#dockerGetTmpFile(context, '.json');

    const args: string[] = [
      'runRecipesFromArchive',

      '--logStyle',
      'json',
      '--logFile',
      logFile,
      // '--logNoConsole',
      '--statsFileName',
      statsFileName,
      '--archiveDir',
      archiveDir,
    ];

    if (context.testingMode) {
      args.push('--testingMode');
    }

    args.push(...ids);

    let result: RunShellResult;
    try {
      result = await this.#runnerExec(context, args, {
        streamLogs: false,
        onLog: (l, i) => this.printRunnerLogs(context, l),
      });
    } finally {
      const logFileLocal = await fsPromiseTmpFile({
        keep: false,
        discardDescriptor: true,
        postfix: '.log',
      });
      await this.#dockerDownload(context, logFile, logFileLocal);

      /*
       * const logs = this.parseRunnerLogs(context, await fsPromiseReadFile(logFileLocal, 'utf-8'));
       * for (const entry of logs) {
       *   context.logger.log(entry);
       * }
       */
    }

    const statsFileLocal = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
      postfix: '.json',
    });
    let statistics: Record<string, RunStatistics>;
    try {
      await this.#dockerDownload(context, statsFileName, statsFileLocal);
      statistics = JSON.parse(await fsPromiseReadFile(statsFileLocal, 'utf-8'));
    } catch (ex) {
      context.logger.error('Failed to download or process statistics file', { error: ex });
      statistics = {};
    }

    return {
      statistics,
      output: this.formatRunShellOutput(result),
    };
  }

  async uploadFileToTmpFile(context: ContextLogger, src: string, extension?: string): Promise<string> {
    context.logger.verbose('Uploading to tmp file', {
      src,
      extension,
    });
    const tmpFile = await this.#dockerGetTmpFile(context, extension);
    await this.#dockerUpload(context, src, tmpFile);
    return tmpFile;
  }

  async uploadAndExtractTarGZArchive(context: ContextLogger, src: string): Promise<string> {
    context.logger.verbose('Uploading and extracting archive', { src });
    const tmpFile = await this.uploadFileToTmpFile(context, src);
    const tmpDir = await this.#dockerGetTmpDir(context);
    await this.#dockerExtractTarGZArchive(context, tmpFile, tmpDir);
    return tmpDir;
  }

  async #execDockerBinCommand(
    context: ContextLogger,
    args: string[],
    options?: ExecCmdOptions
  ): Promise<RunShellResult> {
    return await execCmd(context, this.config.bin ?? RunnerDockerBinaryDefault, args, {
      ...options,
      streamLogs: options?.streamLogs ?? true,
    });
  }

  #assertContainerId(): string {
    if (this.#containerId == null) {
      throw new Error('Container not initialized');
    }
    return this.#containerId;
  }

  #assertNodeBin(): string {
    if (this.#nodeBin == null) {
      throw new Error('Node binary not initialized');
    }
    return this.#nodeBin;
  }

  #assertCJSBundle(): string {
    if (this.#cjsBundle == null) {
      throw new Error('Runner binary not initialized');
    }
    return this.#cjsBundle;
  }

  get #platform(): string {
    return this.config.platform ?? RunnerDockerSupportedPlatforms['linux/amd64'];
  }

  get #nodePlatform(): NodeJSExecutablePlatform {
    const platform = this.#basePlatform;
    switch (platform) {
      case 'linux':
        return NodeJSExecutablePlatform.linux;
      case 'windows':
        return NodeJSExecutablePlatform.win;
    }
    throw new Error(`Unsupported node platform ${platform as string}`);
  }

  get #nodeArch(): NodeJSExecutableArch {
    const platform = this.#platform;
    const fullArch = platform.substring(platform.indexOf('/') + 1);
    switch (fullArch) {
      case 'amd64':
        return NodeJSExecutableArch.x64;
      case 'arm64':
        return NodeJSExecutableArch.arm64;
      case 'arm/v7':
        return NodeJSExecutableArch.armv7l;
    }
    throw new Error(`Unsupported docker architecture ${fullArch}`);
  }

  get #basePlatform(): DockerInspectPlatform {
    return this.#platform.split('/')[0] as DockerInspectPlatform;
  }

  async #prepareEnvironment(context: RunnerContextSetup) {
    await this.#dockerRun(context);
    await this.#dockerWaitForReadyContainer(context);

    /*
     * We need to set up the environment inside the container, meaning that we need a properly working
     * nodejs executable.
     */
    const nodePlatform = this.#nodePlatform;
    const nodeBin = await downloadNodeDist(context, {
      platform: nodePlatform,
      arch: this.#nodeArch,
    });

    const nodeBinDocker = await this.uploadFileToTmpFile(context, nodeBin, path.extname(nodeBin));
    if (nodePlatform == NodeJSExecutablePlatform.linux || nodePlatform == NodeJSExecutablePlatform.darwin) {
      // Make sure the node binary is executable
      await this.dockerExec(context, ['chmod', '+x', nodeBinDocker]);
    }
    this.#nodeBin = nodeBinDocker;

    // Verify that nodejs works
    {
      const version = (await this.#nodeExec(context, ['--version'])).stdout.trim();
      this.assertNodeDistVersion(version);
    }

    // Then, prepare our run package
    {
      const runnerBundle = await createCJSRunnerBundle(context, { entryPoint: this.entryPointFileName });
      const tmpFileDocker = await this.uploadFileToTmpFile(context, runnerBundle, '.cjs');

      // Test
      context.logger.verbose('Testing bundle');
      await this.#nodeExec(context, [tmpFileDocker, 'version']);
      this.#cjsBundle = tmpFileDocker;
    }

    context.logger.verbose('Docker runner set up', {
      containerId: this.#assertContainerId(),
      cjsBundle: this.#assertCJSBundle(),
      nodeBin: this.#assertNodeBin(),
    });
  }

  async #nodeExec(context: ContextLogger, args: string[], options?: ExecCmdOptions) {
    const nodeBin = this.#assertNodeBin();
    context.logger.verbose('Executing NodeJS command', { args });
    return await this.dockerExec(context, [nodeBin, ...args], options);
  }

  async #runnerExec(context: ContextLogger, args: string[], options?: ExecCmdOptions) {
    const nodeBin = this.#assertNodeBin();
    const cjsBundle = this.#assertCJSBundle();
    context.logger.verbose('Executing runner command', { args });
    return await this.dockerExec(context, [nodeBin, cjsBundle, ...args], options);
  }

  // -------- DOCKER SPECIFIC COMMANDS --------

  #dockerLogVerbose(context: ContextLogger, msg: string, args?: object) {
    context.logger.verbose(msg, {
      cid: this.#assertContainerId(),
      ...args,
    });
  }

  async #buildDockerImage(context: RunnerContextSetup): Promise<string> {
    if (this.config.image) {
      return this.config.image;
    }

    if (this.config.dockerfile == null) {
      throw new Error(`Undefined docker runner dockerfile context`);
    }
    const { context: dockerfileContext = context.workDir, inline, args = [] } = this.config.dockerfile;

    const tag = `10infra-test-${randomUUID()}`;
    const platform = this.#platform;

    const buildArgs: string[] = ['--platform', platform, '--tag', tag, ...args];

    if (inline) {
      const tmp = await fsPromiseTmpFile({
        keep: false,
        discardDescriptor: true,
      });
      await fsPromiseWriteFile(tmp, inline);
      buildArgs.push('-f', tmp);
    }

    const contextDir = dockerfileContext;
    if (contextDir == null) {
      throw new Error(`Docker runner context directory not defined`);
    }
    context.logger.verbose(`Building test docker image with tag ${tag}`, {
      platform,
    });
    const cwd = context.workDir ?? process.cwd();
    const relativeContextDir = path.relative(cwd, contextDir);
    await this.#execDockerBinCommand(context, ['build', ...buildArgs, normalizePathToUnix(relativeContextDir)], {
      cwd: context.workDir,
    });
    context.logger.info(`Built test docker image with tag ${tag}`, {
      /*
       * stdout: result.stdout,
       * stderr: result.stderr,
       */
    });
    return tag;
  }

  // Run a container, use the wait command, and return the container id
  async #dockerRun(context: RunnerContextSetup): Promise<void> {
    const sleepCommand = this.config.sleepCommand ?? RunnerDockerSleepCommands[this.#basePlatform];
    if (sleepCommand == null) {
      throw new Error(`Wait command not defined for ${this.#basePlatform}`);
    }

    const platform = this.#platform;
    const image = await this.#buildDockerImage(context);
    context.logger.verbose('Spinning up container', {
      platform,
      image,
      sleepCommand,
    });
    const result = await this.#execDockerBinCommand(context, [
      'run',
      '--platform',
      platform,

      /*
       * Allocate a TTY for any image that requires it
       * This allows us to gather more logs.
       */
      '-t',
      '-d',
      ...(this.config.runArgs ?? []),
      image,
      ...(sleepCommand == false ? [] : sleepCommand),
    ]);
    this.#containerId = result.stdout.trim();
  }

  async #dockerWaitForReadyContainer(context: ContextLogger) {
    if (this.config.ready == null) {
      return;
    }

    const {
      command,
      timeout = RunnerDockerReadyTimeoutDefault,
      interval = RunnerDockerReadyIntervalDefault,
    } = this.config.ready;

    await backOff(
      async () => {
        await this.dockerExec(context, command);
      },
      {
        timeMultiple: 1,
        startingDelay: interval,
        delayFirstAttempt: true,
        numOfAttempts: Math.floor(timeout / interval),
      }
    );
  }

  async #dockerVerifyContainerIsAlive(context: ContextLogger) {
    const inspect = await this.#execDockerBinCommand(context, ['inspect', this.#assertContainerId()], {
      streamLogs: false,
    });
    const result = joiAttemptRequired(
      JSON.parse(inspect.stdout),
      DockerInspectResultSchema
    ) as DockerInspectResultInterface;
    const containerResult = result[0];
    if (!containerResult.State.Running) {
      const logs = await this.#dockerLogs(context, this.#assertContainerId());
      this.#containerIsDead = true;
      context.logger.error(`The docker container has died (exit code ${containerResult.State.ExitCode})`, {
        logs,
      });
      throw new RunnerDockerErrorContainerDied(this.#assertContainerId(), containerResult.State.ExitCode);
    }
  }

  async #dockerLogs(context: ContextLogger, containerId: string) {
    let logs = '';
    try {
      const logsResult = await this.#execDockerBinCommand(context, ['logs', containerId]);
      logs = [logsResult.stdout, logsResult.stderr]
        .map((s) => s.trim())
        .filter((s) => s != '')
        .join('\n\n');
    } catch (ex) {
      context.logger.debug(`Failed to fetch container logs`, { ex });
    }
    return logs;
  }

  async #dockerKill(context: ContextLogger) {
    this.#dockerLogVerbose(context, 'Killing container');
    await this.#execDockerBinCommand(context, ['kill', this.#assertContainerId()], { ignoreBadExitCode: true });
    this.#containerId = undefined;
  }

  async #dockerUpload(context: ContextLogger, src: string, dst: string) {
    this.#dockerLogVerbose(context, 'Uploading file to container', {
      src,
      dst,
    });
    await this.#dockerVerifyContainerIsAlive(context);
    await this.#execDockerBinCommand(context, ['cp', src, `${this.#assertContainerId()}:${dst}`]);
  }

  async #dockerDownload(context: ContextLogger, src: string, dst: string) {
    this.#dockerLogVerbose(context, 'Downloading file from container', {
      src,
      dst,
    });
    await this.#dockerVerifyContainerIsAlive(context);
    await this.#execDockerBinCommand(context, ['cp', `${this.#assertContainerId()}:${src}`, dst]);
  }

  async dockerExec(context: ContextLogger, args: string[], options?: ExecCmdOptions) {
    this.#dockerLogVerbose(context, 'Executing command in container', {
      args,
      streamLogs: options?.streamLogs,
    });
    await this.#dockerVerifyContainerIsAlive(context);
    return await this.#execDockerBinCommand(context, ['exec', this.#assertContainerId(), ...args], options);
  }

  async #dockerGetTmpFile(context: ContextLogger, extension = '') {
    /*
     * Upload to a temporary file
     * https://shellgeek.com/use-powershell-to-create-temporary-file/
     */
    const tmpFileCmd: string[] =
      this.#basePlatform == 'windows'
        ? ['powershell', '/C', '(New-TemporaryFile).FullName']
        : ['mktemp', ...(this.config.tmpDir ? ['-p', this.config.tmpDir] : [])];
    const tmpFile = (await this.dockerExec(context, tmpFileCmd)).stdout.trim();
    if (tmpFile == '') {
      throw new Error('Empty temporary file path returned');
    }

    return tmpFile + extension;
  }

  async #dockerGetTmpDir(context: ContextLogger) {
    // https://stackoverflow.com/questions/34559553/create-a-temporary-directory-in-powershell
    const tmpDirCmd: string[] =
      this.#basePlatform == 'windows'
        ? [
            'powershell',
            '/C',
            // TODO support for custom tmp dir
            `
$parent = [System.IO.Path]::GetTempPath()
[string] $name = [System.Guid]::NewGuid()
$fullPath = Join-Path $parent $name
New-Item -ItemType Directory -Path $fullPath > $null
$fullPath`,
          ]
        : ['mktemp', '-d', ...(this.config.tmpDir ? ['-p', this.config.tmpDir] : [])];
    const tmpFile = (await this.dockerExec(context, tmpDirCmd)).stdout.trim();
    if (tmpFile == '') {
      throw new Error('Empty temporary dir path returned');
    }
    return tmpFile;
  }

  async #dockerExtractTarGZArchive(context: ContextLogger, archiveFile: string, dst: string) {
    this.#dockerLogVerbose(context, 'Extracting archive in container', {
      archiveFile,
      dst,
    });
    const extractCmd: string[] = ['tar', '-xzf', archiveFile, '-C', dst];
    await this.dockerExec(context, extractCmd);
  }
}

runnerRegistryEntryFactory.register(RunnerDockerSchema, RunnerDocker);
