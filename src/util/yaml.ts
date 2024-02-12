/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

/* eslint @typescript-eslint/no-base-to-string: 0 */

import type { TypeConstructorOptions } from 'js-yaml';
import { DEFAULT_SCHEMA, dump, load, Type } from 'js-yaml';
import { Template } from './tpl';

import { TemplateEval } from './tpl/templateEval';
import Joi from 'joi';
import { isShortie, shortieToObject } from './shortie';
import { fsPromiseReadFile } from './fs';
import { joiSchemaBuildFromString, templateJoiMetaOriginalKey } from './tpl/templateJoi';
import { joiFindMeta } from './joi';

// ---

const yamlTypeCtorTpl: TypeConstructorOptions = {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new Template(data);
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new Template(data);
  },
  predicate: (data: object): boolean => {
    return data instanceof Template && !data.parseJSON;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    return data.toString();
  },
};

const yamlTypeTpl = new Type('!tpl', yamlTypeCtorTpl);
const yamlTypeTplShort = new Type('!t', yamlTypeCtorTpl);

const yamlTypeCtorTplVar: TypeConstructorOptions = {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new Template('${{ ' + data + ' | toJSON }}', true);
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new Template('${{ ' + data + ' | toJSON }}', true);
  },
  predicate: (data: object): boolean => {
    /*
     * By setting this to false, we let the yamlTypeCtorTplJSON pick it up
     * https://github.com/nodeca/js-yaml/blob/0d3ca7a27b03a6c974790a30a89e456007d62976/lib/dumper.js#L761
     */
    return false;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    return data.toString();
  },
};

const yamlTypeTplVar = new Type('!var', yamlTypeCtorTplVar);
const yamlTypeTplVarShort = new Type('!v', yamlTypeCtorTplVar);

const yamlTypeCtorTplJSON: TypeConstructorOptions = {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new Template(data, true);
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new Template(data, true);
  },
  predicate: (data: object): boolean => {
    return data instanceof Template && data.parseJSON;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    return data.toString();
  },
};

const yamlTypeJSON = new Type('!json', yamlTypeCtorTplJSON);
const yamlTypeJSONShort = new Type('!j', yamlTypeCtorTplJSON);

const yamlTypeCtorRegex: TypeConstructorOptions = {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new RegExp(data);
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new RegExp(data);
  },
  predicate: (data: object): boolean => {
    return data instanceof RegExp;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    return data.toString();
  },
};

const yamlTypeRegex = new Type('!regex', yamlTypeCtorRegex);
const yamlTypeRegexShort = new Type('!re', yamlTypeCtorRegex);

const yamlTypeEval = new Type('!eval', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new TemplateEval(data);
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new TemplateEval(data);
  },
  predicate: (data: object): boolean => {
    return data instanceof TemplateEval;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    return data.toString();
  },
});

// Accepts both a Joi schema function and a described schema
const yamlTypeJoi = new Type('!joi', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    try {
      joiSchemaBuildFromString(data);
      return true;
    } catch (ex) {
      return false;
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return joiSchemaBuildFromString(data);
  },
  predicate: (data: object): boolean => {
    return Joi.isSchema(data);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    const schema = data as Joi.Schema;
    const description = schema.describe();
    const templateOriginal = joiFindMeta(description, templateJoiMetaOriginalKey);
    if (templateOriginal) {
      return templateOriginal;
    }
    return JSON.stringify(schema.describe());
  },
});

const yamlTypeCtorShortie: TypeConstructorOptions = {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    shortieToObject(data);
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return shortieToObject(data);
  },
  predicate: (data: object): boolean => {
    return isShortie(data);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    return JSON.stringify(data);
  },
};

const yamlTypeShortie = new Type('!shortie', yamlTypeCtorShortie);
const yamlTypeShortieShort = new Type('!s', yamlTypeCtorShortie);

const yamlTypeDate = new Type('!date', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Date]';
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new Date(data);
  },
  predicate: (data: object): boolean => {
    return Object.prototype.toString.call(data) === '[object Date]';
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (date: any): any => {
    return (date as Date).getTime().toString();
  },
});

const yamlTypeFunction = new Type('!fn', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Function]';
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return Function(data);
  },
  predicate: (data: object): boolean => {
    return Object.prototype.toString.call(data) === '[object Function]';
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (date: any): any => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (date as Function).toString();
  },
});

const yamlTypeError = new Type('!error', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Error]';
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new Error(data);
  },
  predicate: (data: object): boolean => {
    return Object.prototype.toString.call(data) === '[object Error]';
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (date: any): any => {
    return (date as Error).toString();
  },
});

// ---

const customYAMLFunctions: Type[] = [
  yamlTypeTpl,
  yamlTypeTplShort,
  yamlTypeTplVar,
  yamlTypeTplVarShort,
  yamlTypeJSON,
  yamlTypeJSONShort,
  yamlTypeEval,
  yamlTypeRegex,
  yamlTypeRegexShort,
  yamlTypeJoi,
  yamlTypeShortie,
  yamlTypeShortieShort,
  yamlTypeDate,
  yamlTypeFunction,
  yamlTypeError,
];

const YAMLSchema = DEFAULT_SCHEMA.extend(customYAMLFunctions);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadYAML(data: string): any {
  return load(data, { schema: YAMLSchema });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadYAMLFromFile(fileName: string): Promise<any> {
  return loadYAML(await fsPromiseReadFile(fileName, 'utf8'));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dumpYAML(data: any): string {
  return dump(data, {
    schema: YAMLSchema,
    flowLevel: -1,
    lineWidth: -1,
  });
}
