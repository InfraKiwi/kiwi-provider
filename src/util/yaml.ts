/* eslint @typescript-eslint/no-base-to-string: 0 */

import type { TypeConstructorOptions } from 'js-yaml';
import { DEFAULT_SCHEMA, dump, load, Type } from 'js-yaml';
import { Template } from './tpl';

import { TemplateEval } from './tpl/templateEval';
import { TemplateJoi } from './tpl/templateJoi';
import Joi from 'joi';
import { isShortie, shortieToObject } from './shortie';
import { fsPromiseReadFile } from './fs';

// ---

const yamlTypeTpl = new Type('tag:yaml.org,2002:tpl', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new Template(data);

    /*
     * try {
     *   new Template(data);
     * } catch (err) {
     *   return false;
     * }
     */
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
});

const yamlTypeTplJSON = new Type('tag:yaml.org,2002:tplJSON', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new Template(data, true);

    /*
     * try {
     *   new Template(data, true);
     * } catch (err) {
     *   return false;
     * }
     */
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
});

const yamlTypeCtorRegex: TypeConstructorOptions = {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new RegExp(data);

    /*
     * try {
     *   new RegExp(data);
     * } catch (err) {
     *   return false;
     * }
     */
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

const yamlTypeRegex = new Type('tag:yaml.org,2002:regex', yamlTypeCtorRegex);
const yamlTypeRegexShort = new Type('tag:yaml.org,2002:re', yamlTypeCtorRegex);

const yamlTypeJSON = new Type('tag:yaml.org,2002:json', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new Template(data, true);

    /*
     * try {
     *   new Template(data, true);
     * } catch (err) {
     *   return false;
     * }
     */
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
});

const yamlTypeEval = new Type('tag:yaml.org,2002:eval', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    new TemplateEval(data);

    /*
     * try {
     *   new TemplateEval(data);
     * } catch (err) {
     *   return false;
     * }
     */
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

const yamlTypeJoi = new Type('tag:yaml.org,2002:joi', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    Joi.isSchema(new TemplateJoi(data).render({}));

    /*
     * try {
     *   Joi.isSchema(new TemplateJoi(data).render({}));
     * } catch (err) {
     *   return false;
     * }
     */
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct: (data: any): any => {
    return new TemplateJoi(data).render({});
  },
  predicate: (data: object): boolean => {
    return Joi.isSchema(data);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent: (data: object): any => {
    return data.toString();
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

const yamlTypeShortie = new Type('tag:yaml.org,2002:shortie', yamlTypeCtorShortie);
const yamlTypeShortieShort = new Type('tag:yaml.org,2002:s', yamlTypeCtorShortie);

// ---

const customYAMLFunctions: Type[] = [
  yamlTypeTpl,
  yamlTypeTplJSON,
  yamlTypeEval,
  yamlTypeJSON,
  yamlTypeRegex,
  yamlTypeRegexShort,
  yamlTypeJoi,
  yamlTypeShortie,
  yamlTypeShortieShort,
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
  return dump(data, { schema: YAMLSchema });
}
