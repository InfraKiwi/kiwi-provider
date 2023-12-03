import { newDebug } from '../../util/debug';
import type { RunnerContext, RunnerRunRecipesResult } from '../abstractRunner';
import { AbstractRunner } from '../abstractRunner';
import { runnerRegistryEntryFactory } from '../registry';
import type { DockerInspectPlatform } from './schema';
import { RunnerDockerBinaryDefault, RunnerDockerSchema, RunnerDockerSupportedPlatforms } from './schema';
import type { RunnerDockerInterface } from './schema.gen';
import type { ExecCmdOptions, RunShellResult } from '../../util/exec';
import { execCmd } from '../../util/exec';
import type { ContextLogger } from '../../util/context';
import { fsPromiseReadFile, fsPromiseTmpFile } from '../../util/fs';
import path from 'node:path';
import type { Axios } from 'axios';
import { downloadNodeDist, NodeJSArch, NodeJSPlatform } from '../../util/downloadNodeDist';
import type { RunStatistics } from '../../util/runContext';
import { createCJSRunnerBundle } from '../../util/createCJSRunnerBundle';

const debug = newDebug(__filename);

const waitCommands: { [k in DockerInspectPlatform]: string[] } = {
  linux: ['/bin/sh', '-c', 'while :; do sleep 2073600; done'],
  windows: ['powershell', '-Command', 'while($true) { Start-Sleep -Seconds 2073600; }'],
};

export class RunnerDocker extends AbstractRunner<RunnerDockerInterface> {
  #axios?: Axios;

  #containerId?: string;
  #nodeBin?: string;
  #cjsBundle?: string;

  async setUp(context: ContextLogger): Promise<void> {
    await super.setUp(context);
    await this.#prepareEnvironment(context);
  }

  async tearDown(context: ContextLogger): Promise<void> {
    if (this.#containerId) {
      await this.#dockerKill(context);
    }
    await super.tearDown(context);
  }

  async runRecipes(context: RunnerContext, archiveDir: string, ids: string[]): Promise<RunnerRunRecipesResult> {
    context.logger.verbose(`Running recipes`, { archiveDir, ids });
    const logFile = await this.#dockerGetTmpFile(context, '.log');
    const statsFileName = await this.#dockerGetTmpFile(context, '.json');

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

    const statsFileLocal = await fsPromiseTmpFile({ keep: false, discardDescriptor: true, postfix: '.json' });
    let statistics: Record<string, RunStatistics>;
    try {
      await this.#dockerDownload(context, statsFileName, statsFileLocal);
      statistics = JSON.parse(await fsPromiseReadFile(statsFileLocal, 'utf-8'));
    } catch (ex) {
      context.logger.error(`Failed to download or process statistics file`, { error: ex });
      statistics = {};
    }

    const logFileLocal = await fsPromiseTmpFile({ keep: false, discardDescriptor: true, postfix: '.log' });
    await this.#dockerDownload(context, logFile, logFileLocal);
    const logs = this.parseRunRecipesFromArchiveLogs(context, await fsPromiseReadFile(logFileLocal, 'utf-8'));
    for (const entry of logs) {
      context.logger.log(entry);
    }

    return {
      statistics,
      output: this.formatRunShellOutput(result),
    };
  }

  async uploadFileToTmpFile(context: ContextLogger, src: string, extension?: string): Promise<string> {
    context.logger.verbose(`Uploading to tmp file`, { src, extension });
    const tmpFile = await this.#dockerGetTmpFile(context, extension);
    await this.#dockerUpload(context, src, tmpFile);
    return tmpFile;
  }

  async uploadAndExtractTarGZArchive(context: ContextLogger, src: string): Promise<string> {
    context.logger.verbose(`Uploading and extracting archive`, { src });
    const tmpFile = await this.uploadFileToTmpFile(context, src);
    const tmpDir = await this.#dockerGetTmpDir(context);
    await this.#dockerExtractTarGZArchive(context, tmpFile, tmpDir);
    return tmpDir;
  }

