/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block AbstractLogsStorageGetDownloadUrlResponseInterface begin]
export interface AbstractLogsStorageGetDownloadUrlResponseInterface {
  downloadUrl: string;
}
// [block AbstractLogsStorageGetDownloadUrlResponseInterface end]
//meta:AbstractLogsStorageGetDownloadUrlResponseInterface:[{"className":"AbstractLogsStorageGetDownloadUrlResponseInterface"}]

// [block AbstractLogsStorageGetUploadUrlRequestInterface begin]
export interface AbstractLogsStorageGetUploadUrlRequestInterface {
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
// [block AbstractLogsStorageGetUploadUrlRequestInterface end]
//meta:AbstractLogsStorageGetUploadUrlRequestInterface:[{"className":"AbstractLogsStorageGetUploadUrlRequestInterface"}]

// [block AbstractLogsStorageGetUploadUrlResponseInterface begin]
export interface AbstractLogsStorageGetUploadUrlResponseInterface {
  storageKey: string;
  uploadUrl: string;
}
// [block AbstractLogsStorageGetUploadUrlResponseInterface end]
//meta:AbstractLogsStorageGetUploadUrlResponseInterface:[{"className":"AbstractLogsStorageGetUploadUrlResponseInterface"}]
