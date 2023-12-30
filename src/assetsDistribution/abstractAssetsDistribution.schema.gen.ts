/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block AbstractAssetsDistributionGetDownloadUrlRequestInterface begin]
export interface AbstractAssetsDistributionGetDownloadUrlRequestInterface {
  assetFile: string;

  /**
   * If true, returns the plain URL as string and does not encapsulate the result as a JSON object
   */
  plain?: boolean;

  /**
   * If true, directly redirects to the download url instead of returning it.
   */
  redirect?: boolean;
}
// [block AbstractAssetsDistributionGetDownloadUrlRequestInterface end]
//meta:AbstractAssetsDistributionGetDownloadUrlRequestInterface:[{"className":"AbstractAssetsDistributionGetDownloadUrlRequestInterface"}]

// [block AbstractAssetsDistributionGetDownloadUrlResponseInterface begin]
export interface AbstractAssetsDistributionGetDownloadUrlResponseInterface {
  downloadUrl: string;
}
// [block AbstractAssetsDistributionGetDownloadUrlResponseInterface end]
//meta:AbstractAssetsDistributionGetDownloadUrlResponseInterface:[{"className":"AbstractAssetsDistributionGetDownloadUrlResponseInterface"}]
