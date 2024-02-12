/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nunjucks from 'nunjucks';
import { AbstractTemplate } from './abstractTemplate';
import { escapeRegex } from '../regex';
import { arrayCompare } from '../array';
import type Joi from 'joi';
import { joiCustomErrorMessage, joiFindMetaValuePaths } from '../joi';
import { joiMetaDelayTemplatesResolutionKey } from './tpl.joi';

export interface NunjucksContext {
  lookup(name: string): any;

  setVariable(name: string, val: any): void;

  getVariables(): object;

  get ctx(): object;
}

const nunjucksCustomGlobals: Record<string, any> = {};
const nunjucksCustomFilters: Record<string, (...args: any[]) => any> = {};
const nunjucksCustomAsyncFilters: Record<string, (...args: any[]) => Promise<any>> = {};

export function nunjucksApplyCustomFunctions(env: nunjucks.Environment) {
  for (const key in nunjucksCustomGlobals) {
    env.addGlobal(key, nunjucksCustomGlobals[key]);
  }
  for (const key in nunjucksCustomFilters) {
    env.addFilter(key, nunjucksCustomFilters[key]);
  }
  for (const key in nunjucksCustomAsyncFilters) {
    env.addFilter(key, nunjucksCustomAsyncFilters[key], true);
  }
}

export function nunjucksAddGlobal(key: string, val: any) {
  nunjucksCustomGlobals[key] = val;
}

export function nunjucksAddFilter(key: string, val: (...args: any[]) => any) {
  nunjucksCustomFilters[key] = val;
}

export function nunjucksAddAsyncFilter(key: string, promiseFn: (...args: any[]) => Promise<any>) {
  nunjucksCustomAsyncFilters[key] = function (
    this: NunjucksContext,
    args: any,
    callback: (err: Error | undefined | null, res: any) => void
  ) {
    return promiseFn
      .call(this, args)
      .then((res: any) => {
        callback(null, res);
      })
      .catch((err) => {
        callback(err, null);
      });
  };
}

function initNunjucksEnvForkiwiProvider() {
  const nunjucksEnv = nunjucks.configure([], {
    autoescape: false,
    tags: { variableStart: '${{' },
  });

  nunjucksApplyCustomFunctions(nunjucksEnv);

  return nunjucksEnv;
}

export class TemplateRenderingError extends Error {
  readonly templateIsIfTemplate: boolean;
  readonly templateString: string;

  constructor(template: Template, cause: Error) {
    const templateString = template.toString();
    super(`${cause.name}: ${cause.message}\nTemplate: ${templateString}`);
    this.templateIsIfTemplate = template instanceof IfTemplate;
    this.templateString = templateString;
    this.cause = cause.cause;
    this.stack = cause.stack;
  }
}

const inTemplateContextToStringBegin = '[[__10I_TPL:5KZ5NrzNki86YKNc:';
const inTemplateContextToStringEnd = ':__TPL]]';
const inTemplateContextRegexStr =
  escapeRegex(inTemplateContextToStringBegin) + '(.+?)' + escapeRegex(inTemplateContextToStringEnd);

// ---
export class Template extends AbstractTemplate {
  static #nunjucksEnv: nunjucks.Environment;

  readonly #tpl: nunjucks.Template;
  readonly parseJSON: boolean;

  // Shared context cache
  static #renderContext?: any;

  constructor(value: string, parseJSON = false) {
    super(value);

    // Delay the initialization so that all globals and filters will be loaded
    if (Template.#nunjucksEnv == null) {
      Template.#nunjucksEnv = initNunjucksEnvForkiwiProvider();
    }

    // TODO support at-render-time environment, e.g. to fetch the inventory
    this.#tpl = nunjucks.compile(value, Template.#nunjucksEnv);
    this.parseJSON = parseJSON;
  }

  async render(context?: any): Promise<any> {
    /*
     * This is a beautiful hack. We cache the context whenever we render,
     * and if this template contains recursive templates, we can render them
     * via the toString() call using the provided context!
     */
    Template.#renderContext = context;

    try {
      const result = await new Promise<string>((res, rej) => {
        this.#tpl.render(context, (err: Error | null, val: string | null) => {
          if (err != null) {
            rej(new TemplateRenderingError(this, err));
            return;
          }
          res(val!);
        });
      });

      if (this.parseJSON) {
        return JSON.parse(result);
      }

      return result;
    } finally {
      Template.#renderContext = undefined;
    }
  }

  toString(): string {
    // We are in a render call
    if (Template.#renderContext) {
      return `${inTemplateContextToStringBegin}${this.original}${inTemplateContextToStringEnd}`;
    }

    return this.original;
  }

  toJSON(): string {
    return this.original;
  }
}