  async #execDockerBinCommand(
    context: ContextLogger,
    args: string[],
    options?: ExecCmdOptions,
  ): Promise<RunShellResult> {
    return await execCmd(context, this.config.bin ?? RunnerDockerBinaryDefault, args, options);
  }

  #assertContainerId(): string {
    if (this.#containerId == null) {
      throw new Error(`Container not initialized`);
    }
    return this.#containerId;
  }

  #assertNodeBin(): string {
    if (this.#nodeBin == null) {
      throw new Error(`Node binary not initialized`);
    }
    return this.#nodeBin;
  }

  #assertCJSBundle(): string {
    if (this.#cjsBundle == null) {
      throw new Error(`Runner binary not initialized`);
    }
    return this.#cjsBundle;
  }

  get #platform(): string {
    return this.config.platform ?? RunnerDockerSupportedPlatforms['linux/amd64'];
  }

  get #nodePlatform(): NodeJSPlatform {
    const platform = this.#basePlatform;
    switch (platform) {
      case 'linux':
        return NodeJSPlatform.linux;
      case 'windows':
        return NodeJSPlatform.win;
    }
    throw new Error(`Unsupported node platform ${platform}`);
  }

  get #nodeArch(): NodeJSArch {
    const platform = this.#platform;
    const fullArch = platform.substring(platform.indexOf('/') + 1);
    switch (fullArch) {
      case 'amd64':
        return NodeJSArch.x64;
      case 'arm64':
        return NodeJSArch.arm64;
      case 'arm/v7':
        return NodeJSArch.armv7l;
    }
    throw new Error(`Unsupported docker architecture ${fullArch}`);
  }

  get #basePlatform(): DockerInspectPlatform {
    return this.#platform.split('/')[0] as DockerInspectPlatform;
  }

  async #prepareEnvironment(context: ContextLogger) {
    await this.#dockerRun(context);

    /*
    We need to set up the environment inside the container, meaning that we need a properly working
    nodejs executable.
     */
    const nodePlatform = this.#nodePlatform;
    const nodeBin = await downloadNodeDist(context, {
      platform: nodePlatform,
      arch: this.#nodeArch,
    });

    const nodeBinDocker = await this.uploadFileToTmpFile(context, nodeBin, path.extname(nodeBin));
    if (nodePlatform == NodeJSPlatform.linux || nodePlatform == NodeJSPlatform.darwin) {
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
      const runnerBundle = await createCJSRunnerBundle(context);
      const tmpFileDocker = await this.uploadFileToTmpFile(context, runnerBundle, '.cjs');

      // Test
      context.logger.verbose(`Testing bundle`);
      await this.#nodeExec(context, [tmpFileDocker, 'version']);
      this.#cjsBundle = tmpFileDocker;
    }

    context.logger.verbose(`Docker runner set up`, {
      containerId: this.#assertContainerId(),
      cjsBundle: this.#assertCJSBundle(),
      nodeBin: this.#assertNodeBin(),
    });
  }

  async #nodeExec(context: ContextLogger, args: string[]) {
    const nodeBin = this.#assertNodeBin();
    context.logger.verbose(`Executing NodeJS command`, { args });
    return await this.dockerExec(context, [nodeBin, ...args]);
  }

  async #runnerExec(context: ContextLogger, args: string[], options?: ExecCmdOptions) {
    const nodeBin = this.#assertNodeBin();
    const cjsBundle = this.#assertCJSBundle();
    context.logger.verbose(`Executing runner command`, { args });
    return await this.dockerExec(context, [nodeBin, cjsBundle, ...args], options);
  }

  // -------- DOCKER SPECIFIC COMMANDS --------

  #dockerLogVerbose(context: ContextLogger, msg: string, args?: object) {
    context.logger.verbose(msg, { cid: this.#assertContainerId(), ...args });
  }

  // Run a container, use the wait command, and return the container id
  async #dockerRun(context: ContextLogger): Promise<void> {
    const waitCommand = this.config.waitCommand ?? waitCommands[this.#basePlatform];
    if (waitCommand == null) {
      throw new Error(`Wait command not defined for ${this.#basePlatform}`);
    }

    const platform = this.#platform;
    const image = this.config.image;
    context.logger.verbose(`Spinning up container`, { platform, image, waitCommand });
    const result = await this.#execDockerBinCommand(context, [
      'run',
      '--platform',
      platform,
      '-d',
      image,
      ...waitCommand,
    ]);
    this.#containerId = result.stdout.trim();
  }

  async #dockerKill(context: ContextLogger) {
    this.#dockerLogVerbose(context, 'Killing container');
    await this.#execDockerBinCommand(context, ['kill', this.#assertContainerId()], { ignoreBadExitCode: true });
    this.#containerId = undefined;
  }

  async #dockerUpload(context: ContextLogger, src: string, dst: string) {
    this.#dockerLogVerbose(context, 'Uploading file to container', { src, dst });
    await this.#execDockerBinCommand(context, ['cp', src, `${this.#assertContainerId()}:${dst}`]);
  }

  async #dockerDownload(context: ContextLogger, src: string, dst: string) {
    this.#dockerLogVerbose(context, 'Downloading file from container', { src, dst });
    await this.#execDockerBinCommand(context, ['cp', `${this.#assertContainerId()}:${src}`, dst]);
  }

  async dockerExec(context: ContextLogger, args: string[], options?: ExecCmdOptions) {
    this.#dockerLogVerbose(context, 'Executing command in container', { args });
    return await this.#execDockerBinCommand(context, ['exec', this.#assertContainerId(), ...args], options);
  }

  async #dockerGetTmpFile(context: ContextLogger, extension?: string) {
    // Upload to a temporary file
    // https://shellgeek.com/use-powershell-to-create-temporary-file/
    const tmpFileCmd: string[] =
      this.#basePlatform == 'windows' ? ['powershell', '/C', '(New-TemporaryFile).FullName'] : ['mktemp'];
    const tmpFile = (await this.dockerExec(context, tmpFileCmd)).stdout.trim();
    if (tmpFile == '') {
      throw new Error(`Empty temporary file path returned`);
    }
    return tmpFile + (extension ?? '');
  }

  async #dockerGetTmpDir(context: ContextLogger) {
    // https://stackoverflow.com/questions/34559553/create-a-temporary-directory-in-powershell
    const tmpDirCmd: string[] =
      this.#basePlatform == 'windows'
        ? [
            'powershell',
            '/C',
            `
$parent = [System.IO.Path]::GetTempPath()
[string] $name = [System.Guid]::NewGuid()
$fullPath = Join-Path $parent $name
New-Item -ItemType Directory -Path $fullPath > $null
$fullPath`,
          ]
        : ['mktemp', '-d'];
    const tmpFile = (await this.dockerExec(context, tmpDirCmd)).stdout.trim();
    if (tmpFile == '') {
      throw new Error(`Empty temporary dir path returned`);
    }
    return tmpFile;
  }

  async #dockerExtractTarGZArchive(context: ContextLogger, archiveFile: string, dst: string) {
    this.#dockerLogVerbose(context, 'Extracting archive in container', { archiveFile, dst });
    const extractCmd: string[] = ['tar', '-xzf', archiveFile, '-C', dst];
    await this.dockerExec(context, extractCmd);
  }
}

runnerRegistryEntryFactory.register(RunnerDockerSchema, RunnerDocker);
