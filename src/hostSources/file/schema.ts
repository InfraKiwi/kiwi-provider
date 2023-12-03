import { hostSourceRegistryEntryFactory } from '../registry';
import { DataSourceFileBaseSchemaObject } from '../../dataSources/file/schema';
import Joi from 'joi';

export const HostSourceFileSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object(DataSourceFileBaseSchemaObject),
);
