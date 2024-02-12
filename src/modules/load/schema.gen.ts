/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { VarsSourceInterface } from '../../components/varsSource.schema.gen';

// [block ModuleLoadInterface begin]
export type ModuleLoadInterface =
  | VarsSourceInterface[] //typeRef:VarsSourceInterface:{"relPath":"../../components/varsSource.schema.gen.ts","isRegistryExport":false}
  | VarsSourceInterface; //typeRef:VarsSourceInterface:{"relPath":"../../components/varsSource.schema.gen.ts","isRegistryExport":false}

// [block ModuleLoadInterface end]
//meta:ModuleLoadInterface:[{"className":"ModuleLoadInterface","entryNames":["load"]}]

export type ModuleLoadInterfaceConfigKey = 'load';
export const ModuleLoadInterfaceConfigKeyFirst = 'load';
