// Generated with: yarn gen -> cmd/schemaGen.ts

// [block AbstractAssetsDistributionGetDownloadUrlRequestInterface begin]
export interface AbstractAssetsDistributionGetDownloadUrlRequestInterface {
  assetFile: string;

  /**
   * If true, returns the plain URL as string and does not encapsulate the result as a JSON object
   */
  plain?: boolean;
}
// [block AbstractAssetsDistributionGetDownloadUrlRequestInterface end]

// [block AbstractAssetsDistributionGetDownloadUrlResponseInterface begin]
export interface AbstractAssetsDistributionGetDownloadUrlResponseInterface {
  downloadUrl: string;
}
// [block AbstractAssetsDistributionGetDownloadUrlResponseInterface end]
