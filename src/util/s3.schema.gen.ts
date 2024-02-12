/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block joiParseArgsS3OptionsInterface begin]
export interface joiParseArgsS3OptionsInterface {
  s3Bucket?: string;
  s3Prefix?: string;
  s3Endpoint?: string;
}
// [block joiParseArgsS3OptionsInterface end]
//meta:joiParseArgsS3OptionsInterface:[{"className":"joiParseArgsS3OptionsInterface"}]

// [block joiParseArgsS3RequiredOptionsInterface begin]
export interface joiParseArgsS3RequiredOptionsInterface {
  s3Bucket: string;
  s3Prefix?: string;
  s3Endpoint?: string;
}
// [block joiParseArgsS3RequiredOptionsInterface end]
//meta:joiParseArgsS3RequiredOptionsInterface:[{"className":"joiParseArgsS3RequiredOptionsInterface"}]
