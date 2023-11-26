import Joi from 'joi';
import { getJoiParseArgsLogOptions, parseArgsLogOptions } from './logger';
import { joiAttemptAsync, joiValidateAsyncFileExists } from './joi';
import { loadYAML } from './yaml';
import { fsPromiseReadFile } from './fs';

export const parseArgsConfigOptions: ParseArgsOptionsConfig = {
  // Config file path
  configPath: {
    type: 'string',
    short: 'c',
  },
};

export async function loadConfig<T>(configPath: string | undefined, schema: Joi.Schema): Promise<T> {
  const configObject = (configPath ? loadYAML(await fsPromiseReadFile(configPath, 'utf8')) : {}) ?? {};
  return await joiAttemptAsync(configObject, schema);
}

export const parseArgsBaseOptions: ParseArgsOptionsConfig = {
  ...parseArgsLogOptions,
  ...parseArgsConfigOptions,
};

export const parseArgsBaseJoiObject = Joi.object()
  .append(getJoiParseArgsLogOptions())
  .append({
    configPath: Joi.string().external(joiValidateAsyncFileExists),
  });
