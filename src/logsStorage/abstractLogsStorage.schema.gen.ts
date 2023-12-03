// Generated with: yarn gen -> cmd/schemaGen.ts

// [block AbstractLogsStorageGetDownloadUrlResponseInterface begin]
export interface AbstractLogsStorageGetDownloadUrlResponseInterface {
  downloadUrl: string;
}
// [block AbstractLogsStorageGetDownloadUrlResponseInterface end]

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

// [block AbstractLogsStorageGetUploadUrlResponseInterface begin]
export interface AbstractLogsStorageGetUploadUrlResponseInterface {
  storageKey: string;
  uploadUrl: string;
}
// [block AbstractLogsStorageGetUploadUrlResponseInterface end]
