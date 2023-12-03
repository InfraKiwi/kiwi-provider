import util from 'node:util';
import type { ExecFileOptions, ExecOptions } from 'node:child_process';
import * as childProcess from 'node:child_process';
import type { ContextLogger } from './context';
import type { ObjectEncodingOptions } from 'node:fs';
import { getErrorPrintfClass } from './error';

const promiseExec = util.promisify(childProcess.exec);
const promiseExecFile = util.promisify(childProcess.execFile);

export interface ExecOptionsCommon {
  ignoreBadExitCode?: boolean;
  logVerbose?: boolean;
}

export type PromiseExecWithChild = childProcess.PromiseWithChild<{ stdout: string | Buffer; stderr: string | Buffer }>;

export const ExecShellErrorThrow = getErrorPrintfClass('ExecShellErrorThrow', 'Shell command execution error: %s');

export const ExecCmdErrorThrow = getErrorPrintfClass('ExecCmdErrorThrow', 'Command execution error: %s');
export const ExecErrorExitCode = getErrorPrintfClass('ExecErrorExitCode', 'Command execution error (bad exit code %d)');

export interface RunShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export type ExecShellOptions = ExecOptionsCommon & ObjectEncodingOptions & ExecOptions;

export async function execShell(
  context: ContextLogger,
  cmd: string,
  options: ExecShellOptions = {},
): Promise<RunShellResult> {
  const { ignoreBadExitCode, ...otherOptions } = options;
  const promise = promiseExec(cmd, otherOptions);
  try {
    const result = await runShellCommandInternal(context, promise, {
      ignoreBadExitCode,
    });
    context.logger.verbose(`Exec shell result`, {
      cmd,
      ...result,
    });
    return result;
  } catch (ex) {
    throw new ExecShellErrorThrow(ex);
  }
}

export type ExecCmdOptions = ExecOptionsCommon & ObjectEncodingOptions & ExecFileOptions;

export async function execCmd(
  context: ContextLogger,
  cmd: string,
  args?: string[],
  options: ExecCmdOptions = {},
): Promise<RunShellResult> {
  const { ignoreBadExitCode, ...otherOptions } = options;
  const promise = promiseExecFile(cmd, args, otherOptions);
  try {
    options.logVerbose &&
      context.logger.verbose(`Exec cmd`, {
        cmd,
        args,
      });
    const result = await runShellCommandInternal(context, promise, {
      ignoreBadExitCode,
    });
    options.logVerbose &&
      context.logger.verbose(`Exec cmd (result)`, {
        cmd,
        args,
        ...result,
      });
    return result;
  } catch (ex) {
    throw ExecCmdErrorThrow.withCause(ex, ex);
  }
}

async function runShellCommandInternal(
  context: ContextLogger,
  promise: PromiseExecWithChild,
  options: ExecOptionsCommon,
): Promise<RunShellResult> {
  let stdout = '';
  let stderr = '';
  let exitCode: number | null = null;

  const child = promise.child;
  child.stdout?.on('data', function (data) {
    stdout += data;
  });
  child.stderr?.on('data', function (data) {
    stderr += data;
  });
  child.on('close', function (code) {
    exitCode = code;
  });

  await promise;

  exitCode ??= 0;

  if (!options.ignoreBadExitCode && exitCode > 0) {
    throw new ExecErrorExitCode(exitCode);
  }

  return {
    stdout,
    stderr,
    exitCode,
  };
}
