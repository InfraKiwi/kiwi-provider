/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Logger } from 'winston';
import winston from 'winston';
import type { RunStatistics } from './runContext';
import { secondsToHMS } from './date';
import traverse from 'traverse';
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam';
import util from 'node:util';
import type { SchemaMap } from 'joi';
import Joi from 'joi';
import { getArgDefaultFromOptions } from './args';
import { getJoiEnumValues, joiKeepOnlyKeysInJoiSchema } from './joi';
import type * as Transport from 'winston-transport';
import type { ContextLogger } from './context';
import { fsPromiseTmpFile } from './fs';
import type { FileTransportInstance } from 'winston/lib/winston/transports';
import { envIsProduction } from './env';
import type * as logform from 'logform';
import { dumpYAML } from './yaml';

Error.stackTraceLimit = 100;

const format = winston.format;

export enum LogLevels {
  error = 'error',
  warn = 'warn',
  info = 'info',
  http = 'http',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly',
}

let globalLogLevel: LogLevels | undefined = undefined;

export function setGlobalLogLevel(logLevel: LogLevels) {
  globalLogLevel = logLevel;
}

const showHostname = false;

const maskingRegistry: string[] = [];

export function maskSensitiveValue(value: string) {
  maskingRegistry.push(value);
}

export const loggingMaskedPlaceholder = '[MASKED]';

function maskString(val?: string): string | undefined {
  if (val == null) {
    return undefined;
  }
  for (const str of maskingRegistry) {
    val = val.replace(str, loggingMaskedPlaceholder);
  }
  return val;
}

const maskSecrets = format(
  ({
    level,
    hostname,
    label,
    message,
    timestamp,
    statistics,
    [LEVEL]: symLevel,
    [MESSAGE]: symMessage,
    [SPLAT]: symSplat,
    ...rest
  }) => {
    message = maskString(message);
    symMessage = maskString(symMessage);
    traverse(rest).forEach(function (val) {
      if (this.isLeaf && typeof val == 'string') {
        this.update(maskString(val));
      }
    });
    traverse(rest).forEach(function (val) {
      if (this.isLeaf && typeof val == 'string') {
        this.update(maskString(val));
      }
    });

    return {
      level,
      hostname,
      label,
      message,
      timestamp,
      statistics,
      [LEVEL]: symLevel,
      [MESSAGE]: symMessage,
      [SPLAT]: symSplat,
      ...rest,
    };
  }
);

const getCompactFormat = (toYAML: boolean) =>
  format.printf(
    ({
      level,
      hostname,
      label,
      message,
      timestamp,
      statistics,
      [LEVEL]: symLevel,
      [MESSAGE]: symMessage,
      [SPLAT]: symSplat,
      ...rest
    }) => {
      const s = statistics as RunStatistics | undefined;
      const ts = typeof timestamp == 'number' ? new Date(timestamp).toISOString() : timestamp;
      const parts: string[] = [
        ...(s?.startTime ? ['[' + secondsToHMS((new Date().getTime() - s.startTime) / 1000) + ']'] : []),
        `[${level}]`,
        ...(showHostname && hostname ? [`[${hostname}]`] : []),
        ...(s ? [`[${s.processedTasksCount}/${s.totalTasksCount}]`] : []),
        ...(label ? [`[${label}]`] : []),
      ];
      const errors: Error[] = [];
      traverse(rest).forEach(function (val) {
        if (val instanceof Error) {
          errors.push(val);
          this.remove();
        }
      });

      let other = '';

      if (Object.keys(rest).length > 0) {
        if (toYAML) {
          other = '\n' + dumpYAML(rest);
        } else {
          other = ' ' + JSON.stringify(rest);
        }
      }

      return `${ts} ${parts.join('')} ${message}${other}${
        errors.length > 0 ? `, Errors (count ${errors.length}): ${util.inspect(errors, false, 5)}` : ''
      }`;
    }
  );

export interface NewLoggerArgs {
  logLevel?: LogLevels;
  logFile?: string;
  logNoConsole?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultMeta?: any;
  transports?: Transport[];
  logStyle?: CustomFormatStyle;
  logStackTraceDepth?: number;
}

export function newLoggerFromParseArgs(args: NewLoggerArgs) {
  return newLogger(joiKeepOnlyKeysInJoiSchema(args, joiParseArgsLogOptionsSchema));
}

