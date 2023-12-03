import type { VarsSourceInterface } from '../../components/varsSource.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleLoadInterface begin]
export type ModuleLoadInterface =
  | VarsSourceInterface[] //typeRef:VarsSourceInterface:../../components/varsSource.schema.gen.ts:false
  | VarsSourceInterface; //typeRef:VarsSourceInterface:../../components/varsSource.schema.gen.ts:false

// [block ModuleLoadInterface end]

export type ModuleLoadInterfaceConfigKey = 'load';
export const ModuleLoadInterfaceConfigKeyFirst = 'load';
