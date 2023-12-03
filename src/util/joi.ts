import Joi from 'joi';
import { fsPromiseExists } from './fs';
import { IfTemplate } from './tpl';
import semver from 'semver/preload';
import { setDifference } from './set';
import { getErrorPrintfClass } from './error';
import path from 'node:path';

function joiCustomErrorMessage<T>(helpers: Joi.CustomHelpers<T>, message: string) {
  return helpers.message({
    custom: message,
  });
}

export function joiMetaUnknownType(schema: Joi.Schema) {
  return {
    unknownType: schema,
  };
}

export function joiMetaClassName(name: string) {
  return {
    className: name,
  };
}

export const joiMetaExternalImportKey = 'externalImport';

export interface JoiMetaExternalImport {
  importPath: string;
  name: string;
}

export function joiMetaExternalImport(i: JoiMetaExternalImport) {
  return {
    [joiMetaExternalImportKey]: i,
  };
}

export const JoiAttemptAsyncValidationErrorWithMessage = getErrorPrintfClass(
  'JoiAttemptAsyncValidationErrorWithMessage',
  'Validation error: %s',
);
export const JoiAttemptAsyncValidationError = getErrorPrintfClass('JoiAttemptAsyncValidationError', 'Validation error');

export async function joiAttemptAsync<T>(value: T, schema: Joi.Schema<T>, message?: string): Promise<T> {
  try {
    const validated = await schema.validateAsync(value);
    return validated;
  } catch (ex) {
    if (message) {
      throw new JoiAttemptAsyncValidationErrorWithMessage(message, ex);
    }
    throw new JoiAttemptAsyncValidationError(ex);
  }
}

export function joiObjectAddPattern(
  schema: Joi.ObjectSchema,
  value: Joi.Schema,
  keyPattern: RegExp | Joi.Schema = Joi.string(),
): Joi.ObjectSchema {
  return (
    schema
      // Joi-to-typescript does not handle the RegExp argument, just wrap it
      .pattern(keyPattern instanceof RegExp ? Joi.string().regex(keyPattern) : keyPattern, value)
      .meta(joiMetaUnknownType(value))
  );
}

export function joiObjectWithPattern(
  value: Joi.Schema,
  keyPattern: RegExp | Joi.Schema = Joi.string(),
): Joi.ObjectSchema {
  return joiObjectAddPattern(Joi.object(), value, keyPattern);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function joiObjectFromInstanceOf(constructorName: string, importPath: string): Joi.ObjectSchema {
  if (!path.isAbsolute(importPath)) {
    throw new Error(`InstanceOf import path must be absolute, got: ${importPath}`);
  }
  return Joi.object()
    .custom(getJoiValidateInstanceOfConstructorName(constructorName))
    .meta(joiMetaExternalImport({ importPath, name: constructorName }))
    .meta(joiMetaClassName(constructorName));
}

export function joiValidateValidRegex(val: string, helpers: Joi.CustomHelpers<string>): Joi.ErrorReport | string {
  try {
    new RegExp(val);
  } catch (err) {
    return joiCustomErrorMessage(helpers, 'The string must be a valid RegExp pattern');
  }
  return val;
}

export function getJoiValidateInstanceOfConstructorName(constructorName: string) {
  return (val: object, helpers: Joi.CustomHelpers<string>): Joi.ErrorReport | object => {
    if (val.constructor.name != constructorName) {
      return joiCustomErrorMessage(helpers, `The value must be an instance of ${constructorName}`);
    }
    return val;
  };
}

export function joiValidateValidJoiSchema(
  val: unknown,
  helpers: Joi.CustomHelpers<unknown>,
): Joi.ErrorReport | Joi.Schema {
  if (!Joi.isSchema(val)) {
    return joiCustomErrorMessage(helpers, 'The value must be a valid Joi schema');
  }
  return val;
}

export function joiValidateValidIfTemplate(val: string, helpers: Joi.CustomHelpers<string>): Joi.ErrorReport | string {
  try {
    new IfTemplate(val);
  } catch (err) {
    return joiCustomErrorMessage(helpers, 'The string must be a valid nunjucks condition');
  }
  return val;
}

export async function joiValidateAsyncFileExists(
  val: string | undefined,
  helpers: Joi.CustomHelpers<string>,
): Promise<Joi.ErrorReport | string | undefined> {
  if (val == undefined) {
    return undefined;
  }
  if (!(await fsPromiseExists(val))) {
    return joiCustomErrorMessage(helpers, 'The file must exist');
  }
  return val;
}

export function joiValidateSemVer(val: string, helpers: Joi.CustomHelpers<string>): Joi.ErrorReport | string {
  if (!semver.valid(val) && !semver.validRange(val)) {
    return joiCustomErrorMessage(helpers, 'The string must be a valid semver version or semver range');
  }
  return val;
}

export function joiObjectSchemaKeys(schema: Joi.ObjectSchema) {
  return Object.keys(schema.describe().keys);
}

export function joiKeepOnlyKeysInJoiSchema<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  val: any,
  joiObject: Joi.ObjectSchema,
): T {
  const keys = joiObjectSchemaKeys(joiObject);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return keys.reduce((acc: any, key) => {
    if (!(key in val)) {
      return acc;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[key] = (val as any)[key];
    return acc;
  }, {});
}

export function joiKeepOnlyKeysNotInJoiObjectDiff(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  val: any,
  joiObject: Joi.ObjectSchema,
  joiObjectExtended: Joi.ObjectSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const keys = new Set(joiObjectSchemaKeys(joiObject));
  const keysExtended = new Set(joiObjectSchemaKeys(joiObjectExtended));
  const diff = setDifference(keysExtended, keys);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.keys(val).reduce((acc: any, key) => {
    // Do not add keys that exist in the difference
    if (diff.has(key)) {
      return acc;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[key] = (val as any)[key];
    return acc;
  }, {});
}

// https://github.com/microsoft/TypeScript/issues/30611
export function getJoiEnumValues<TEnumValue extends string | number>(e: { [key in string]: TEnumValue }): Joi.Schema {
  return Joi.alternatives([
    Joi.string().valid(
      ...Object.values(e).filter((el) => typeof el == 'string'),
      ...Object.values(e)
        .filter((el) => typeof el == 'number')
        .map((el) => (el as number).toString(10)),
    ),
  ]);
}
