/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Description, Schema, ValidationOptions } from 'joi';
import Joi from 'joi';
import semver from 'semver/preload';
import { setDifference } from './set';
import { shortieToObject } from './shortie';
import { existsSync } from 'node:fs';
import type { TraverseContext } from 'traverse';
import traverse from 'traverse';
import { $enum } from 'ts-enum-util';
import { inspect } from './inspect';
import { arrayStartsWith, arraySubsetIterate } from './array';

export const joiMetaExternalImportKey = 'externalImport';
export const joiMetaRegistrySchemaObjectKey = 'registrySchemaObject';

export function joiCustomErrorMessage<T>(helpers: Joi.CustomHelpers<T>, message: string) {
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

export function joiFindMeta<T>(d: Description, key: string, depthAny?: boolean): T | undefined {
  if (depthAny) {
    let found: T | undefined;
    traverse(d).forEach(function (p) {
      if (typeof p == 'object' && 'metas' in p) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta = p.metas?.find((m: any) => key in m)?.[key];
        if (meta != undefined) {
          found ||= meta;
        }
      }
    });
    return found;
  }
  return d.metas?.find((m) => key in m)?.[key];
}

/**
 * Normally a Joi details contains paths that include the keywords "keys", "items", "matches".
 * We want to get the path as if it belonged to a normal JS object, so by stripping away
 * those joi-specific entries
 */
export function joiGetNodeObjectPath(this: TraverseContext): string[] {
  const key = this.key;
  if (key == null) {
    if (this.isRoot) {
      return [];
    }
    throw new Error(`Unexpected null key: ${inspect(this)}`);
  }

  const parent = this.parent;
  if (parent == null) {
    if (this.isRoot) {
      return [];
    }
    throw new Error(`Unexpected null parent: ${inspect(this)}`);
  }

  switch (parent.key) {
    case 'keys': {
      // The parent is an object
      const upperParent = parent.parent;
      if (upperParent == null) {
        throw new Error(`Unexpected null upper parent for object: ${inspect(this)}`);
      }
      return [...joiGetNodeObjectPath.call(upperParent), key];
    }
    case 'items': {
      // The parent is an array
      const upperParent = parent.parent;
      if (upperParent == null) {
        throw new Error(`Unexpected null upper parent for array: ${inspect(this)}`);
      }
      return [...joiGetNodeObjectPath.call(upperParent), key];
    }
    default: {
      const parentPathLen = parent.path.length;

      if (parentPathLen >= 2 && parent.path[parentPathLen - 2] == 'matches') {
        // The parent is an alternatives
        const upperParent = parent.parent?.parent;
        if (upperParent == null) {
          throw new Error(`Unexpected null upper parent for alternatives: ${inspect(this)}`);
        }
        return [
          ...joiGetNodeObjectPath.call(upperParent),

          /*
           * We omit the key here because the key is always "schema". That is, the schema
           * belonging to the alternative item
           */
        ];
      }

      if (
        parentPathLen >= 2 &&
        /^\d+$/.test(parent.path[parentPathLen - 1]) &&
        parent.path[parentPathLen - 2] == 'patterns'
      ) {
        // The parent is a object with pattern
        const upperParent = parent.parent?.parent;
        if (upperParent == null) {
          throw new Error(`Unexpected null upper parent for object with pattern: ${inspect(this)}`);
        }
        return [
          ...joiGetNodeObjectPath.call(upperParent),

          /*
           * We omit the key here because the entry is just a potential pattern of an object
           */
        ];
      }

      throw new Error(`Unknown parent key: ${parent.key}`);
    }
  }
}

