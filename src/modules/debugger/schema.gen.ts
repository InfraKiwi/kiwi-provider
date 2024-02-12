/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block ModuleDebuggerInterface begin]
export type ModuleDebuggerInterface =
  | Record<string, never>
  | {
    /**
     * Set to true to enable the nodejs inspector.
     */
    enable: true;
  };
// [block ModuleDebuggerInterface end]
//meta:ModuleDebuggerInterface:[{"className":"ModuleDebuggerInterface","entryNames":["debugger"]}]

export type ModuleDebuggerInterfaceConfigKey = 'debugger';
export const ModuleDebuggerInterfaceConfigKeyFirst = 'debugger';
