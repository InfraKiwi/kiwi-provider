/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nunjucks from 'nunjucks';
import { AbstractTemplate } from './abstractTemplate';

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

function initNunjucksEnvFor10infraConfig() {
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

// ---
export class Template extends AbstractTemplate {
  static #nunjucksEnv: nunjucks.Environment;

  readonly #tpl: nunjucks.Template;
  readonly parseJSON: boolean;

  constructor(value: string, parseJSON?: boolean) {
    super(value);

    // Delay the initialization so that all globals and filters will be loaded
    if (Template.#nunjucksEnv == null) {
      Template.#nunjucksEnv = initNunjucksEnvFor10infraConfig();
    }

    // TODO support at-render-time environment, e.g. to fetch the inventory
    this.#tpl = nunjucks.compile(value, Template.#nunjucksEnv);
    this.parseJSON = parseJSON ?? false;
  }

  async render(context?: any): Promise<any> {
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
  }

  toString(): string {
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

export async function resolveTemplates(el: any, tplArgs: any): Promise<any> {
  if (el instanceof AbstractTemplate) {
    return await el.render(tplArgs);
  }

  if (Array.isArray(el)) {
    const newArray = [];
    for (const objElement of el) {
      if (objectContainsTemplates(objElement)) {
        newArray.push(await resolveTemplates(objElement, tplArgs));
      } else {
        newArray.push(objElement);
      }
    }
    return newArray;
  }

  if (typeof el == 'object') {
    const newObject: Record<string, any> = {};

    for (const objKey in el) {
      const objValue = el[objKey];
      if (objectContainsTemplates(objValue)) {
        newObject[objKey] = await resolveTemplates(objValue, tplArgs);
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
