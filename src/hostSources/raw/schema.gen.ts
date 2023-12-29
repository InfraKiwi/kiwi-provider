/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsInterface } from '../../components/varsContainer.schema.gen';

// [block HostSourceRawInterface begin]
export interface HostSourceRawInterface {
  [x: string]: VarsInterface; //typeRef:VarsInterface:{"relPath":"../../components/varsContainer.schema.gen.ts","isRegistryExport":false}

}
// [block HostSourceRawInterface end]
//meta:HostSourceRawInterface:[{"unknownType":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}},{"className":"HostSourceRawInterface","entryNames":["raw"]}]

export type HostSourceRawInterfaceConfigKey = 'raw';
export const HostSourceRawInterfaceConfigKeyFirst = 'raw';
