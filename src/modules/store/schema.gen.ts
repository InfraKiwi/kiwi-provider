/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
//meta:ModuleStoreInterface:[{"className":"ModuleStoreInterface","entryNames":["store"]}]

export type ModuleStoreInterfaceConfigKey = 'store';
export const ModuleStoreInterfaceConfigKeyFirst = 'store';
