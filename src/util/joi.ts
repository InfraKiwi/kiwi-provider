/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { IfTemplate } from './tpl';
import semver from 'semver/preload';
import { setDifference } from './set';
import { shortieToObject } from './shortie';
import { existsSync } from 'node:fs';

export const joiMetaExternalImportKey = 'externalImport';
export const joiMetaRegistrySchemaObjectKey = 'registrySchemaObject';

function joiCustomErrorMessage<T>(helpers: Joi.CustomHelpers<T>, message: string) {
  return helpers.message({ custom: message });
}

export function joiMetaUnknownType(schema: Joi.Schema) {
  return { unknownType: schema };
}

export function joiMetaClassName(name: string) {
  return { className: name };
}

export function joiMetaRegistrySchemaObject(schemaObject: object) {
  return { [joiMetaRegistrySchemaObjectKey]: schemaObject };
}

export interface JoiMetaExternalImport {
  importPath: string;
  name: string;
}

export function joiMetaExternalImport(i: JoiMetaExternalImport) {
  return { [joiMetaExternalImportKey]: i };
}

/*
 * export const JoiAttemptAsyncValidationErrorWithMessage = getErrorPrintfClass(
 *   'JoiAttemptAsyncValidationErrorWithMessage',
 *   'Validation error: %s',
 * );
 * export const JoiAttemptAsyncValidationError = getErrorPrintfClass('JoiAttemptAsyncValidationError', 'Validation error');
 */

/*
 * export async function joiAttemptAsync<T>(value: T, schema: Joi.Schema<T>, message?: string): Promise<T> {
 *   try {
 *     const validated = await schema.validateAsync(value);
 *     return validated;
 *   } catch (ex) {
 *     if (message) {
 *       throw new JoiAttemptAsyncValidationErrorWithMessage(message, ex);
 *     }
 *     throw new JoiAttemptAsyncValidationError(ex);
 *   }
 * }
 */

export function joiObjectAddPattern(
  schema: Joi.ObjectSchema,
  value: Joi.Schema,
  keyPattern: RegExp | Joi.Schema = Joi.string()
): Joi.ObjectSchema {
  return (
    schema
      // Joi-to-typescript does not handle the RegExp argument, just wrap it
      .pattern(keyPattern instanceof RegExp ? Joi.string().regex(keyPattern) : keyPattern, value)
      .meta(joiMetaUnknownType(value))
  );
}

export function joiObjectAddRegistrySchemaObject(
  obj: Joi.ObjectSchema,
  registrySchema: object,
  unknownDescription: string
): Joi.ObjectSchema {
  return joiObjectAddPattern(obj.append(registrySchema), Joi.any().description(unknownDescription)).meta(
    joiMetaRegistrySchemaObject(registrySchema)
  );
}

export function joiObjectWithPattern(
  value: Joi.Schema,
  keyPattern: RegExp | Joi.Schema = Joi.string()
): Joi.ObjectSchema {
  return joiObjectAddPattern(Joi.object(), value, keyPattern);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function joiObjectFromInstanceOf(constructorName: string, importPath: string): Joi.ObjectSchema {
  /*
   * if (!path.isAbsolute(importPath)) {
   *   throw new Error(`InstanceOf import path must be absolute, got: ${importPath}`);
   * }
   */
  return Joi.object()
    .custom(getJoiValidateInstanceOfConstructorName(constructorName))
    .meta(
      joiMetaExternalImport({
        importPath,
        name: constructorName,
      })
    )
    .meta(joiMetaClassName(constructorName));
}

export function joiSchemaAcceptsString(schema: Joi.Schema): boolean {
  const desc = schema.describe();
  return (
    desc.type == 'any' ||
    desc.type == 'string' ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (desc.type == 'alternatives' && desc.matches?.find((m: any) => m.schema?.type == 'string') != null)
  );
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
  helpers: Joi.CustomHelpers<unknown>
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

export function joiValidateShortieObject(val: string, helpers: Joi.CustomHelpers<string>): Joi.ErrorReport | object {
  try {
    return shortieToObject(val);
  } catch (err) {
    return joiCustomErrorMessage(helpers, 'The string must be a valid nunjucks condition');
  }
}

/*
 * export async function joiValidateAsyncFSExists(
 *   val: string | undefined,
 *   helpers: Joi.CustomHelpers<string>,
 * ): Promise<Joi.ErrorReport | string | undefined> {
 *   if (val == undefined) {
 *     return undefined;
 *   }
 *   if (!(await fsPromiseExists(val))) {
 *     return joiCustomErrorMessage(helpers, 'The file or dir must exist');
 *   }
 *   return val;
 * }
 */

export function joiValidateSyncFSExists(
  val: string | undefined,
  helpers: Joi.CustomHelpers<string>
): Joi.ErrorReport | string | undefined {
  // Make sure this function is always ever only called from a cli script main entrypoint
  {
    const targetObject = { stack: '' };
    Error.captureStackTrace(targetObject);

    /*
     *at Object.attempt (D:\devel\10infra-config\node_modules\joi\lib\index.js:107:26)
     *at main (D:\devel\10infra-config\cmd\pkg.ts:48:79)
     */
    const lines = targetObject.stack.split('\n');
    let firstFound = false;
    for (const line of lines) {
      if (line.startsWith('    at Object.attempt')) {
        firstFound = true;
        continue;
      }
      if (firstFound) {
        if (line.startsWith('    at main')) {
          break;
        }
      }
      firstFound = false;
    }
    if (!firstFound) {
      throw new Error('joiValidateSyncFSExists invoked not from main/Joi.attempt function');
    }
  }

  if (val == undefined) {
    return undefined;
  }

  if (!existsSync(val)) {
    return joiCustomErrorMessage(helpers, 'The file or dir must exist');
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
  joiObject: Joi.ObjectSchema
): T {
  const keys = joiObjectSchemaKeys(joiObject);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return keys.reduce((acc: any, key) => {
    if (!(key in val)) {
      return acc;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[key] = val[key];
    return acc;
  }, {});
}

export function joiKeepOnlyKeysNotInJoiObjectDiff(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  val: any,
  joiObject: Joi.ObjectSchema,
  joiObjectExtended: Joi.ObjectSchema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const keys = new Set(joiObjectSchemaKeys(joiObject));
  const keysExtended = new Set(joiObjectSchemaKeys(joiObjectExtended));
  const diff = setDifference(keysExtended, keys);

  return (
    Object.keys(val)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((acc: any, key) => {
        // Do not add keys that exist in the difference
        if (diff.has(key)) {
          return acc;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        acc[key] = val[key];
        return acc;
      }, {})
  );
}

// https://github.com/microsoft/TypeScript/issues/30611
export function getJoiEnumValues<TEnumValue extends string | number>(e: { [key in string]: TEnumValue }): Joi.Schema {
  return Joi.alternatives([
    Joi.string().valid(
      ...Object.values(e).filter((el) => typeof el == 'string'),
      ...Object.values(e)
        .filter((el) => typeof el == 'number')
        .map((el) => (el as number).toString(10))
    ),
  ]);
}
