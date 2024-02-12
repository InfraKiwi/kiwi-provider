/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block AssetsDistributionS3Interface begin]
export interface AssetsDistributionS3Interface {
  /**
   * The bucket name to use when fetching assets.
   */
  bucket: string;

  /**
   * An enforced path prefix to apply to all requests to the bucket.
   */
  prefix?: string;

  /**
   * The fully qualified endpoint of the webservice. This is only for
   * using a custom endpoint (for example, when using a local version of S3).
   * Endpoint transformations such as S3 applying a bucket to the hostname
   * are still applicable to this custom endpoint.
   */
  endpoint?: string;

  /**
   * The endpoint to use when providing download urls to clients.
   * Useful when
   * Defaults to `endpoint`.
   */
  endpointForClients?: string;

  /**
   * The AWS region to which this client will send requests.
   */
  region?: string;

  /**
   * Whether TLS is enabled for requests.
   */
  tls?: boolean;

  /**
   * The credentials used to sign requests.
   */
  credentials?: AwsCredentialIdentityInterface; //typeRef:AwsCredentialIdentityInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Any other S3Client configuration options.
   *
   * See: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/S3ClientConfig
   */
  [x: string]: any;
}
// [block AssetsDistributionS3Interface end]
//meta:AssetsDistributionS3Interface:[{"unknownType":{"type":"any","flags":{"description":"\n  Any other S3Client configuration options.\n  \n  See: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/S3ClientConfig\n  "}}},{"className":"AssetsDistributionS3Interface","entryNames":["s3"]}]

// [block AwsCredentialIdentityInterface begin]
/**
 * The credentials used to sign requests.
 */
export interface AwsCredentialIdentityInterface {
  /**
   * AWS access key ID
   */
  accessKeyId: string;

  /**
   * AWS secret access key
   */
  secretAccessKey: string;

  /**
   * AWS credential scope for this set of credentials.
   */
  credentialScope?: string;

  /**
   * A security or session token to use with these credentials.
   * Usually present for temporary credentials.
   */
  sessionToken?: string;
}
// [block AwsCredentialIdentityInterface end]
//meta:AwsCredentialIdentityInterface:[{"className":"AwsCredentialIdentityInterface"}]

export type AssetsDistributionS3InterfaceConfigKey = 's3';
export const AssetsDistributionS3InterfaceConfigKeyFirst = 's3';
