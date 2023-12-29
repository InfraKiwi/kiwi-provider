/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ServerHookInterface begin]
export interface ServerHookInterface {
  /**
   * The condition that will trigger the hook
   */
  if?: string;

  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block ServerHookInterface end]
//meta:ServerHookInterface:[{"className":"ServerHookInterface"}]

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
  port: number;
  externalUrl?: string;
}
// [block ServerListenerInterface end]
//meta:ServerListenerInterface:[{"className":"ServerListenerInterface"}]

// [block ServerListenerWrapperInterface begin]
export interface ServerListenerWrapperInterface {
  listener: ServerListenerInterface; //typeRef:ServerListenerInterface:{"relPath":"self","isRegistryExport":false}

}
// [block ServerListenerWrapperInterface end]
//meta:ServerListenerWrapperInterface:[{"className":"ServerListenerWrapperInterface"}]
