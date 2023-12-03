import Joi from 'joi';
import { joiParseArgsLogOptions, parseArgsLogOptions } from './logger';
import { joiAttemptAsync, joiValidateAsyncFileExists } from './joi';
import { loadYAMLFromFile } from './yaml';

export const parseArgsConfigOptions: ParseArgsOptionsConfig = {
  // Config file path
  configPath: {
    type: 'string',
    short: 'c',
  },
};

export async function loadConfig<T>(configPath: string | undefined, schema: Joi.Schema): Promise<T> {
  const configObject = (configPath ? await loadYAMLFromFile(configPath) : {}) ?? {};
  return await joiAttemptAsync(configObject, schema);
}

export const parseArgsAppBaseOptions: ParseArgsOptionsConfig = {
  ...parseArgsLogOptions,
  ...parseArgsConfigOptions,
};

export const parseArgsAppBaseJoiObject = Joi.object()
  .append(joiParseArgsLogOptions)
  .append({
    configPath: Joi.string().external(joiValidateAsyncFileExists),
  });
