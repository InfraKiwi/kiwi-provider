/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { DataSourceHTTPRawInterface } from '../../dataSources/http/schema.gen';

// [block ServerHookInterface begin]
export interface ServerHookInterface {
  /**
   * The condition that will trigger the hook.
   */
  if?: string;

  /**
   * The hook function config.
   * You can check the available hook functions here: ##link#See all available hook functions#/hooks
   */
  [x: string]: any;
}
// [block ServerHookInterface end]
//meta:ServerHookInterface:[{"className":"ServerHookInterface"},{"unknownType":{"type":"any","flags":{"description":"\n  The hook function config.\n  You can check the available hook functions here: ##link#See all available hook functions#/hooks\n  "}}}]

// [block ServerHookWithArrayInterface begin]
export type ServerHookWithArrayInterface =
  | ServerHookInterface //typeRef:ServerHookInterface:{"relPath":"self","isRegistryExport":false}
  | ServerHookInterface[]; //typeRef:ServerHookInterface:{"relPath":"self","isRegistryExport":false}

// [block ServerHookWithArrayInterface end]
//meta:ServerHookWithArrayInterface:[{"className":"ServerHookWithArrayInterface"}]

// [block ServerListenerInterface begin]
export interface ServerListenerInterface {
  /**
   * The address to listen on
   */
  addr?:
    | '127.0.0.1'
    | string;

  /**
   * The port to listen on
   */
  port?: number;
  externalUrl?: string;

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
}
// [block ServerListenerInterface end]
//meta:ServerListenerInterface:[{"className":"ServerListenerInterface"}]

// [block ServerListenerWrapperInterface begin]
export interface ServerListenerWrapperInterface {
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
    port?: number;
    externalUrl?:
      | 'http://127.0.0.1:undefined'
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
}
// [block ServerListenerWrapperInterface end]
//meta:ServerListenerWrapperInterface:[{"className":"ServerListenerWrapperInterface"}]
