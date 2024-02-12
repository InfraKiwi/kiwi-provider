/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { DataSourceHTTPRawInterface } from '../http/schema.gen';

// [block MultiDataSourceHTTPListArgsInterface begin]
export interface MultiDataSourceHTTPListArgsInterface {
  /**
   * Any default values to use for both `list` and `load` calls.
   */
  default?: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../http/schema.gen.ts","isRegistryExport":false}

  /**
   * The HTTP call to make when loading the list of available entries.
   */
  list: {
    /**
     * If the response is an array of objects, this is the name of the field
     * of each object that will be used to extract each entry's id.
     */
    idField?: string;

    /**
     * The configuration of the list HTTP call.
     */
    http?: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../http/schema.gen.ts","isRegistryExport":false}
  };

  /**
   * The HTTP call to make when loading the data for an entry returned by the
   * `list` call. If not provided, the response of the `list` call will be
   * used also to extract the data related to each entry.
   */
  load?: {
    /**
     * The tag to use in the HTTP call, which will be replaced by the entry id
     * obtained in the `list` call.
     */
    idTag?:
      | '{{ id }}'
      | string;

    /**
     * The configuration of the load HTTP call.
     */
    http?: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../http/schema.gen.ts","isRegistryExport":false}
  };
}
// [block MultiDataSourceHTTPListArgsInterface end]
//meta:MultiDataSourceHTTPListArgsInterface:[{"className":"MultiDataSourceHTTPListArgsInterface"}]

// [block MultiDataSourceHTTPListInterface begin]
export interface MultiDataSourceHTTPListInterface {
  /**
   * Any default values to use for both `list` and `load` calls.
   */
  default?: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../http/schema.gen.ts","isRegistryExport":false}

  /**
   * The HTTP call to make when loading the list of available entries.
   */
  list: {
    /**
     * If the response is an array of objects, this is the name of the field
     * of each object that will be used to extract each entry's id.
     */
    idField?: string;

    /**
     * The configuration of the list HTTP call.
     */
    http?: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../http/schema.gen.ts","isRegistryExport":false}
  };

  /**
   * The HTTP call to make when loading the data for an entry returned by the
   * `list` call. If not provided, the response of the `list` call will be
   * used also to extract the data related to each entry.
   */
  load?: {
    /**
     * The tag to use in the HTTP call, which will be replaced by the entry id
     * obtained in the `list` call.
     */
    idTag?:
      | '{{ id }}'
      | string;

    /**
     * The configuration of the load HTTP call.
     */
    http?: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../http/schema.gen.ts","isRegistryExport":false}
  };
}
// [block MultiDataSourceHTTPListInterface end]
//meta:MultiDataSourceHTTPListInterface:[{"className":"MultiDataSourceHTTPListArgsInterface"},{"className":"MultiDataSourceHTTPListInterface","entryNames":["httpList"]}]

export type MultiDataSourceHTTPListInterfaceConfigKey = 'httpList';
export const MultiDataSourceHTTPListInterfaceConfigKeyFirst = 'httpList';
