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
