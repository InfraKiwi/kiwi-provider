/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block HostReportRequestInterface begin]
export interface HostReportRequestInterface {
  timestamp: number;
  hostname: string;
  release: string;
  status:
    | 'pending'
    | 'running'
    | 'success'
    | 'failure';
  type:
    | 'init'
    | 'recipe';
  key: string;
}
// [block HostReportRequestInterface end]
//meta:HostReportRequestInterface:[{"className":"HostReportRequestInterface"}]
