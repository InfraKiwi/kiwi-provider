import type { TypeConstructorOptions } from 'js-yaml';
import { DEFAULT_SCHEMA, dump, load, Type } from 'js-yaml';
import { newDebug } from './debug';
import { Template } from './tpl';

import { TemplateEval } from './tpl/templateEval';
import { TemplateJoi } from './tpl/templateJoi';
import Joi from 'joi';

const debug = newDebug(__filename);

// ---

const yamlTypeTpl = new Type('tag:yaml.org,2002:tpl', {
  kind: 'scalar',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any): boolean => {
    if (typeof data != 'string') {
      return false;
    }
    try {
      new Template(data);
    } catch (err) {
      return false;
    }
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
    try {
      new Template(data, true);
    } catch (err) {
      return false;
    }
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
    try {
      new RegExp(data);
    } catch (err) {
      return false;
    }
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
    try {
      new Template(data, true);
    } catch (err) {
      return false;
    }
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
    try {
      new TemplateEval(data);
    } catch (err) {
      return false;
    }
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
    try {
      Joi.isSchema(new TemplateJoi(data).render({}));
    } catch (err) {
      return false;
    }
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

// ---

const customYAMLFunctions: Type[] = [
  yamlTypeTpl,
  yamlTypeTplJSON,
  yamlTypeEval,
  yamlTypeJSON,
  yamlTypeRegex,
  yamlTypeRegexShort,
  yamlTypeJoi,
];

const YAMLSchema = DEFAULT_SCHEMA.extend(customYAMLFunctions);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadYAML(data: string): any {
  return load(data, { schema: YAMLSchema });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dumpYAML(data: any): string {
  return dump(data, { schema: YAMLSchema });
}