export function joiFindMetaValuePaths<T>(d: Description, key: string, value: T, depthAny?: boolean): string[][] {
  const paths: string[][] = [];
  const fullMatchedPaths: string[][] = [];
  if (depthAny) {
    traverse(d).forEach(function (p) {
      // Only look at actual schema items
      if (p.type == null) {
        return;
      }

      if (typeof p != 'object' || !('metas' in p)) {
        return;
      }

      if (fullMatchedPaths.find((pa) => arrayStartsWith(pa, this.path))) {
        // Do not process items where the parent already matches the definition
        return;
      }

      if (
        this.parent &&
        arraySubsetIterate(this.parent.path, 2, (subset) => subset[0] == 'metas' && /^\d+$/.test(subset[1]))
      ) {
        // Skip nested metas
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((p.metas ?? []).findIndex((m: any) => key in m && m[key] === value) > -1) {
        const nodePath = joiGetNodeObjectPath.call(this);
        paths.push(nodePath);
        fullMatchedPaths.push(this.path);
      }
    });
    return paths;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((d.metas ?? []).indexOf((m: any) => key in m && m[key] == value) > -1) {
    // Root node
    paths.push([]);
  }
  return paths;
}

/**
 * Supports recursively looking through schema descriptions to find if one of the
 * entries can be a string
 */
function joiSchemaAlternativesAcceptsString(desc: Joi.Description): boolean {
  if (!('matches' in desc)) {
    return false;
  }
  let found = false;
  for (const match of desc.matches) {
    if (match.schema?.type == 'alternatives') {
      found = joiSchemaAlternativesAcceptsString(match.schema);
    } else if (match.schema?.type == 'string') {
      found = true;
    }
    if (found) {
      break;
    }
  }

  return found;
}

export function joiSchemaAcceptsString(schema: Joi.Schema): boolean {
  const desc = schema.describe();
  return (
    desc.type == 'any' ||
    desc.type == 'string' ||
    (desc.type == 'alternatives' && joiSchemaAlternativesAcceptsString(desc))
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

export function joiValidateShortieObject(val: string, helpers: Joi.CustomHelpers<string>): Joi.ErrorReport | object {
  try {
    return shortieToObject(val);
  } catch (err) {
    return joiCustomErrorMessage(helpers, 'The string must be a valid nunjucks condition');
  }
}

export function joiValidateSyncFSExists(
  val: string | undefined,
  helpers: Joi.CustomHelpers<string>
): Joi.ErrorReport | string | undefined {
  // Make sure this function is always ever only called from a cli script main entrypoint
  {
    const targetObject = { stack: '' };
    Error.captureStackTrace(targetObject);

    const lines = targetObject.stack.split('\n');
    let firstFound = false;
    for (const line of lines) {
      if (line.startsWith('    at joiAttemptRequired')) {
        firstFound = true;
        continue;
      }
      if (firstFound) {
        // Support sub-commands
        if (/^ {4}at command\w+ /.test(line)) {
          continue;
        }
        if (line.startsWith('    at main')) {
          break;
        }
      }
      firstFound = false;
    }
    if (!firstFound) {
      throw new Error('joiValidateSyncFSExists invoked not from main/joiAttemptRequired function');
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
        acc[key] = val[key];
        return acc;
      }, {})
  );
}

// https://github.com/microsoft/TypeScript/issues/30611

export function getJoiEnumKeys<TEnumValue extends string | number>(e: { [key in string]: TEnumValue }): Joi.Schema {
  return Joi.string().valid(...$enum(e).keys());
}

export function getJoiEnumValuesAsAlternatives<TEnumValue extends string | number>(
  e: { [key in string]: TEnumValue },
  getDescription: (value: TEnumValue) => string
): Joi.Schema {
  const entries: Joi.StringSchema[] = [];
  const enumKeys = $enum(e).keys();
  for (const key of enumKeys) {
    const description = getDescription(key as TEnumValue);
    if (description == null) {
      throw new Error(`Missing description for enum key ${key}`);
    }
    entries.push(Joi.string().valid(key).description(description));
  }
  return Joi.alternatives(entries);
}

export function joiAttemptRequired<TSchema extends Schema>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  schema: TSchema,
  message: string | Error = 'Validation failed:',
  options?: ValidationOptions
): TSchema extends Schema<infer Value> ? Value : never {
  return Joi.attempt(value, schema.required(), message, options);
}

export function joiSchemaDump(schema: Joi.Schema): string {
  return JSON.stringify(schema.describe());
}
