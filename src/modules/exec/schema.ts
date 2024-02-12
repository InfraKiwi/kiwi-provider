/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName, joiObjectWithPattern } from '../../util/joi';

export const ModuleExecResultSchema = Joi.object({
  stdout: Joi.string().required(),
  stderr: Joi.string().required(),
  exitCode: Joi.number().required(),
})
  .meta(joiMetaClassName('ModuleExecResultInterface'))
  .description('The result of the `exec` module.').example(`
  tasks:
  - label: Execute the binary
    exec:
      cmd: hello.exe
    out: execVars
  - test: |
      "Hello world!" in execVars.stdout
  `);

export const ModuleExecSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.object({
      cmd: Joi.string().min(1).required().description('The path of the binary to execute.'),
      args: Joi.array().items(Joi.string()).description('The arguments to pass to the binary.'),
      workDir: Joi.string().description('The working directory of the execution.'),
      uid: Joi.number().description('The id of the user under which to execute the binary.'),
      gid: Joi.number().description('The id of the group under which to execute the binary.'),
      env: joiObjectWithPattern(Joi.string()).description('Any environment variables to pass to the binary.'),
    }).example(`
    exec:
      cmd: my-bin
      args:
        - --hello
        - --world
    `),
    Joi.string().min(1).description('The path of the binary to execute').example(`
    exec: my-bin
    `),
    Joi.array().items(Joi.string()).min(1).description(`
    An array of strings where the first item is the path of the binary to 
    execute and the remaining elements are the arguments.
    `).example(`
    exec:
      - my-bin
      - --hello
      - --world
    `),
  ])
);