function jsonReplacer(key: string, val: unknown) {
  if (val instanceof Error) {
    return {
      message: val.message,
      name: val.name,
      stack: val.stack,
      cause: val.cause?.toString(),
    };
  }
  return val;
}

export enum CustomFormatStyle {
  json = 'json',
  compactJSON = 'compactJSON',
  compactYAML = 'compactYAML',
}

function getCustomFormat(style: CustomFormatStyle = CustomFormatStyle.compactJSON): logform.Format {
  return format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    maskSecrets(),
    style == CustomFormatStyle.json
      ? format.json({
          circularValue: null,
          replacer: jsonReplacer,
        })
      : getCompactFormat(style == CustomFormatStyle.compactYAML)
  );
}

export function newLogger(args?: NewLoggerArgs) {
  const { logLevel, logFile, logStyle, logNoConsole, logStackTraceDepth, defaultMeta } = args ?? {};

  if (logStackTraceDepth != null) {
    Error.stackTraceLimit = logStackTraceDepth;
  }

  const transports = args?.transports ?? [];

  if (transports.length == 0 && logNoConsole != true) {
    transports.push(new winston.transports.Console());
  }

  if (logFile) {
    const logTransport = new winston.transports.File({ filename: logFile });
    logTransport.format = getCustomFormat(CustomFormatStyle.json);
    transports.push(logTransport);
  }

  const logger = winston.createLogger({
    level: logLevel ?? globalLogLevel ?? (envIsProduction ? LogLevels.info : LogLevels.debug),
    format: getCustomFormat(logStyle),
    transports,
    defaultMeta,
  });
  return logger;
}

export const defaultLogger = newLogger();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function uncaught(logger: Logger): (err: any) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (err: any) => {
    logger.error('Uncaught error', { err });
  };
}

export const parseArgsLogOptions: ParseArgsOptionsConfig = {
  logLevel: {
    type: 'string',
    short: 'v',
    default: LogLevels.info,
  },
  logFile: { type: 'string' },
  logNoConsole: {
    type: 'boolean',
    default: false,
  },
  logStyle: {
    type: 'string',
    default: CustomFormatStyle.compactYAML,
  },
  logStackTraceDepth: {
    type: 'string',
  },
};

export const joiParseArgsLogOptions: SchemaMap = {
  logLevel: getJoiEnumValues(LogLevels).default(getArgDefaultFromOptions(parseArgsLogOptions, 'logLevel')),
  logFile: Joi.string(),
  logNoConsole: Joi.boolean(),
  logStackTraceDepth: Joi.number(),
  logStyle: getJoiEnumValues(CustomFormatStyle).default(getArgDefaultFromOptions(parseArgsLogOptions, 'logStyle')),
};

export const joiParseArgsLogOptionsSchema = Joi.object(joiParseArgsLogOptions);

export class ChildLoggerWithLogFile {
  readonly logFile: string;
  readonly logger: Logger;

  constructor(logger: winston.Logger, logFile: string) {
    this.logFile = logFile;
    this.logger = logger;
  }

  async wrapContext<T extends ContextLogger, R>(
    context: T,
    fn: (context: T) => Promise<R>,
    onFinally?: (originalContext: T) => Promise<void>
  ): Promise<R> {
    try {
      return await fn({
        ...context,
        logger: this.logger,
      });
    } finally {
      await onFinally?.call(null, context);
    }
  }
}

export interface TemporaryLogFileTransport {
  transport: FileTransportInstance;
  logFile: string;
}

async function getTemporaryLogFileTransport(context: ContextLogger, label: string): Promise<TemporaryLogFileTransport> {
  const logFile = await fsPromiseTmpFile({
    discardDescriptor: true,
    prefix: label,
    postfix: '.log',
  });
  context.logger.debug(`Storing temporary logs for ${label} in ${logFile}`);
  const logTransport = new winston.transports.File({
    filename: logFile,
    level: 'debug',
  });
  return {
    transport: logTransport,
    logFile,
  };
}

export async function getChildLoggerWithLogFile(
  context: ContextLogger,
  label: string
): Promise<ChildLoggerWithLogFile> {
  const childLogger = newLogger({ defaultMeta: context.logger.defaultMeta });
  const transport = await getTemporaryLogFileTransport(context, label);
  transport.transport.format = winston.format.combine(childLogger.format, winston.format.uncolorize());
  childLogger.configure({ transports: [...context.logger.transports, transport.transport] });
  return new ChildLoggerWithLogFile(childLogger, transport.logFile);
}
