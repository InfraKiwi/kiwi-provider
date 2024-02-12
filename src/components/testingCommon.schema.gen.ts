/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';

// [block ConditionSchema begin]
export type ConditionSchema = string;
// [block ConditionSchema end]
//meta:ConditionSchema:undefined

// [block ConditionSetInterface begin]
export type ConditionSetInterface =
  | string
  | string[];
// [block ConditionSetInterface end]
//meta:ConditionSetInterface:[{"className":"ConditionSetInterface"}]

// [block TestMockBaseInterface begin]
export interface TestMockBaseInterface {
  result: ModuleRunResultInterface; //typeRef:ModuleRunResultInterface:{"relPath":"../modules/abstractModuleBase.schema.gen.ts","isRegistryExport":false}
}
// [block TestMockBaseInterface end]
//meta:TestMockBaseInterface:[{"className":"TestMockBaseInterface"}]
