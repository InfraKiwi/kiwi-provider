/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block CmdCIGenArtifactsMatrixConfigInterface begin]
export interface CmdCIGenArtifactsMatrixConfigInterface {
  packages: {
    [x: string]: {
      entryPoint: string;
      variants: ({
        platform:
          | 'win'
          | 'linux'
          | 'darwin';
        formats?: (
          | 'raw'
          | 'gz')[];
        arch: (
          | 'x64'
          | 'arm64'
          | 'armv7l')[];
      })[];
    };
  };
}
// [block CmdCIGenArtifactsMatrixConfigInterface end]
//meta:CmdCIGenArtifactsMatrixConfigInterface:[{"className":"CmdCIGenArtifactsMatrixConfigInterface"}]
