/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block CmdCIGenHackInstallerConfigInterface begin]
export interface CmdCIGenHackInstallerConfigInterface {
  scripts: {
    src: string;
    dest: string;
    template?: boolean;
  }[];
  headers?: string[];
}
// [block CmdCIGenHackInstallerConfigInterface end]
//meta:CmdCIGenHackInstallerConfigInterface:[{"className":"CmdCIGenHackInstallerConfigInterface"}]
