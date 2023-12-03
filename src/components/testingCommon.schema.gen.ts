import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ConditionSchema begin]
export type ConditionSchema = string;
// [block ConditionSchema end]

// [block ConditionSetInterface begin]
export type ConditionSetInterface =
  | string
  | string[];
// [block ConditionSetInterface end]

// [block TestMockBaseInterface begin]
export interface TestMockBaseInterface {
  result: ModuleRunResultInterface; //typeRef:ModuleRunResultInterface:../modules/abstractModuleBase.schema.gen.ts:false

}
// [block TestMockBaseInterface end]
