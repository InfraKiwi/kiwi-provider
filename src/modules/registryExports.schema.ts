import Joi from 'joi';
import { ModuleDebugSchema } from './debug/schema';
import { ModuleDownloadSchema } from './download/schema';
import { ModuleEvalSchema } from './eval/schema';
import { ModuleExecSchema } from './exec/schema';
import { ModuleExitSchema } from './exit/schema';
import { ModuleFailSchema } from './fail/schema';
import { ModuleHTTPSchema } from './http/schema';
import { ModuleHTTPListenerSchema } from './httpListener/schema';
import { ModuleInfoSchema } from './info/schema';
import { ModuleLoadSchema } from './load/schema';
import { ModuleLookPathSchema } from './lookPath/schema';
import { ModuleLoopSchema } from './loop/schema';
import { ModuleRecipeSchema } from './recipe/schema';
import { ModuleSetSchema } from './set/schema';
import { ModuleShellSchema } from './shell/schema';
import { ModuleStatSchema } from './stat/schema';
import { ModuleStoreSchema } from './store/schema';
import { ModuleSwitchSchema } from './switch/schema';
import { ModuleTempSchema } from './temp/schema';
import { ModuleTempDirSchema } from './temp/schema';
import { ModuleTestSchema } from './test/schema';
import { ModuleTestSilentSchema } from './test/schema';

export const registryEntriesModulesSchema = Joi.object({
  debug: ModuleDebugSchema,
  download: ModuleDownloadSchema,
  eval: ModuleEvalSchema,
  exec: ModuleExecSchema,
  exit: ModuleExitSchema,
  fail: ModuleFailSchema,
  http: ModuleHTTPSchema,
  httpListener: ModuleHTTPListenerSchema,
  info: ModuleInfoSchema,
  load: ModuleLoadSchema,
  lookPath: ModuleLookPathSchema,
  loop: ModuleLoopSchema,
  recipe: ModuleRecipeSchema,
  set: ModuleSetSchema,
  shell: ModuleShellSchema,
  stat: ModuleStatSchema,
  store: ModuleStoreSchema,
  switch: ModuleSwitchSchema,
  temp: ModuleTempSchema,
  tempDir: ModuleTempDirSchema,
  test: ModuleTestSchema,
  testSilent: ModuleTestSilentSchema,
}).meta({ className: 'registryEntriesModulesInterface' });
