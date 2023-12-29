/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiObjectWithPattern } from '../../util/joi';

export const ModuleShellSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.object({
      shell: Joi.string().description(
        'The shell to use. Defaults to /bin/sh on UNIX platforms and process.env.ComSpec on Windows.'
      ),
      cmd: Joi.string().min(1).required().description('The command to execute in the shell.'),
      workDir: Joi.string().description('The working directory of the execution.'),
      uid: Joi.number().description('The id of the user under which to execute the command.'),
      gid: Joi.number().description('The id of the group under which to execute the command.'),
      env: joiObjectWithPattern(Joi.string()).description('Any environment variables to pass to the command.'),
    }),
    Joi.string().min(1).required().description('The command to execute in the default shell.'),
  ])
);
