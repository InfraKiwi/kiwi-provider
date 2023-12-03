import Joi from 'joi';
import { runnerRegistryEntryFactory } from '../registry';

export const RunnerLocalSchema = runnerRegistryEntryFactory.createJoiEntrySchema(__dirname, Joi.object({}));
