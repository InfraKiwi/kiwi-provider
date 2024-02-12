/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { DataSourceHTTPRawInterface } from '../../dataSources/http/schema.gen';

// [block AgentAppConfigInterface begin]
export interface AgentAppConfigInterface {
  listener?: {
    /**
     * The address to listen on
     */
    addr?:
      | '127.0.0.1'
      | string;

    /**
     * The port to listen on
     */
    port?:
      | 13901
      | number;
    externalUrl?:
      | 'http://127.0.0.1:13901'
      | string;

    /**
     * The method to use to notify the server's health.
     *
     * Note: the server always exposes the `/health` endpoint for
     * pull-based health checks. The `health` methods are needed only
     * for push-based health checks, which wait for a notification.
     */
    health?:

      /**
       * Notify the system via systemd-notify.
       *
       * You can use this setting when the server is configured
       * as a systemd service with type `Type=notify`.
       */
      | {
        'systemd-notify': Record<string, never>;
      }

      /**
       * Sends an HTTP request as soon as the server is healthy.
       */
      | {
        http: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../../dataSources/http/schema.gen.ts","isRegistryExport":false}
      };
  };
  app?: AgentConfigInterface; //typeRef:AgentConfigInterface:{"relPath":"self","isRegistryExport":false}
}
// [block AgentAppConfigInterface end]
//meta:AgentAppConfigInterface:[{"className":"AgentAppConfigInterface"}]

// [block AgentConfigInterface begin]
export interface AgentConfigInterface {
  /**
   * The id/hostname of the current machine
   */
  hostname?: string;
  kiwiProviderUrl:
    | 'http://127.0.0.1:13900'
    | string;
  databasePath:
    | 'release.db.txt'
    | string;
}
// [block AgentConfigInterface end]
//meta:AgentConfigInterface:[{"className":"AgentConfigInterface"}]
