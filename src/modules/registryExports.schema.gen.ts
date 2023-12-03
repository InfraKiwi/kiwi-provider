// Generated with: yarn gen -> cmd/schemaGen.ts

import type { ModuleDebugInterface } from './debug/schema.gen';
import type { ModuleDownloadInterface } from './download/schema.gen';
import type { ModuleEvalInterface } from './eval/schema.gen';
import type { ModuleExecInterface } from './exec/schema.gen';
import type { ModuleExitInterface } from './exit/schema.gen';
import type { ModuleFailInterface } from './fail/schema.gen';
import type { ModuleHTTPInterface } from './http/schema.gen';
import type { ModuleHTTPListenerInterface } from './httpListener/schema.gen';
import type { ModuleInfoInterface } from './info/schema.gen';
import type { ModuleLoadInterface } from './load/schema.gen';
import type { ModuleLookPathInterface } from './lookPath/schema.gen';
import type { ModuleLoopInterface } from './loop/schema.gen';
import type { ModuleRecipeInterface } from './recipe/schema.gen';
import type { ModuleSetInterface } from './set/schema.gen';
import type { ModuleShellInterface } from './shell/schema.gen';
import type { ModuleStatInterface } from './stat/schema.gen';
import type { ModuleStoreInterface } from './store/schema.gen';
import type { ModuleSwitchInterface } from './switch/schema.gen';
import type { ModuleTempInterface, ModuleTempDirInterface } from './temp/schema.gen';
import type { ModuleTestInterface, ModuleTestSilentInterface } from './test/schema.gen';

// [block registryEntriesModulesInterface begin]
export interface registryEntriesModulesInterface {

  /*
   *
   * ========= Available modules =========
   *
   * Only one of the following keys can be
   * used at the same time.
   *
   */

  /**
   * Any value type is acceptable, as it will be encoded and printed to the console
   *
   * @example //disableShortie:true
   */
  debug?: ModuleDebugInterface; //typeRef:ModuleDebugInterface:debug/schema.gen.ts:true

  download?: ModuleDownloadInterface; //typeRef:ModuleDownloadInterface:download/schema.gen.ts:true

  eval?: ModuleEvalInterface; //typeRef:ModuleEvalInterface:eval/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  exec?: ModuleExecInterface; //typeRef:ModuleExecInterface:exec/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  exit?: ModuleExitInterface; //typeRef:ModuleExitInterface:exit/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  fail?: ModuleFailInterface; //typeRef:ModuleFailInterface:fail/schema.gen.ts:true

  http?: ModuleHTTPInterface; //typeRef:ModuleHTTPInterface:http/schema.gen.ts:true

  httpListener?: ModuleHTTPListenerInterface; //typeRef:ModuleHTTPListenerInterface:httpListener/schema.gen.ts:true

  info?: ModuleInfoInterface; //typeRef:ModuleInfoInterface:info/schema.gen.ts:true

  load?: ModuleLoadInterface; //typeRef:ModuleLoadInterface:load/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  lookPath?: ModuleLookPathInterface; //typeRef:ModuleLookPathInterface:lookPath/schema.gen.ts:true

  loop?: ModuleLoopInterface; //typeRef:ModuleLoopInterface:loop/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  recipe?: ModuleRecipeInterface; //typeRef:ModuleRecipeInterface:recipe/schema.gen.ts:true

  set?: ModuleSetInterface; //typeRef:ModuleSetInterface:set/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  shell?: ModuleShellInterface; //typeRef:ModuleShellInterface:shell/schema.gen.ts:true

  stat?: ModuleStatInterface; //typeRef:ModuleStatInterface:stat/schema.gen.ts:true

  store?: ModuleStoreInterface; //typeRef:ModuleStoreInterface:store/schema.gen.ts:true

  switch?: ModuleSwitchInterface; //typeRef:ModuleSwitchInterface:switch/schema.gen.ts:true

  temp?: ModuleTempInterface; //typeRef:ModuleTempInterface:temp/schema.gen.ts:true

  tempDir?: ModuleTempDirInterface; //typeRef:ModuleTempDirInterface:temp/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  test?: ModuleTestInterface; //typeRef:ModuleTestInterface:test/schema.gen.ts:true

  /**
   * @example //disableShortie:true
   */
  testSilent?: ModuleTestSilentInterface; //typeRef:ModuleTestSilentInterface:test/schema.gen.ts:true

}
// [block registryEntriesModulesInterface end]
