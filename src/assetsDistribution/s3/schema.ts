/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { assetsDistributionRegistryEntryFactory } from '../registry';
import { joiMetaClassName, joiObjectAddPattern } from '../../util/joi';

export const AwsCredentialIdentitySchema = Joi.object({
  accessKeyId: Joi.string().required().description(`AWS access key ID`),
  secretAccessKey: Joi.string().required().description(`AWS secret access key`),
  credentialScope: Joi.string().description(`AWS credential scope for this set of credentials.`),
  sessionToken: Joi.string().description(
    `
    A security or session token to use with these credentials. 
    Usually present for temporary credentials.
    `
  ),
}).meta(joiMetaClassName('AwsCredentialIdentityInterface')).description(`
  The credentials used to sign requests.
`);

export const AssetsDistributionS3Schema = assetsDistributionRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  joiObjectAddPattern(
    Joi.object({
      bucket: Joi.string().required().description(`
        The bucket name to use when fetching assets.
      `),
      prefix: Joi.string().description(`
        An enforced path prefix to apply to all requests to the bucket.
      `),
      endpoint: Joi.string().description(`
        The fully qualified endpoint of the webservice. This is only for
        using a custom endpoint (for example, when using a local version of S3).
        Endpoint transformations such as S3 applying a bucket to the hostname 
        are still applicable to this custom endpoint.
      `),
      endpointForClients: Joi.string().description(`
        The endpoint to use when providing download urls to clients.
        Useful when 
        Defaults to \`endpoint\`.
      `),
      region: Joi.string().description(`
        The AWS region to which this client will send requests.
      `),
      tls: Joi.boolean().description(`
        Whether TLS is enabled for requests.
      `),
      credentials: AwsCredentialIdentitySchema,
    }),
    Joi.any().description(`
  Any other S3Client configuration options.
  
  See: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/S3ClientConfig
  `)
  )
);