export function objectContainsTemplates(el: any): boolean {
  if (el instanceof AbstractTemplate) {
    return true;
  }

  if (Array.isArray(el)) {
    for (const objElement of el) {
      if (objectContainsTemplates(objElement)) {
        return true;
      }
    }
  }

  if (typeof el == 'object') {
    for (const objKey in el) {
      const value = el[objKey];
      if (objectContainsTemplates(value)) {
        return true;
      }
    }
  }

  return false;
}

// https://github.com/codsen/codsen/blob/main/packages/regex-is-jinja-nunjucks/src/main.ts
const tplRegex = /{%|\${{/i;

export function extractAllTemplates(el: any): any {
  if (el == null || el instanceof AbstractTemplate) {
    return el;
  }

  if (typeof el == 'string' && tplRegex.test(el)) {
    return new Template(el);
  }

  if (Array.isArray(el)) {
    const newArray = [];
    for (const objElement of el) {
      newArray.push(extractAllTemplates(objElement));
    }
    return newArray;
  }

  if (typeof el == 'object') {
    const newObject: Record<string, any> = {};
    for (const objKey in el) {
      const objValue = el[objKey];
      newObject[objKey] = extractAllTemplates(objValue);
    }
    return newObject;
  }

  return el;
}

export interface ResolveTemplatesOptions {
  nodePath?: string[];
  skipPaths?: string[][];
}

// This schema will be used to evaluate which templates to NOT resolve
export async function resolveTemplatesWithJoiSchema(el: any, tplArgs: any, schema: Joi.Schema): Promise<any> {
  const skipPaths = joiFindMetaValuePaths(schema.describe(), joiMetaDelayTemplatesResolutionKey, true, true);
  return resolveTemplates(el, tplArgs, {
    skipPaths,
  });
}

export async function resolveTemplates(el: any, tplArgs: any, options?: ResolveTemplatesOptions): Promise<any> {
  const nodePath = options?.nodePath ?? [];
  if ((options?.skipPaths ?? []).find((p) => arrayCompare(p, nodePath)) != null) {
    return el;
  }

  if (el instanceof AbstractTemplate) {
    let rendered = await el.render(tplArgs);
    // Process nested templates
    if (typeof rendered == 'string') {
      // while (inTemplateContextRegex.test(rendered)) {
      const re = new RegExp(inTemplateContextRegexStr, 'g');
      let match: RegExpMatchArray | null = null;
      while ((match = re.exec(rendered))) {
        const fullMatch = match[0];
        const tpl = match[1];
        const renderedTpl = (await resolveTemplates(extractAllTemplates(tpl), tplArgs)) as string;
        rendered =
          (rendered as string).substring(0, match.index) +
          renderedTpl +
          (rendered as string).substring(match.index! + fullMatch.length);
        re.lastIndex += renderedTpl.length - fullMatch.length;
      }
      // }
    }
    return rendered;
  }

  if (Array.isArray(el)) {
    const newArray = [];
    let i = 0;
    for (const objElement of el) {
      if (objectContainsTemplates(objElement)) {
        newArray.push(
          await resolveTemplates(objElement, tplArgs, {
            nodePath: [...nodePath, `${i}`],
            skipPaths: options?.skipPaths,
          })
        );
      } else {
        newArray.push(objElement);
      }
      i++;
    }
    return newArray;
  }

  if (typeof el == 'object') {
    const newObject: Record<string, any> = {};

    for (const objKey in el) {
      const objValue = el[objKey];
      if (objectContainsTemplates(objValue)) {
        newObject[objKey] = await resolveTemplates(objValue, tplArgs, {
          nodePath: [...nodePath, objKey],
          skipPaths: options?.skipPaths,
        });
      } else {
        newObject[objKey] = objValue;
      }
    }
    return newObject;
  }

  return el;
}

export class IfTemplate extends Template {
  constructor(condition: string) {
    super(`{% if ${condition} %}true{% else %}false{% endif %}`, true);
  }

  async isTrue(context?: any): Promise<boolean> {
    return (await this.render(context)) == true;
  }
}

export function joiValidateValidIfTemplate(val: string, helpers: Joi.CustomHelpers<string>): Joi.ErrorReport | string {
  try {
    new IfTemplate(val);
  } catch (err) {
    return joiCustomErrorMessage(helpers, 'The string must be a valid nunjucks condition');
  }
  return val;
}
