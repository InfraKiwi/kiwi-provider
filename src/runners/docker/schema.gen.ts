// Generated with: yarn gen -> cmd/schemaGen.ts

// [block RunnerDockerInterface begin]
export interface RunnerDockerInterface {
  bin?: 'docker' | string;
  image: string;
  platform?: 'linux/amd64' | 'linux/arm64' | 'linux/arm/v7' | 'windows/amd64';
  waitCommand?: string[];
}
// [block RunnerDockerInterface end]

export type RunnerDockerInterfaceConfigKey = 'docker';
export const RunnerDockerInterfaceConfigKeyFirst = 'docker';
