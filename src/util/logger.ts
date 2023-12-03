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
  },
);

const compact = format.printf(
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
      ...(s?.startTime ? ['[' + secondsToHMS(new Date().getTime() - s.startTime) + ']'] : []),
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
    const other = Object.keys(rest).length > 0 ? ' ' + JSON.stringify(rest) : '';
    return `${ts} ${parts.join('')} ${message}${other}${
      errors.length > 0 ? ', Errors: ' + util.inspect(errors, false, 5) : ''
    }`;
  },
);

export interface NewLoggerArgs {
  logLevel?: LogLevels;
  logFile?: string;
  logNoConsole?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultMeta?: any;
  transports?: Transport[];
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

function getStandardFormat(json?: boolean): logform.Format {
  return format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    maskSecrets(),
    json ? format.json({ circularValue: null, replacer: jsonReplacer }) : compact,
  );
}

export function newLogger(args?: NewLoggerArgs) {
  const { logLevel, logFile, logNoConsole, defaultMeta } = args ?? {};

  const transports = (args ?? {}).transports ?? [];

  if (transports.length == 0 && logNoConsole != true) {
    transports.push(new winston.transports.Console());
  }

  if (logFile) {
    const logTransport = new winston.transports.File({
      filename: logFile,
    });
    logTransport.format = getStandardFormat(true);
    transports.push(logTransport);
  }

  const logger = winston.createLogger({
    level: logLevel ?? globalLogLevel ?? (envIsProduction ? LogLevels.info : LogLevels.debug),
    format: getStandardFormat(),
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
  logFile: {
    type: 'string',
  },
  logNoConsole: {
    type: 'boolean',
    default: false,
  },
};

export const joiParseArgsLogOptions: SchemaMap = {
  logLevel: getJoiEnumValues(LogLevels).default(getArgDefaultFromOptions(parseArgsLogOptions, 'logLevel')),
  logFile: Joi.string(),
  logNoConsole: Joi.boolean(),
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
    onFinally?: (originalContext: T) => Promise<void>,
  ): Promise<R> {
    try {
      return await fn({
        ...context,
        logger: this.logger,
      });
    } finally {
      onFinally?.call(null, context);
    }
  }
}

export interface TemporaryLogFileTransport {
  transport: FileTransportInstance;
  logFile: string;
}

async function getTemporaryLogFileTransport(context: ContextLogger, label: string): Promise<TemporaryLogFileTransport> {
  const logFile = await fsPromiseTmpFile({ discardDescriptor: true, prefix: label, postfix: '.log' });
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
  label: string,
): Promise<ChildLoggerWithLogFile> {
  const childLogger = newLogger({
    defaultMeta: context.logger.defaultMeta,
  });
  const transport = await getTemporaryLogFileTransport(context, label);
  transport.transport.format = winston.format.combine(childLogger.format, winston.format.uncolorize());
  childLogger.configure({
    transports: [...context.logger.transports, transport.transport],
  });
  return new ChildLoggerWithLogFile(childLogger, transport.logFile);
}
