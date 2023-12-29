/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block RunnerDockerInterface begin]
export interface RunnerDockerInterface {
  bin?:
    | 'docker'
    | string;
  image: string;
  platform?:
    | 'linux/amd64'
    | 'linux/arm64'
    | 'linux/arm/v7'
    | 'windows/amd64';
  waitCommand?: string[];
}
// [block RunnerDockerInterface end]
//meta:RunnerDockerInterface:[{"className":"RunnerDockerInterface","entryNames":["docker"]}]

export type RunnerDockerInterfaceConfigKey = 'docker';
export const RunnerDockerInterfaceConfigKeyFirst = 'docker';
