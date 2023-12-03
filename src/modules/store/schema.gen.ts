// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleStoreInterface begin]
export type ModuleStoreInterface =
  | {
    path: string;
    workDir?: string;
    content: string;
    raw?: boolean;
  }
  | {
    path: string;
    workDir?: string;
    content: any;
    raw?: false;
  };
// [block ModuleStoreInterface end]

export type ModuleStoreInterfaceConfigKey = 'store';
export const ModuleStoreInterfaceConfigKeyFirst = 'store';
