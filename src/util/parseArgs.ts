/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiParseArgsLogOptions, parseArgsLogOptions } from './logger';
import { joiAttemptRequired, joiValidateSyncFSExists } from './joi';

import { loadYAMLFromFile } from './yaml';

export const parseArgsConfigOptionsConfigFileKey = 'configFile';

export const parseArgsConfigOptions: ParseArgsOptionsConfig = {
  // Config file path
  [parseArgsConfigOptionsConfigFileKey]: {
    type: 'string',
    short: 'c',
  },
};

export async function loadConfig<T>(configFile: string | undefined, schema: Joi.Schema): Promise<T> {
  const configObject = (configFile ? await loadYAMLFromFile(configFile) : {}) ?? {};
  return joiAttemptRequired(configObject, schema);
}

export const parseArgsAppBaseOptions: ParseArgsOptionsConfig = {
  ...parseArgsLogOptions,
  ...parseArgsConfigOptions,
};

export const parseArgsAppBaseJoiObject = Joi.object()
  .append(joiParseArgsLogOptions)
  .append({
    [parseArgsConfigOptionsConfigFileKey]: Joi.string().custom(joiValidateSyncFSExists),
  });
